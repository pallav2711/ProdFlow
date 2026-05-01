/**
 * DashboardContext
 *
 * PERFORMANCE FIXES:
 * 1. Removed N+1 sprint detail fetches — was doing api.get(`/sprints/${id}`)
 *    for every sprint in the list. AllTeamTasks now uses the dedicated
 *    /sprints/all-tasks endpoint to fetch all team tasks.
 * 2. Navigation refresh guard — only refetches when data is actually stale
 *    (was always force-fetching on every route change).
 * 3. useMemo on the context value — prevents all consumers from re-rendering
 *    when unrelated state changes.
 * 4. Removed setTimeout(() => fetchDashboardData(true), 1000) after mutations —
 *    optimistic update is sufficient; server sync happens on next navigation.
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useLocation } from 'react-router-dom'
import api from '../api/config'

const DashboardContext = createContext()

export const useDashboard = () => {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}

const EMPTY = {
  stats: { products: 0, sprints: 0, activeSprints: 0, completedSprints: 0, myTasks: 0, completedTasks: 0 },
  myTasks: [],
  allTasks: [],
  sprints: [],
  pagination: { products: null, sprints: null, myTasks: null, allTasks: null },
  loading: false,
  lastFetch: null,
  error: null,
}

const CACHE_DURATION = 60 * 1000 // 1 minute

const DASHBOARD_PAGES = new Set([
  '/dashboard', '/my-tasks', '/all-team-tasks',
  '/sprint-history', '/product-planning', '/sprint-planner',
])

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()
  const [data, setData] = useState(EMPTY)

  const isStale = useCallback((d = data) => {
    if (!d.lastFetch) return true
    return Date.now() - d.lastFetch > CACHE_DURATION
  }, [data])

  const toPaginationParams = (cfg) => {
    if (!cfg) return undefined
    return { page: Number(cfg.page || 1), limit: Number(cfg.limit || 20) }
  }

  const fetchDashboardData = useCallback(async (forceRefresh = false, options = {}) => {
    if (!user) return data
    if (!forceRefresh && !isStale() && data.sprints.length > 0) return data

    setData(prev => ({ ...prev, loading: true, error: null }))

    try {
      const sprintsParams  = toPaginationParams(options?.pagination?.sprints)
      const productsParams = toPaginationParams(options?.pagination?.products)
      const myTasksParams  = toPaginationParams(options?.pagination?.myTasks)
      const allTasksParams = toPaginationParams(options?.pagination?.allTasks)

      // 4 parallel requests — fetch all team tasks for team leads
      const [sprintsRes, productsRes, myTasksRes, allTasksRes] = await Promise.all([
        api.get('/sprints',          { params: sprintsParams }),
        api.get('/products',         { params: productsParams }),
        api.get('/sprints/my-tasks', { params: myTasksParams }),
        api.get('/sprints/all-tasks', { params: allTasksParams }),
      ])

      const sprintsData = sprintsRes.data.sprints  || []
      const userTasks   = myTasksRes.data.tasks    || []
      const allTasksData = allTasksRes.data.tasks  || []

      const newData = {
        stats: {
          products:        productsRes.data.count || 0,
          sprints:         sprintsRes.data.totalCount || sprintsData.length,
          activeSprints:   sprintsData.filter(s => s.status === 'Active').length,
          completedSprints:sprintsData.filter(s => s.status === 'Completed').length,
          myTasks:         userTasks.length,
          completedTasks:  userTasks.filter(t => t.status === 'Completed').length,
        },
        myTasks:   userTasks,
        allTasks:  allTasksData,
        sprints:   sprintsData,
        pagination: {
          products: productsRes.data?.totalCount != null ? {
            totalCount: productsRes.data.totalCount,
            page: productsRes.data.page,
            limit: productsRes.data.limit,
            totalPages: productsRes.data.totalPages,
          } : null,
          sprints: sprintsRes.data?.totalCount != null ? {
            totalCount: sprintsRes.data.totalCount,
            page: sprintsRes.data.page,
            limit: sprintsRes.data.limit,
            totalPages: sprintsRes.data.totalPages,
          } : null,
          myTasks: myTasksRes.data?.totalCount != null ? {
            totalCount: myTasksRes.data.totalCount,
            page: myTasksRes.data.page,
            limit: myTasksRes.data.limit,
            totalPages: myTasksRes.data.totalPages,
          } : null,
          allTasks: allTasksRes.data?.totalCount != null ? {
            totalCount: allTasksRes.data.totalCount,
            page: allTasksRes.data.page,
            limit: allTasksRes.data.limit,
            totalPages: allTasksRes.data.totalPages,
          } : null,
        },
        loading:   false,
        lastFetch: Date.now(),
        error:     null,
      }

      setData(newData)
      return newData
    } catch (err) {
      const errData = { ...EMPTY, loading: false, lastFetch: Date.now(), error: err.response?.data?.message || err.message || 'Failed to fetch' }
      setData(errData)
      throw err
    }
  }, [user, data, isStale])

  const updateTaskStatus = useCallback(async (taskId, newStatus, reviewNotes = null) => {
    if (!user) throw new Error('User not authenticated')

    const res = await api.put(`/sprints/tasks/${taskId}`, {
      status: newStatus,
      ...(reviewNotes && { reviewNotes }),
    })

    // Optimistic update — no background refetch needed
    setData(prev => {
      const patch = t => t._id === taskId ? { ...t, status: newStatus, reviewNotes } : t
      const updatedMy  = prev.myTasks.map(patch)
      const updatedAll = prev.allTasks.map(patch)
      return {
        ...prev,
        myTasks:  updatedMy,
        allTasks: updatedAll,
        stats: { ...prev.stats, completedTasks: updatedMy.filter(t => t.status === 'Completed').length },
      }
    })

    return res.data
  }, [user])

  const approveTask = useCallback((taskId) =>
    updateTaskStatus(taskId, 'Completed', 'Approved by Team Lead'), [updateTaskStatus])

  const rejectTask = useCallback(async (taskId, reviewNotes) => {
    if (!user) throw new Error('User not authenticated')
    await api.put(`/sprints/tasks/${taskId}/reject`, { reviewNotes })
    setData(prev => {
      const patch = t => t._id === taskId ? { ...t, status: 'In Progress', reviewNotes } : t
      return { ...prev, myTasks: prev.myTasks.map(patch), allTasks: prev.allTasks.map(patch) }
    })
  }, [user])

  const clearCache = useCallback(() => setData(EMPTY), [])

  // Initial load
  useEffect(() => {
    if (user) fetchDashboardData(true)
    else clearCache()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation refresh — only when stale
  useEffect(() => {
    if (user && DASHBOARD_PAGES.has(location.pathname) && isStale()) {
      fetchDashboardData(false)
    }
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Visibility refresh
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && user && isStale()) fetchDashboardData(false)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [user, isStale, fetchDashboardData])

  // Stable context value — only changes when data actually changes
  const value = useMemo(() => ({
    ...data,
    isDataStale: isStale(),
    fetchDashboardData,
    updateTaskStatus,
    approveTask,
    rejectTask,
    clearCache,
  }), [data, isStale, fetchDashboardData, updateTaskStatus, approveTask, rejectTask, clearCache])

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}
