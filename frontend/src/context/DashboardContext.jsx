import { createContext, useContext, useState, useEffect } from 'react'
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

  // Cache duration: 1 minute (shorter for better real-time updates)
  const CACHE_DURATION = 1 * 60 * 1000

  const isDataStale = () => {
    if (!dashboardData.lastFetch) return true
    return Date.now() - dashboardData.lastFetch > CACHE_DURATION
  }

  const fetchDashboardData = async (forceRefresh = false) => {
    // Don't fetch if data is fresh and not forcing refresh
    if (!forceRefresh && !isDataStale() && dashboardData.sprints.length > 0) {
      console.log('Using cached dashboard data')
      return dashboardData
    }

    console.log('Fetching fresh dashboard data...')
    setDashboardData(prev => ({ ...prev, loading: true, error: null }))

    try {
      const [sprintsRes, productsRes, myTasksRes] = await Promise.all([
        api.get('/sprints'),
        api.get('/products'),
        api.get('/sprints/my-tasks')
      ])
      
      const sprintsData = sprintsRes.data.sprints
      
      // Fetch all tasks from all sprints for "All Team Tasks" tab
      const allTasksPromises = sprintsData.map(sprint =>
        api.get(`/sprints/${sprint._id}`).catch(err => {
          console.error(`Error fetching sprint ${sprint._id}:`, err)
          return { data: { tasks: [] } }
        })
      )
      
      const tasksResults = await Promise.all(allTasksPromises)
      const allTasksData = tasksResults.flatMap(res => res.data.tasks || [])
      
      // Use the dedicated endpoint for user's tasks
      const userTasks = myTasksRes.data.tasks || []
      
      const newStats = {
        products: productsRes.data.count,
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
      console.log('Dashboard data updated successfully')
      return newData
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch dashboard data'
      }))
      throw error
    }
  }

  const updateTaskStatus = async (taskId, newStatus, reviewNotes = null) => {
    try {
      const response = await api.put(`/sprints/tasks/${taskId}`, { 
        status: newStatus,
        ...(reviewNotes && { reviewNotes })
      })
      
      // Update local state immediately for better UX
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

      // Refresh data from server to ensure consistency
      setTimeout(() => fetchDashboardData(true), 1000)
      
      return response.data
    } catch (error) {
      console.error('Error updating task status:', error)
      throw error
    }
  }

  const approveTask = async (taskId) => {
    return updateTaskStatus(taskId, 'Completed', 'Approved by Team Lead')
  }

  const rejectTask = async (taskId, reviewNotes) => {
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
      setTimeout(() => fetchDashboardData(true), 1000)
    } catch (error) {
      console.error('Error rejecting task:', error)
      throw error
    }
  }

  const clearCache = () => {
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
  }

  // Auto-refresh data when user changes
  useEffect(() => {
    if (user) {
      fetchDashboardData(true)
    } else {
      clearCache()
    }
  }, [user])

  // Auto-refresh data when navigating to dashboard-related pages
  useEffect(() => {
    const dashboardPages = ['/dashboard', '/my-tasks', '/all-team-tasks', '/sprint-history', '/product-planning', '/sprint-planner']
    
    if (user && dashboardPages.includes(location.pathname)) {
      console.log(`Navigated to ${location.pathname}, checking data freshness...`)
      
      // Always fetch fresh data on navigation to ensure real-time updates
      if (isDataStale() || dashboardData.sprints.length === 0) {
        console.log('Data is stale or empty, fetching fresh data...')
        fetchDashboardData(true)
      }
    }
  }, [location.pathname, user])

  // Auto-refresh stale data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isDataStale()) {
        console.log('Page became visible, refreshing stale data')
        fetchDashboardData(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  const value = {
    ...dashboardData,
    fetchDashboardData,
    updateTaskStatus,
    approveTask,
    rejectTask,
    clearCache,
    isDataStale: isDataStale()
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}