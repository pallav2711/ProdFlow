import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'
import api from '../api/config'
import { useToast } from '../context/ToastContext'
import PageHeader from '../components/PageHeader'
import PaginationControls from '../components/PaginationControls'
import PageSkeleton from '../components/PageSkeleton'
import { StatusIcon, WorkTypeIcon } from '../components/AppIcons'

const SprintHistory = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { 
    sprints, 
    pagination,
    loading, 
    error, 
    fetchDashboardData, 
    isDataStale 
  } = useDashboard()
  
  const [products, setProducts] = useState([])
  const [sprintsByProduct, setSprintsByProduct] = useState({})
  const [expandedProducts, setExpandedProducts] = useState({})
  const [expandedSprints, setExpandedSprints] = useState({})
  const [sprintDetails, setSprintDetails] = useState({})
  const [sprintPage, setSprintPage] = useState(1)
  const SPRINTS_PAGE_SIZE = 20

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      console.log('SprintHistory mounted, fetching data...')
      fetchData()
    }
  }, [user, sprintPage])

  // Update local state when sprints data changes
  useEffect(() => {
    if (sprints.length > 0) {
      groupSprintsByProduct()
    }
  }, [sprints])

  const fetchData = async () => {
    try {
      // Fetch dashboard data (includes sprints)
      await fetchDashboardData(true, {
        pagination: {
          sprints: { page: sprintPage, limit: SPRINTS_PAGE_SIZE }
        }
      })
      
      // Fetch products separately
      const productsRes = await api.get('/products', {
        params: { page: 1, limit: 100 }
      })
      setProducts(productsRes.data.products)
    } catch (error) {
      console.error('Error fetching sprint history data:', error)
    }
  }

  const groupSprintsByProduct = () => {
    // Group sprints by product
    const grouped = {}
    sprints.forEach(sprint => {
      const productId = sprint.product?._id
      if (productId) {
        if (!grouped[productId]) {
          grouped[productId] = []
        }
        grouped[productId].push(sprint)
      }
    })

    // Sort sprints by date (newest first) within each product
    Object.keys(grouped).forEach(productId => {
      grouped[productId].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    })

    setSprintsByProduct(grouped)
  }

  const toggleProduct = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

  const toggleSprint = async (sprintId) => {
    if (expandedSprints[sprintId]) {
      setExpandedSprints(prev => ({
        ...prev,
        [sprintId]: false
      }))
      return
    }

    // Fetch sprint details if not already loaded
    if (!sprintDetails[sprintId]) {
      try {
        const res = await api.get(`/sprints/${sprintId}`)
        setSprintDetails(prev => ({
          ...prev,
          [sprintId]: res.data
        }))
      } catch (error) {
        console.error('Error fetching sprint details:', error)
        showToast('Error loading sprint details', 'error')
        return
      }
    }

    setExpandedSprints(prev => ({
      ...prev,
      [sprintId]: true
    }))
  }

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => <StatusIcon status={status} />

  const getTaskStatusColor = (status) => {
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

  const getTaskStatusIcon = (status) => <StatusIcon status={status} />

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

  // Group tasks by feature for a sprint
  const groupTasksByFeature = (tasks) => {
    const grouped = {}
    tasks.forEach(task => {
      const featureName = task.feature?.name || 'Unassigned'
      if (!grouped[featureName]) {
        grouped[featureName] = []
      }
      grouped[featureName].push(task)
    })
    return grouped
  }

  if (loading) {
    return <PageSkeleton variant="table" cards={4} rows={6} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Header */}
      <PageHeader
        title="Sprint History"
        subtitle="View all sprints organized by product with complete details."
        meta={
          pagination?.sprints ? (
            <p className="text-xs text-gray-500">
              Showing page {pagination.sprints.page} of {pagination.sprints.totalPages} ({pagination.sprints.totalCount} total sprints)
            </p>
          ) : null
        }
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Sprints</h3>
          <p className="text-3xl font-bold text-gray-900">
            {Object.values(sprintsByProduct).reduce((sum, sprints) => sum + sprints.length, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Active Sprints</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {Object.values(sprintsByProduct).flat().filter(s => s.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Completed Sprints</h3>
          <p className="text-3xl font-bold text-green-600">
            {Object.values(sprintsByProduct).flat().filter(s => s.status === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Products and Sprints */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-600 font-medium">No products yet</p>
            <p className="text-gray-500 text-sm mt-1">Create your first product to get started</p>
            {user?.role === 'Product Manager' && (
              <Link
                to="/product-planning"
                className="inline-flex mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-gray-800 transition-colors"
              >
                Go to Product Planning
              </Link>
            )}
          </div>
        ) : (
          products.map(product => {
            const productSprints = sprintsByProduct[product._id] || []
            const isExpanded = expandedProducts[product._id]

            return (
              <div key={product._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Product Header */}
                <div
                  onClick={() => toggleProduct(product._id)}
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {productSprints.length} sprint{productSprints.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{product.vision}</p>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Product Sprints */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {productSprints.length === 0 ? (
                      <p className="text-gray-500 text-center py-8 italic">No sprints created for this product yet</p>
                    ) : (
                      <div className="space-y-3">
                        {productSprints.map(sprint => {
                          const isSprintExpanded = expandedSprints[sprint._id]
                          const details = sprintDetails[sprint._id]
                          const tasksByFeature = details?.tasks ? groupTasksByFeature(details.tasks) : {}

                          return (
                            <div key={sprint._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {/* Sprint Header */}
                              <div
                                onClick={() => toggleSprint(sprint._id)}
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <h3 className="font-bold text-gray-900">{sprint.name}</h3>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sprint.status)}`}>
                                        {getStatusIcon(sprint.status)} {sprint.status}
                                      </span>
                                      {sprint.aiPrediction?.successProbability && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                          AI {sprint.aiPrediction.successProbability}% success
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                      <span>{sprint.duration} days</span>
                                      <span>Team: {sprint.teamSize}</span>
                                      <span>{sprint.features?.length || 0} features</span>
                                      <span>{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <svg
                                    className={`w-5 h-5 text-gray-400 transition-transform ${isSprintExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>

                              {/* Sprint Details */}
                              {isSprintExpanded && details && (
                                <div className="border-t border-gray-200 p-5 bg-gray-50">
                                  {/* Features and Tasks */}
                                  <div className="mb-6">
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
                                          <div key={featureName} className="bg-white rounded-lg border border-gray-200 p-4">
                                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                              {featureName}
                                            </h5>
                                            <div className="space-y-2">
                                              {tasks.map(task => (
                                                <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                                  <div className="flex items-center gap-3 flex-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkTypeColor(task.workType)}`}>
                                                      {getWorkTypeIcon(task.workType)} {task.workType}
                                                    </span>
                                                    <div className="flex-1">
                                                      <p className="text-sm font-medium text-gray-900">
                                                        {task.assignedTo?.name || 'Unassigned'}
                                                      </p>
                                                      <p className="text-xs text-gray-500">{task.estimatedHours}h estimated</p>
                                                    </div>
                                                  </div>
                                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                                                    {getTaskStatusIcon(task.status)} {task.status}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Sprint Statistics */}
                                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                      <p className="text-2xl font-bold text-gray-900">{details.tasks?.length || 0}</p>
                                      <p className="text-xs text-gray-600 mt-1">Total Tasks</p>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                      <p className="text-2xl font-bold text-green-600">
                                        {details.tasks?.filter(t => t.status === 'Completed').length || 0}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">Completed</p>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                      <p className="text-2xl font-bold text-blue-600">
                                        {details.tasks?.filter(t => t.status === 'In Progress' || t.status === 'Pending Review').length || 0}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">In Progress</p>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                      <p className="text-2xl font-bold text-gray-600">
                                        {details.tasks?.filter(t => t.status === 'To Do').length || 0}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">To Do</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Sprint Pagination */}
      {pagination?.sprints && pagination.sprints.totalPages > 1 && (
        <PaginationControls
          currentPage={sprintPage}
          totalPages={pagination.sprints.totalPages}
          onPrevious={() => setSprintPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setSprintPage((prev) => Math.min(prev + 1, pagination.sprints.totalPages))}
          canPrevious={!loading && sprintPage > 1}
          canNext={!loading && sprintPage < pagination.sprints.totalPages}
        />
      )}
    </div>
  )
}

export default SprintHistory
