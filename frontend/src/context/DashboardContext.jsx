import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { useLocation } from 'react-router-dom'
import api from '../api/config'

const DashboardContext = createContext()

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()
  const [dashboardData, setDashboardData] = useState({
    stats: {
      products: 0,
      sprints: 0,
      activeSprints: 0,
      completedSprints: 0,
      myTasks: 0,
      completedTasks: 0
    },
    myTasks: [],
    allTasks: [],
    sprints: [],
    loading: false,
    lastFetch: null,
    error: null
  })

  // Optimized cache duration based on data type
  const CACHE_DURATIONS = {
    stats: 2 * 60 * 1000,      // 2 minutes for stats
    tasks: 1 * 60 * 1000,      // 1 minute for tasks (more dynamic)
    sprints: 3 * 60 * 1000,    // 3 minutes for sprints
    default: 2 * 60 * 1000     // 2 minutes default
  }

  // Memoized function to check if data is stale
  const isDataStale = useCallback((dataType = 'default') => {
    if (!dashboardData.lastFetch) return true
    const cacheDuration = CACHE_DURATIONS[dataType] || CACHE_DURATIONS.default
    return Date.now() - dashboardData.lastFetch > cacheDuration
  }, [dashboardData.lastFetch])

  // Optimized data fetching with parallel requests and error handling
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    // Don't fetch if data is fresh and not forcing refresh
    if (!forceRefresh && !isDataStale() && dashboardData.sprints.length > 0) {
      console.log('📦 Using cached dashboard data')
      return dashboardData
    }

    console.log('🔄 Fetching fresh dashboard data...')
    setDashboardData(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Parallel API calls for better performance
      const [sprintsRes, productsRes, myTasksRes] = await Promise.allSettled([
        api.get('/sprints'),
        api.get('/products'),
        api.get('/sprints/my-tasks')
      ])
      
      // Handle individual request failures gracefully
      const sprintsData = sprintsRes.status === 'fulfilled' ? sprintsRes.value.data.sprints : []
      const productsData = sprintsRes.status === 'fulfilled' ? productsRes.value.data : { count: 0 }
      const userTasks = myTasksRes.status === 'fulfilled' ? myTasksRes.value.data.tasks : []
      
      // Batch fetch all tasks with optimized parallel processing
      const taskPromises = sprintsData.map(sprint =>
        api.get(`/sprints/${sprint._id}`).catch(err => {
          console.warn(`Failed to fetch sprint ${sprint._id}:`, err.message)
          return { data: { tasks: [] } }
        })
      )
      
      const tasksResults = await Promise.allSettled(taskPromises)
      const allTasksData = tasksResults
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value.data.tasks || [])
      
      // Optimized stats calculation
      const newStats = {
        products: productsData.count || 0,
        sprints: sprintsData.length,
        activeSprints: sprintsData.filter(s => s.status === 'Active').length,
        completedSprints: sprintsData.filter(s => s.status === 'Completed').length,
        myTasks: userTasks.length,
        completedTasks: userTasks.filter(t => t.status === 'Completed').length
      }

      const newData = {
        stats: newStats,
        myTasks: userTasks,
        allTasks: allTasksData,
        sprints: sprintsData,
        loading: false,
        lastFetch: Date.now(),
        error: null
      }

      setDashboardData(newData)
      console.log('✅ Dashboard data updated successfully')
      return newData
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard data'
      
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [dashboardData, isDataStale])

  // Optimized task status update with optimistic updates
  const updateTaskStatus = useCallback(async (taskId, newStatus, reviewNotes = null) => {
    try {
      // Optimistic update for better UX
      setDashboardData(prev => {
        const updatedMyTasks = prev.myTasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus, reviewNotes } : task
        )
        const updatedAllTasks = prev.allTasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus, reviewNotes } : task
        )
        
        // Recalculate stats
        const newStats = {
          ...prev.stats,
          completedTasks: updatedMyTasks.filter(t => t.status === 'Completed').length
        }

        return {
          ...prev,
          myTasks: updatedMyTasks,
          allTasks: updatedAllTasks,
          stats: newStats
        }
      })

      // Make API call
      const response = await api.put(`/sprints/tasks/${taskId}`, { 
        status: newStatus,
        ...(reviewNotes && { reviewNotes })
      })
      
      // Refresh data from server after a delay to ensure consistency
      setTimeout(() => fetchDashboardData(true), 1500)
      
      return response.data
    } catch (error) {
      console.error('❌ Error updating task status:', error)
      // Revert optimistic update on error
      fetchDashboardData(true)
      throw error
    }
  }, [fetchDashboardData])

  // Optimized approve task function
  const approveTask = useCallback(async (taskId) => {
    return updateTaskStatus(taskId, 'Completed', 'Approved by Team Lead')
  }, [updateTaskStatus])

  // Optimized reject task function
  const rejectTask = useCallback(async (taskId, reviewNotes) => {
    try {
      await api.put(`/sprints/tasks/${taskId}/reject`, { reviewNotes })
      
      // Update local state
      setDashboardData(prev => {
        const updatedMyTasks = prev.myTasks.map(task => 
          task._id === taskId ? { ...task, status: 'To Do', reviewNotes } : task
        )
        const updatedAllTasks = prev.allTasks.map(task => 
          task._id === taskId ? { ...task, status: 'To Do', reviewNotes } : task
        )

        return {
          ...prev,
          myTasks: updatedMyTasks,
          allTasks: updatedAllTasks
        }
      })

      // Refresh data from server
      setTimeout(() => fetchDashboardData(true), 1500)
    } catch (error) {
      console.error('❌ Error rejecting task:', error)
      throw error
    }
  }, [fetchDashboardData])

  // Clear cache function
  const clearCache = useCallback(() => {
    setDashboardData({
      stats: {
        products: 0,
        sprints: 0,
        activeSprints: 0,
        completedSprints: 0,
        myTasks: 0,
        completedTasks: 0
      },
      myTasks: [],
      allTasks: [],
      sprints: [],
      loading: false,
      lastFetch: null,
      error: null
    })
  }, [])

  // Auto-refresh data when user changes
  useEffect(() => {
    if (user) {
      fetchDashboardData(true)
    } else {
      clearCache()
    }
  }, [user, fetchDashboardData, clearCache])

  // Auto-refresh data when navigating to dashboard-related pages
  useEffect(() => {
    const dashboardPages = ['/dashboard', '/my-tasks', '/all-team-tasks', '/sprint-history', '/product-planning', '/sprint-planner']
    
    if (user && dashboardPages.includes(location.pathname)) {
      console.log(`📍 Navigated to ${location.pathname}, checking data freshness...`)
      
      // Check if data needs refresh based on page type
      const needsRefresh = location.pathname.includes('tasks') 
        ? isDataStale('tasks') 
        : isDataStale('sprints')
      
      if (needsRefresh || dashboardData.sprints.length === 0) {
        console.log('🔄 Data is stale or empty, fetching fresh data...')
        fetchDashboardData(true)
      }
    }
  }, [location.pathname, user, isDataStale, dashboardData.sprints.length, fetchDashboardData])

  // Auto-refresh stale data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isDataStale()) {
        console.log('👁️ Page became visible, refreshing stale data')
        fetchDashboardData(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, isDataStale, fetchDashboardData])

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...dashboardData,
    fetchDashboardData,
    updateTaskStatus,
    approveTask,
    rejectTask,
    clearCache,
    isDataStale: isDataStale()
  }), [
    dashboardData,
    fetchDashboardData,
    updateTaskStatus,
    approveTask,
    rejectTask,
    clearCache,
    isDataStale
  ])

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}