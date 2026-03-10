import { useState, useEffect } from 'react'
import axios from 'axios'

const SprintPlanner = () => {
  const [sprints, setSprints] = useState([])
  const [products, setProducts] = useState([])
  const [features, setFeatures] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [selectedSprint, setSelectedSprint] = useState(null)
  const [showSprintModal, setShowSprintModal] = useState(false)
  const [showEditSprintModal, setShowEditSprintModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [featureTasks, setFeatureTasks] = useState({}) // { featureId: [{ userId, workType, hours }] }
  const [sprintToEdit, setSprintToEdit] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0
  })

  const [sprintForm, setSprintForm] = useState({
    name: '',
    product: '',
    duration: 14,
    startDate: '',
    endDate: '',
    teamSize: 5,
    features: []
  })

  const [taskForm, setTaskForm] = useState({
    feature: '',
    title: '',
    description: '',
    assignedTo: '',
    estimatedHours: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sprintsRes, productsRes] = await Promise.all([
        axios.get('/api/sprints'),
        axios.get('/api/products')
      ])
      const sprintsData = sprintsRes.data.sprints
      setSprints(sprintsData)
      setProducts(productsRes.data.products)
      
      // Calculate stats
      setStats({
        total: sprintsData.length,
        active: sprintsData.filter(s => s.status === 'Active').length,
        completed: sprintsData.filter(s => s.status === 'Completed').length,
        planning: sprintsData.filter(s => s.status === 'Planning').length
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeatures = async (productId) => {
    try {
      const res = await axios.get(`/api/products/${productId}/features`)
      // Only show backlog features
      setFeatures(res.data.features.filter(f => f.status === 'Backlog'))
    } catch (error) {
      console.error('Error fetching features:', error)
    }
  }

  const fetchTeamMembers = async (productId) => {
    try {
      const res = await axios.get(`/api/teams/product/${productId}`)
      // Only show active members who are developers or team leads
      const activeMembers = res.data.members.filter(m => 
        m.status === 'active' && (m.role === 'Developer' || m.role === 'Team Lead')
      )
      setTeamMembers(activeMembers)
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const handleProductChange = (productId) => {
    setSprintForm({ ...sprintForm, product: productId, features: [] })
    setFeatureTasks({})
    if (productId) {
      fetchFeatures(productId)
      fetchTeamMembers(productId)
    } else {
      setFeatures([])
      setTeamMembers([])
    }
  }

  const toggleFeature = (featureId) => {
    const features = sprintForm.features.includes(featureId)
      ? sprintForm.features.filter(id => id !== featureId)
      : [...sprintForm.features, featureId]
    setSprintForm({ ...sprintForm, features })
    
    // Remove tasks if feature is deselected
    if (!features.includes(featureId)) {
      const newTasks = { ...featureTasks }
      delete newTasks[featureId]
      setFeatureTasks(newTasks)
    }
  }

  const addTaskToFeature = (featureId) => {
    const currentTasks = featureTasks[featureId] || []
    setFeatureTasks({
      ...featureTasks,
      [featureId]: [...currentTasks, { userId: '', workType: '', hours: 0 }]
    })
  }

  const updateFeatureTask = (featureId, taskIndex, field, value) => {
    const currentTasks = [...(featureTasks[featureId] || [])]
    
    // If updating userId, automatically set workType from member's specialization
    if (field === 'userId' && value) {
      const selectedMember = teamMembers.find(m => m.user._id === value)
      const workType = selectedMember?.specialization && selectedMember.specialization !== 'None' 
        ? selectedMember.specialization 
        : 'Full Stack' // Default to Full Stack if no specialization
      
      currentTasks[taskIndex] = { 
        ...currentTasks[taskIndex], 
        userId: value,
        workType: workType
      }
    } else {
      currentTasks[taskIndex] = { ...currentTasks[taskIndex], [field]: value }
    }
    
    setFeatureTasks({
      ...featureTasks,
      [featureId]: currentTasks
    })
  }

  const removeFeatureTask = (featureId, taskIndex) => {
    const currentTasks = featureTasks[featureId].filter((_, idx) => idx !== taskIndex)
    setFeatureTasks({
      ...featureTasks,
      [featureId]: currentTasks
    })
  }

  const handleSprintSubmit = async (e) => {
    e.preventDefault()
    try {
      // Create sprint
      const sprintRes = await axios.post('/api/sprints', sprintForm)
      const createdSprint = sprintRes.data.sprint

      // Create tasks for each feature
      for (const featureId of sprintForm.features) {
        const tasks = featureTasks[featureId] || []
        const feature = features.find(f => f._id === featureId)
        
        for (const task of tasks) {
          if (task.userId && task.workType && task.hours > 0) {
            await axios.post(`/api/sprints/${createdSprint._id}/tasks`, {
              feature: featureId,
              title: `${feature.name} - ${task.workType}`,
              description: feature.description,
              assignedTo: task.userId,
              workType: task.workType,
              estimatedHours: task.hours
            })
          }
        }
      }

      setShowSprintModal(false)
      setSprintForm({
        name: '',
        product: '',
        duration: 14,
        startDate: '',
        endDate: '',
        teamSize: 5,
        features: []
      })
      setFeatureTasks({})
      fetchData()
      alert('Sprint created successfully with task assignments!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating sprint')
    }
  }

  const selectSprint = async (sprint) => {
    try {
      const res = await axios.get(`/api/sprints/${sprint._id}`)
      setSelectedSprint(res.data.sprint)
    } catch (error) {
      console.error('Error fetching sprint details:', error)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/api/sprints/${selectedSprint._id}/tasks`, taskForm)
      setShowTaskModal(false)
      setTaskForm({
        feature: '',
        title: '',
        description: '',
        assignedTo: '',
        estimatedHours: 0
      })
      selectSprint(selectedSprint) // Refresh sprint details
      alert('Task added successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding task')
    }
  }

  const handleDeleteSprint = async (sprintId) => {
    if (!confirm('Are you sure you want to delete this sprint? This will also delete all associated tasks and return features to backlog.')) {
      return
    }
    
    try {
      await axios.delete(`/api/sprints/${sprintId}`)
      setSelectedSprint(null)
      fetchData()
      alert('Sprint deleted successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting sprint')
    }
  }

  const handleEditSprint = (sprint) => {
    setSprintToEdit(sprint)
    setSprintForm({
      name: sprint.name,
      product: sprint.product._id,
      duration: sprint.duration,
      startDate: sprint.startDate.split('T')[0],
      endDate: sprint.endDate.split('T')[0],
      teamSize: sprint.teamSize,
      features: []
    })
    setShowEditSprintModal(true)
  }

  const handleEditSprintSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/api/sprints/${sprintToEdit._id}`, {
        name: sprintForm.name,
        duration: sprintForm.duration,
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        teamSize: sprintForm.teamSize
      })
      alert('Sprint updated successfully!')
      setShowEditSprintModal(false)
      setSprintToEdit(null)
      setSprintForm({
        name: '',
        product: '',
        duration: 14,
        startDate: '',
        endDate: '',
        teamSize: 5,
        features: []
      })
      fetchData()
      // Refresh selected sprint if it was the one edited
      if (selectedSprint?._id === sprintToEdit._id) {
        const res = await axios.get(`/api/sprints/${sprintToEdit._id}`)
        setSelectedSprint(res.data.sprint)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating sprint')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sprint Planner</h1>
        <button
          onClick={() => setShowSprintModal(true)}
          className="bg-accent text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          Create Sprint
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Sprints</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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
              <h3 className="text-gray-600 text-sm font-medium mb-1">Planning</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.planning}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Active</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.active}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sprints List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Sprints</h2>
          {sprints.length === 0 ? (
            <p className="text-gray-600">No sprints yet</p>
          ) : (
            <div className="space-y-2">
              {sprints.map((sprint) => (
                <div
                  key={sprint._id}
                  onClick={() => selectSprint(sprint)}
                  className={`p-3 rounded cursor-pointer border ${
                    selectedSprint?._id === sprint._id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold flex-1">{sprint.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      sprint.status === 'Completed' 
                        ? 'bg-green-100 text-green-700' 
                        : sprint.status === 'Active'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {sprint.status === 'Completed' ? '✅' : sprint.status === 'Active' ? '⚡' : '📋'} {sprint.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{sprint.duration} days</p>
                  {sprint.aiPrediction?.successProbability && (
                    <p className="text-sm font-bold text-green-600 mt-1">
                      AI: {sprint.aiPrediction.successProbability}% success
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sprint Details */}
        <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          {selectedSprint ? (
            <>
              {/* Completion Banner */}
              {selectedSprint.status === 'Completed' && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-800">🎉 Sprint Completed!</h3>
                      <p className="text-sm text-green-700">All tasks have been completed and approved. Great work team!</p>
                    </div>
                    <span className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold text-sm">
                      ✅ DONE
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{selectedSprint.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedSprint.status === 'Completed' 
                        ? 'bg-green-100 text-green-700' 
                        : selectedSprint.status === 'Active'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedSprint.status === 'Completed' ? '✅' : selectedSprint.status === 'Active' ? '⚡' : '📋'} {selectedSprint.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSprint(selectedSprint)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Sprint
                    </button>
                    <button
                      onClick={() => handleDeleteSprint(selectedSprint._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Sprint
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Product</p>
                    <p className="font-medium">{selectedSprint.product?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium">{selectedSprint.duration} days</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Team Size</p>
                    <p className="font-medium">{selectedSprint.teamSize} members</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium">{selectedSprint.status}</p>
                  </div>
                </div>
              </div>

              {/* AI Prediction */}
              {selectedSprint.aiPrediction?.successProbability && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold mb-2">🤖 AI Sprint Success Prediction</h3>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-green-600 h-4 rounded-full"
                          style={{ width: `${selectedSprint.aiPrediction.successProbability}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-2xl font-bold ml-4">
                      {selectedSprint.aiPrediction.successProbability}%
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on team capacity, workload, and historical data
                  </p>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="font-bold mb-3">Features in Sprint</h3>
                {selectedSprint.features?.length === 0 ? (
                  <p className="text-gray-600">No features assigned</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSprint.features?.map((feature) => (
                      <div key={feature._id} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{feature.name}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            feature.priority === 'High' ? 'bg-red-100 text-red-700' :
                            feature.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {feature.priority}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>Value: {feature.businessValue}/10</span>
                          <span>Effort: {feature.estimatedEffort}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-600">Select a sprint to view details</p>
          )}
        </div>
      </div>

      {/* Sprint Modal */}
      {showSprintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Create Sprint</h2>
                  <p className="text-sm text-gray-600 mt-1">Plan your sprint with AI-powered predictions</p>
                </div>
                <button
                  onClick={() => setShowSprintModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSprintSubmit} className="px-8 py-6 space-y-6">
              {/* Sprint Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sprint Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sprintForm.name}
                  onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
                  placeholder="e.g., Sprint 1 - Core Features"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={sprintForm.product}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration and Team Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={sprintForm.duration}
                    onChange={(e) => setSprintForm({ ...sprintForm, duration: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Typical: 7-14 days</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Team Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={sprintForm.teamSize}
                    onChange={(e) => setSprintForm({ ...sprintForm, teamSize: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of developers</p>
                </div>
              </div>

              {/* Start and End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={sprintForm.startDate}
                    onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={sprintForm.endDate}
                    onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Features Selection */}
              {sprintForm.product && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Features & Assign to Team Members
                  </label>
                  <div className="border border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto bg-gray-50">
                    {features.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-600 text-sm">No backlog features available</p>
                        <p className="text-gray-500 text-xs mt-1">Add features to the product first</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {features.map((feature) => (
                          <div 
                            key={feature._id} 
                            className={`p-4 rounded-lg bg-white border-2 transition-all ${
                              sprintForm.features.includes(feature._id) 
                                ? 'border-indigo-300 shadow-sm' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={sprintForm.features.includes(feature._id)}
                                onChange={() => toggleFeature(feature._id)}
                                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-gray-900">{feature.name}</p>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    feature.priority === 'High' ? 'bg-red-100 text-red-700' :
                                    feature.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {feature.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Value: {feature.businessValue}/10
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    Effort: {feature.estimatedEffort}h
                                  </span>
                                </div>

                                {/* Task Assignment - Only show if feature is selected */}
                                {sprintForm.features.includes(feature._id) && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="block text-xs font-semibold text-gray-700">
                                        👥 Assign Team Members (Work type auto-assigned from specialization)
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => addTaskToFeature(feature._id)}
                                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 flex items-center gap-1"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Member
                                      </button>
                                    </div>
                                    
                                    {(featureTasks[feature._id] || []).length === 0 ? (
                                      <p className="text-xs text-gray-500 italic">Click "Add Member" to assign team members to this feature</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {(featureTasks[feature._id] || []).map((task, taskIndex) => (
                                          <div key={taskIndex} className="bg-gray-50 p-3 rounded border border-gray-200">
                                            <div className="flex items-center gap-3">
                                              <div className="flex-1">
                                                <label className="block text-xs text-gray-600 mb-1">Team Member</label>
                                                <select
                                                  value={task.userId}
                                                  onChange={(e) => updateFeatureTask(feature._id, taskIndex, 'userId', e.target.value)}
                                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                >
                                                  <option value="">Select team member...</option>
                                                  {teamMembers.map((member) => (
                                                    <option key={member._id} value={member.user._id}>
                                                      {member.user.name}
                                                      {member.specialization && member.specialization !== 'None' ? ` - ${member.specialization}` : ''}
                                                    </option>
                                                  ))}
                                                </select>
                                                {task.userId && task.workType && (
                                                  <div className="mt-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                                                      {task.workType === 'Frontend' && '🎨'}
                                                      {task.workType === 'Backend' && '⚙️'}
                                                      {task.workType === 'Database' && '🗄️'}
                                                      {task.workType === 'UI/UX Design' && '✨'}
                                                      {task.workType === 'DevOps' && '🚀'}
                                                      {task.workType === 'Testing' && '🧪'}
                                                      {task.workType === 'Full Stack' && '💻'}
                                                      {task.workType}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                              <div className="w-24">
                                                <label className="block text-xs text-gray-600 mb-1">Hours</label>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={task.hours}
                                                  onChange={(e) => updateFeatureTask(feature._id, taskIndex, 'hours', parseFloat(e.target.value) || 0)}
                                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                  placeholder="0"
                                                />
                                              </div>
                                              <div className="flex items-end pb-2">
                                                <button
                                                  type="button"
                                                  onClick={() => removeFeatureTask(feature._id, taskIndex)}
                                                  className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                                                  title="Remove task"
                                                >
                                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                  </svg>
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {sprintForm.features.length > 0 && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-sm text-indigo-900 font-medium">
                        📋 {sprintForm.features.length} feature{sprintForm.features.length !== 1 ? 's' : ''} selected
                      </p>
                      <p className="text-xs text-indigo-700 mt-1">
                        {Object.values(featureTasks).flat().filter(t => t.userId && t.workType).length} tasks assigned to team members
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-accent text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Create Sprint with AI Prediction
                </button>
                <button
                  type="button"
                  onClick={() => setShowSprintModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sprint Modal */}
      {showEditSprintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Edit Sprint</h2>
                <button
                  onClick={() => {
                    setShowEditSprintModal(false)
                    setSprintToEdit(null)
                    setSprintForm({
                      name: '',
                      product: '',
                      duration: 14,
                      startDate: '',
                      endDate: '',
                      teamSize: 5,
                      features: []
                    })
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSprintSubmit} className="px-8 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Sprint Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sprint Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sprintForm.name}
                  onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Sprint 1 - Core Features"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={sprintForm.duration}
                  onChange={(e) => setSprintForm({ ...sprintForm, duration: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={sprintForm.startDate}
                    onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={sprintForm.endDate}
                    onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Team Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={sprintForm.teamSize}
                  onChange={(e) => setSprintForm({ ...sprintForm, teamSize: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Update Sprint
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditSprintModal(false)
                    setSprintToEdit(null)
                    setSprintForm({
                      name: '',
                      product: '',
                      duration: 14,
                      startDate: '',
                      endDate: '',
                      teamSize: 5,
                      features: []
                    })
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SprintPlanner
