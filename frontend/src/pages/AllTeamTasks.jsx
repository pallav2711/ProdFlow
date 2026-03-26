import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'
import { useToast } from '../context/ToastContext'
import PageHeader from '../components/PageHeader'
import PaginationControls from '../components/PaginationControls'
import PageSkeleton from '../components/PageSkeleton'
import { StatusIcon, WorkTypeIcon } from '../components/AppIcons'

const AllTeamTasks = () => {
  const { user } = useAuth()
  const { 
    allTasks, 
    pagination,
    loading, 
    error, 
    fetchDashboardData, 
    approveTask,
    rejectTask,
    updateTaskStatus,
    isDataStale 
  } = useDashboard()
  const { showToast } = useToast()
  
  const [filterStatus, setFilterStatus] = useState('all')
  const [sprintPage, setSprintPage] = useState(1)
  const [rejectModalTaskId, setRejectModalTaskId] = useState(null)
  const [reviewNotesInput, setReviewNotesInput] = useState('')
  const SPRINTS_PAGE_SIZE = 15

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      console.log('AllTeamTasks mounted, fetching data...')
      // Always fetch fresh data when navigating to all team tasks
      fetchDashboardData(true, {
        pagination: {
          sprints: { page: sprintPage, limit: SPRINTS_PAGE_SIZE }
        }
      })
    }
  }, [user, sprintPage])

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

  const filteredTasks = () => {
    if (filterStatus === 'all') return allTasks
    return allTasks.filter(task => task.status === filterStatus)
  }

  const stats = {
    total: allTasks.length,
    todo: allTasks.filter(t => t.status === 'To Do').length,
    inProgress: allTasks.filter(t => t.status === 'In Progress').length,
    pendingReview: allTasks.filter(t => t.status === 'Pending Review').length,
    completed: allTasks.filter(t => t.status === 'Completed').length,
    blocked: allTasks.filter(t => t.status === 'Blocked').length
  }

  if (loading) {
    return <PageSkeleton variant="table" cards={6} rows={7} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <PageHeader
        title="All Team Tasks"
        subtitle="Monitor and manage all tasks across all sprints."
        meta={
          pagination?.sprints ? (
            <p className="text-xs text-gray-500">
              Loaded from sprint page {pagination.sprints.page} of {pagination.sprints.totalPages}
            </p>
          ) : null
        }
      />
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-xs font-medium mb-1">Total</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-xs font-medium mb-1">To Do</h3>
          <p className="text-2xl font-bold text-gray-700">{stats.todo}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-xs font-medium mb-1">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-xs font-medium mb-1">Review</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-xs font-medium mb-1">Completed</h3>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-xs font-medium mb-1">Blocked</h3>
          <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Filters */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('To Do')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'To Do'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              To Do ({stats.todo})
            </button>
            <button
              onClick={() => setFilterStatus('In Progress')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'In Progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilterStatus('Pending Review')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'Pending Review'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Review ({stats.pendingReview})
            </button>
            <button
              onClick={() => setFilterStatus('Completed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'Completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Completed ({stats.completed})
            </button>
            <button
              onClick={() => setFilterStatus('Blocked')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'Blocked'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Blocked ({stats.blocked})
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="p-6">
          {filteredTasks().length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 font-medium">No tasks found</p>
              <p className="text-gray-500 text-sm mt-1">
                {filterStatus === 'all' 
                  ? 'Tasks will appear here when sprints are created' 
                  : `No tasks with status "${filterStatus}"`}
              </p>
              {filterStatus === 'all' && (
                <Link
                  to="/sprint-planner"
                  className="inline-flex mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-gray-800 transition-colors"
                >
                  Go to Sprint Planner
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks().map((task) => (
                <div key={task._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                        {task.workType && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkTypeColor(task.workType)}`}>
                            {getWorkTypeIcon(task.workType)} {task.workType}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)} {task.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          Assigned to: {task.assignedTo?.name || 'Unassigned'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {task.estimatedHours}h estimated
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          Feature: {task.feature?.name || 'No feature'}
                        </span>
                      </div>
                      {task.reviewNotes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                          <p className="font-semibold text-yellow-800 mb-1">Review Notes:</p>
                          <p className="text-yellow-700">{task.reviewNotes}</p>
                          {task.reviewedBy && (
                            <p className="text-yellow-600 mt-1 text-xs">— {task.reviewedBy.name}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {task.status === 'Pending Review' ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleApproveTask(task._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1 whitespace-nowrap"
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
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Update Status</label>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[160px]"
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
          )}
        </div>
      </div>

      {/* Sprint Pagination */}
      {pagination?.sprints && pagination.sprints.totalPages > 1 && (
        <PaginationControls
          currentPage={sprintPage}
          totalPages={pagination.sprints.totalPages}
          label="Sprint page"
          onPrevious={() => setSprintPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setSprintPage((prev) => Math.min(prev + 1, pagination.sprints.totalPages))}
          canPrevious={!loading && sprintPage > 1}
          canNext={!loading && sprintPage < pagination.sprints.totalPages}
        />
      )}

      {rejectModalTaskId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-lg font-bold text-gray-900">Reject Task</h3>
            <p className="text-sm text-gray-600 mt-1">Provide feedback for the developer.</p>
            <textarea
              value={reviewNotesInput}
              onChange={(e) => setReviewNotesInput(e.target.value)}
              rows={4}
              className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Add clear feedback..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectModalTaskId(null)
                  setReviewNotesInput('')
                }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectTask}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
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

export default AllTeamTasks