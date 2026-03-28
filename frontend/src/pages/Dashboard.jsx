import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'
import { useToast } from '../context/ToastContext'
import PageHeader from '../components/PageHeader'
import PaginationControls from '../components/PaginationControls'
import { StatusIcon, WorkTypeIcon } from '../components/AppIcons'

const Dashboard = () => {
  const { user } = useAuth()
  const {
    stats,
    myTasks,
    allTasks,
    sprints,
    loading,
    error,
    fetchDashboardData,
    updateTaskStatus,
    approveTask,
    rejectTask,
    isDataStale
  } = useDashboard()
  const { showToast } = useToast()
  
  const [activeTab, setActiveTab] = useState('myTasks') // 'myTasks' or 'allTasks'
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'To Do', 'In Progress', 'Completed', 'Blocked'
  const [sprintPage, setSprintPage] = useState(1)
  const [rejectModalTaskId, setRejectModalTaskId] = useState(null)
  const [reviewNotesInput, setReviewNotesInput] = useState('')
  const SPRINTS_PAGE_SIZE = 15

  const refreshDashboard = (force = true) =>
    fetchDashboardData(force, {
      pagination: {
        sprints: { page: sprintPage, limit: SPRINTS_PAGE_SIZE }
      }
    })

  // Fetch data when component mounts or when data is stale
  useEffect(() => {
    if (user) {
      console.log('Dashboard mounted, fetching data...')
      // Always fetch fresh data when navigating to dashboard
      refreshDashboard(true)
    }
  }, [user, sprintPage])

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await updateTaskStatus(taskId, newStatus)
      
      if (response.sprintCompleted) {
        showToast('Task updated! All tasks completed - Sprint marked as Completed!', 'success')
      } else {
        showToast('Task status updated successfully!', 'success')
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating task status', 'error')
    }
  }

  const handleApproveTask = async (taskId) => {
    try {
      const response = await approveTask(taskId)
      
      if (response.sprintCompleted) {
        showToast('Task approved! All tasks completed - Sprint marked as Completed!', 'success')
      } else {
        showToast('Task approved successfully!', 'success')
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error approving task', 'error')
    }
  }

  const handleRejectTask = async () => {
    if (!rejectModalTaskId) return
    const reviewNotes = reviewNotesInput.trim()
    if (!reviewNotes) {
      showToast('Please provide feedback before rejecting.', 'error')
      return
    }
    try {
      await rejectTask(rejectModalTaskId, reviewNotes)
      setRejectModalTaskId(null)
      setReviewNotesInput('')
      showToast('Task sent back for revision.', 'success')
    } catch (error) {
      showToast(error.response?.data?.message || 'Error rejecting task', 'error')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100 text-gray-700'
      case 'In Progress':
        return 'bg-blue-100 text-blue-700'
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-700'
      case 'Completed':
        return 'bg-green-100 text-green-700'
      case 'Blocked':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => <StatusIcon status={status} />
  const getWorkTypeIcon = (workType) => <WorkTypeIcon workType={workType} />

  const getWorkTypeColor = (workType) => {
    switch (workType) {
      case 'Frontend':
        return 'bg-purple-100 text-purple-700'
      case 'Backend':
        return 'bg-blue-100 text-blue-700'
      case 'Database':
        return 'bg-cyan-100 text-cyan-700'
      case 'UI/UX Design':
        return 'bg-pink-100 text-pink-700'
      case 'DevOps':
        return 'bg-orange-100 text-orange-700'
      case 'Testing':
        return 'bg-teal-100 text-teal-700'
      case 'Full Stack':
        return 'bg-indigo-100 text-indigo-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredTasks = (tasks) => {
    if (filterStatus === 'all') return tasks
    return tasks.filter(task => task.status === filterStatus)
  }

  const getSprintStatusColor = (status) => {
    switch (status) {
      case 'Planning':
        return 'bg-blue-100 text-blue-700'
      case 'Active':
        return 'bg-indigo-100 text-indigo-700'
      case 'Completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getSprintStatusIcon = (status) => <StatusIcon status={status} />

  // Team Lead Dashboard - Show Sprint Overview (No Personal Tasks)
  if (user.role === 'Team Lead') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <PageHeader
          title={`Welcome back, ${user.name}!`}
          subtitle="Team Lead Dashboard - Sprint Overview"
          rightContent={
            isDataStale ? (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                Data may be outdated
              </span>
            ) : null
          }
        />
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm font-medium">Error loading dashboard data</p>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={() => refreshDashboard(true)}
                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium underline"
              >
                Try again
              </button>
            </div>
          )}

        {/* Stats Cards — aligned with Product Manager dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Products</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.products}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Sprints</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.sprints}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Active Sprints</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.activeSprints}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Completed Sprints</h3>
                <p className="text-3xl font-bold text-emerald-600">{stats.completedSprints}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Sprints Overview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Sprints Overview</h2>
            <p className="text-sm text-gray-600 mt-1">View all sprints with features and team assignments</p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading sprints...</p>
              </div>
            ) : sprints.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 font-medium">No sprints yet</p>
                <p className="text-gray-500 text-sm mt-1">Create your first sprint in Sprint Planner</p>
                {user.role === 'Team Lead' && (
                  <Link
                    to="/sprint-planner"
                    className="inline-flex mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-gray-800 transition-colors"
                  >
                    Go to Sprint Planner
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {sprints.map((sprint) => (
                  <SprintCard key={sprint._id} sprint={sprint} />
                ))}
              </div>
            )}

            {stats.sprints > sprints.length && (
              <PaginationControls
                currentPage={sprintPage}
                totalPages={Math.max(sprintPage + (sprints.length < SPRINTS_PAGE_SIZE ? 0 : 1), 1)}
                label="Sprint page"
                onPrevious={() => setSprintPage((prev) => Math.max(prev - 1, 1))}
                onNext={() => setSprintPage((prev) => prev + 1)}
                canPrevious={!loading && sprintPage > 1}
                canNext={!loading && sprints.length >= SPRINTS_PAGE_SIZE}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Product Manager Dashboard - Show Sprints Overview
  if (user.role === 'Product Manager') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <PageHeader
          title={`Welcome back, ${user.name}!`}
          subtitle="Product Manager Dashboard - Sprint Overview"
          rightContent={
            isDataStale ? (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                Data may be outdated
              </span>
            ) : null
          }
        />
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm font-medium">Error loading dashboard data</p>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={() => refreshDashboard(true)}
                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium underline"
              >
                Try again
              </button>
            </div>
          )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Products</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.products}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Sprints</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.sprints}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Active Sprints</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.activeSprints}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Completed Sprints</h3>
                <p className="text-3xl font-bold text-emerald-600">{stats.completedSprints}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Sprints Overview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Sprints Overview</h2>
            <p className="text-sm text-gray-600 mt-1">View all sprints with features and team assignments</p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading sprints...</p>
              </div>
            ) : sprints.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 font-medium">No sprints yet</p>
                <p className="text-gray-500 text-sm mt-1">Create your first sprint in Sprint Planner</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sprints.map((sprint) => (
                  <SprintCard key={sprint._id} sprint={sprint} />
                ))}
              </div>
            )}

            {stats.sprints > sprints.length && (
              <PaginationControls
                currentPage={sprintPage}
                totalPages={Math.max(sprintPage + (sprints.length < SPRINTS_PAGE_SIZE ? 0 : 1), 1)}
                label="Sprint page"
                onPrevious={() => setSprintPage((prev) => Math.max(prev - 1, 1))}
                onNext={() => setSprintPage((prev) => prev + 1)}
                canPrevious={!loading && sprintPage > 1}
                canNext={!loading && sprints.length >= SPRINTS_PAGE_SIZE}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Sprint Card Component for Product Manager
  function SprintCard({ sprint }) {
    const [sprintDetails, setSprintDetails] = useState(null)
    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchSprintDetails = async () => {
      if (expanded) {
        setExpanded(false)
        return
      }

      setLoading(true)
      try {
        // Import api dynamically to avoid circular dependency
        const { default: api } = await import('../api/config')
        const res = await api.get(`/sprints/${sprint._id}`)
        setSprintDetails(res.data)
        setExpanded(true)
      } catch (error) {
        console.error('Error fetching sprint details:', error)
        showToast('Error loading sprint details', 'error')
      } finally {
        setLoading(false)
      }
    }

    // Group tasks by feature
    const tasksByFeature = {}
    if (sprintDetails?.tasks) {
      sprintDetails.tasks.forEach(task => {
        const featureName = task.feature?.name || 'Unassigned'
        if (!tasksByFeature[featureName]) {
          tasksByFeature[featureName] = []
        }
        tasksByFeature[featureName].push(task)
      })
    }

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Sprint Header */}
        <div 
          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={fetchSprintDetails}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{sprint.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSprintStatusColor(sprint.status)}`}>
                  {getSprintStatusIcon(sprint.status)} {sprint.status}
                </span>
                {sprint.aiPrediction?.successProbability && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    AI: {sprint.aiPrediction.successProbability}% success
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {sprint.product?.name}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {sprint.duration} days
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Team: {sprint.teamSize}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {sprint.features?.length || 0} features
                </span>
              </div>
            </div>
            <div className="ml-4">
              <svg 
                className={`w-6 h-6 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sprint Details (Expanded) */}
        {expanded && (
          <div className="p-6 border-t border-gray-200 bg-white">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Features and Tasks */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    Features & Team Assignments
                  </h4>
                  
                  {Object.keys(tasksByFeature).length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No tasks assigned yet</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(tasksByFeature).map(([featureName, tasks]) => (
                        <div key={featureName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h5 className="font-semibold text-gray-900 mb-3">{featureName}</h5>
                          <div className="space-y-2">
                            {tasks.map((task) => (
                              <div key={task._id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                <div className="flex items-center gap-3 flex-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkTypeColor(task.workType)}`}>
                                    {getWorkTypeIcon(task.workType)} {task.workType}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {task.assignedTo?.name || 'Unassigned'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {task.estimatedHours}h
                                  </span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                  {getStatusIcon(task.status)} {task.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sprint Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {sprintDetails?.tasks?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {sprintDetails?.tasks?.filter(t => t.status === 'Completed').length || 0}
                    </p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {sprintDetails?.tasks?.filter(t => t.status === 'In Progress' || t.status === 'Pending Review').length || 0}
                    </p>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <PageHeader
        title={`Welcome back, ${user.name}!`}
        subtitle="Here's what's happening with your projects"
        rightContent={
          isDataStale ? (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Data may be outdated
            </span>
          ) : null
        }
      />
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm font-medium">Error loading dashboard data</p>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={() => refreshDashboard(true)}
              className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Stats Cards — aligned with Product Manager dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">My Tasks</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.myTasks}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Completed Tasks</h3>
                <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Active Sprints</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.activeSprints}</p>
                <p className="text-xs text-gray-500 mt-1">of {stats.sprints} total</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Completed Sprints</h3>
                <p className="text-3xl font-bold text-emerald-600">{stats.completedSprints}</p>
                <p className="text-xs text-gray-500 mt-1">All tasks done</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
          <p className="text-sm text-gray-600 mt-1">Switch between your work and the full team backlog</p>
        </div>
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex overflow-x-auto -mb-px gap-1">
            <button
              onClick={() => setActiveTab('myTasks')}
              className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 -mb-px touch-target ${
                activeTab === 'myTasks'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Tasks ({myTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('allTasks')}
              className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 -mb-px touch-target ${
                activeTab === 'allTasks'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All Team Tasks ({allTasks.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-gray-700 shrink-0">Filter by status:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-target ${
                  filterStatus === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('To Do')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-target ${
                  filterStatus === 'To Do'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                To Do
              </button>
              <button
                onClick={() => setFilterStatus('In Progress')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-target ${
                  filterStatus === 'In Progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('Completed')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-target ${
                  filterStatus === 'Completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilterStatus('Blocked')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-target ${
                  filterStatus === 'Blocked'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Blocked
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="p-6">
          {activeTab === 'myTasks' ? (
            filteredTasks(myTasks).length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-gray-600 font-medium">No tasks assigned to you yet</p>
                <p className="text-gray-500 text-sm mt-1">Tasks will appear here when a Team Lead assigns them to you</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks(myTasks).map((task) => (
                  <div key={task._id} className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-base text-gray-900">{task.title}</h3>
                          {task.workType && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkTypeColor(task.workType)} flex-shrink-0`}>
                              {getWorkTypeIcon(task.workType)} {task.workType}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} flex-shrink-0`}>
                            {getStatusIcon(task.status)} {task.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {task.estimatedHours}h estimated
                          </span>
                          <span className="flex items-center gap-1 flex-shrink-0 min-w-0">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span className="truncate">{task.feature?.name || 'No feature'}</span>
                          </span>
                        </div>
                        {task.reviewNotes && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                            <p className="font-semibold text-yellow-800">Review Notes</p>
                            <p className="text-yellow-700 line-clamp-2 mt-0.5">{task.reviewNotes}</p>
                            {task.reviewedBy && (
                              <p className="text-yellow-600 mt-1 truncate">— {task.reviewedBy.name}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="w-full lg:w-56 lg:max-w-xs shrink-0">
                        {user.role === 'Developer' ? (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Update Status</label>
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 touch-target"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Pending Review">Submit for Review</option>
                              <option value="Blocked">Blocked</option>
                            </select>
                            <p className="text-xs text-gray-500">Submit for review when done</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Update Status</label>
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 touch-target"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Pending Review">Pending Review</option>
                              <option value="Completed">Completed</option>
                              <option value="Blocked">Blocked</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredTasks(allTasks).length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-600 font-medium">No team tasks yet</p>
                <p className="text-gray-500 text-sm mt-1">Tasks will appear here when sprints are created</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks(allTasks).map((task) => (
                  <div key={task._id} className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-base text-gray-900">{task.title}</h3>
                          {task.workType && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkTypeColor(task.workType)} flex-shrink-0`}>
                              {getWorkTypeIcon(task.workType)} {task.workType}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} flex-shrink-0`}>
                            {getStatusIcon(task.status)} {task.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {task.estimatedHours}h estimated
                          </span>
                          <span className="flex items-center gap-1 min-w-0">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span className="truncate">Assigned to: {task.assignedTo?.name || 'Unassigned'}</span>
                          </span>
                          <span className="flex items-center gap-1 min-w-0">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">{task.feature?.name || 'No feature'}</span>
                          </span>
                        </div>
                        {task.reviewNotes && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                            <p className="font-semibold text-yellow-800">Review Notes</p>
                            <p className="text-yellow-700 line-clamp-3 mt-0.5">{task.reviewNotes}</p>
                            {task.reviewedBy && (
                              <p className="text-yellow-600 mt-1">— {task.reviewedBy.name}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="w-full sm:w-auto lg:min-w-[140px] shrink-0">
                        {(user.role === 'Team Lead' || user.role === 'Product Manager') && task.status === 'Pending Review' ? (
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                            <button
                              onClick={() => handleApproveTask(task._id)}
                              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1 touch-target"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalTaskId(task._id)
                                setReviewNotesInput('')
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-1 touch-target"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end lg:justify-start">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {getStatusIcon(task.status)} {task.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Recent Sprints */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Sprints</h2>
          <p className="text-sm text-gray-600 mt-1">Latest activity across your products</p>
        </div>
        <div className="p-6">
          {sprints.length === 0 ? (
            <p className="text-sm text-gray-600">No sprints created yet</p>
          ) : (
            <div className="space-y-4">
              {sprints.slice(0, 5).map((sprint) => (
                <div key={sprint._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 last:mb-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-gray-900">{sprint.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {sprint.product?.name} • {sprint.duration} days • Team: {sprint.teamSize}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {rejectModalTaskId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-900">Reject Task</h3>
            <p className="text-sm text-gray-600 mt-1">Provide feedback for the developer.</p>
            <textarea
              value={reviewNotesInput}
              onChange={(e) => setReviewNotesInput(e.target.value)}
              rows={4}
              className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm touch-target"
              placeholder="Add clear feedback..."
            />
            <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => {
                  setRejectModalTaskId(null)
                  setReviewNotesInput('')
                }}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm touch-target"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectTask}
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm touch-target"
              >
                Reject Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
