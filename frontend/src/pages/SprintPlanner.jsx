/**
 * ============================================================================
 * SMART SPRINT PLANNER - UPGRADED WITH INTELLIGENT FORMS
 * ============================================================================
 * Enhanced sprint planning with auto-calculations and smart validations
 * 
 * Features:
 * - Auto-calculate sprint duration from dates
 * - Auto-count unique developers
 * - Auto-fill feature estimated times
 * - Real-time capacity analysis
 * - Smart validations and warnings
 * ============================================================================
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/config'
import { useToast } from '../context/ToastContext'
import PageHeader from '../components/PageHeader'
import PageSkeleton from '../components/PageSkeleton'
import { StatusIcon } from '../components/AppIcons'

// Import Smart Components
import { useSmartSprintForm } from '../hooks/useSmartSprintForm'
import SmartDateRangePicker from '../components/SmartDateRangePicker'
import SmartTeamSizeDisplay from '../components/SmartTeamSizeDisplay'
import SmartFeatureSelector from '../components/SmartFeatureSelector'
import SprintCapacityMetrics from '../components/SprintCapacityMetrics'

const SprintPlanner = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  // Data state
  const [sprints, setSprints] = useState([])
  const [products, setProducts] = useState([])
  const [features, setFeatures] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [selectedSprint, setSelectedSprint] = useState(null)
  
  // UI state
  const [showSprintModal, setShowSprintModal] = useState(false)
  const [showEditSprintModal, setShowEditSprintModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sprintToEdit, setSprintToEdit] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0
  })

  // Submission state
  const [isSubmittingSprintCreate, setIsSubmittingSprintCreate] = useState(false)
  const [isSubmittingSprintEdit, setIsSubmittingSprintEdit] = useState(false)

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Auto-refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && shouldRefreshData()) {
        fetchData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  const shouldRefreshData = () => {
    if (!lastFetch) return true
    return Date.now() - lastFetch > 60000 // Refresh if older than 1 minute
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [sprintsRes, productsRes] = await Promise.all([
        api.get('/sprints'),
        api.get('/products')
      ])
      const sprintsData = sprintsRes.data.sprints
      setSprints(sprintsData)
      setProducts(productsRes.data.products)
      setLastFetch(Date.now())
      
      setStats({
        total: sprintsData.length,
        active: sprintsData.filter(s => s.status === 'Active').length,
        completed: sprintsData.filter(s => s.status === 'Completed').length,
        planning: sprintsData.filter(s => s.status === 'Planning').length
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load sprint data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchFeatures = async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/features`)
      setFeatures(res.data.features.filter(f => f.status === 'Backlog'))
    } catch (error) {
      console.error('Error fetching features:', error)
    }
  }

  const fetchTeamMembers = async (productId) => {
    try {
      const res = await api.get(`/teams/product/${productId}`)
      const activeMembers = res.data.members.filter(m => 
        m.status === 'active' && (m.role === 'Developer' || m.role === 'Team Lead')
      )
      setTeamMembers(activeMembers)
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const selectSprint = async (sprint) => {
    try {
      const res = await api.get(`/sprints/${sprint._id}`)
      setSelectedSprint(res.data.sprint)
    } catch (error) {
      console.error('Error fetching sprint details:', error)
    }
  }

  const handleDeleteSprint = async (sprintId) => {
    if (!confirm('Are you sure you want to delete this sprint? This will also delete all associated tasks and return features to backlog.')) {
      return
    }
    
    try {
      await api.delete(`/sprints/${sprintId}`)
      setSelectedSprint(null)
      fetchData()
      showToast('Sprint deleted successfully!', 'success')
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting sprint', 'error')
    }
  }

  const handleEditSprint = (sprint) => {
    setSprintToEdit(sprint)
    setShowEditSprintModal(true)
  }

  if (loading) {
    return <PageSkeleton variant="dense" cards={4} rows={5} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <PageHeader
        title="Sprint Planner"
        subtitle="Plan sprints with intelligent auto-calculations and capacity analysis"
        rightContent={
          <button
            onClick={() => setShowSprintModal(true)}
            className="bg-accent text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Create Sprint
          </button>
        }
      />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
          <button
            onClick={() => fetchData()}
            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
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
                      <StatusIcon status={sprint.status} /> {sprint.status}
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
        <SprintDetailsPanel 
          selectedSprint={selectedSprint}
          onEdit={handleEditSprint}
          onDelete={handleDeleteSprint}
        />
      </div>

      {/* Create Sprint Modal with Smart Components */}
      {showSprintModal && (
        <CreateSprintModal
          products={products}
          features={features}
          teamMembers={teamMembers}
          onClose={() => setShowSprintModal(false)}
          onSuccess={() => {
            setShowSprintModal(false)
            fetchData()
          }}
          onProductChange={(productId) => {
            if (productId) {
              fetchFeatures(productId)
              fetchTeamMembers(productId)
            } else {
              setFeatures([])
              setTeamMembers([])
            }
          }}
          isSubmitting={isSubmittingSprintCreate}
          setIsSubmitting={setIsSubmittingSprintCreate}
        />
      )}

      {/* Edit Sprint Modal */}
      {showEditSprintModal && sprintToEdit && (
        <EditSprintModal
          sprint={sprintToEdit}
          onClose={() => {
            setShowEditSprintModal(false)
            setSprintToEdit(null)
          }}
          onSuccess={() => {
            setShowEditSprintModal(false)
            setSprintToEdit(null)
            fetchData()
            if (selectedSprint?._id === sprintToEdit._id) {
              selectSprint(sprintToEdit)
            }
          }}
          isSubmitting={isSubmittingSprintEdit}
          setIsSubmitting={setIsSubmittingSprintEdit}
        />
      )}
    </div>
  )
}

/**
 * ============================================================================
 * CREATE SPRINT MODAL - WITH SMART COMPONENTS
 * ============================================================================
 */
function CreateSprintModal({ 
  products, 
  features, 
  teamMembers, 
  onClose, 
  onSuccess, 
  onProductChange,
  isSubmitting,
  setIsSubmitting
}) {
  const { showToast } = useToast()

  // Initialize smart form hook
  const {
    formData,
    featureTasks,
    totalEffort,
    capacityMetrics,
    developerWorkload,
    errors,
    warnings,
    touched,
    isValid,
    updateField,
    toggleFeature,
    addTaskToFeature,
    updateTask,
    removeTask,
    validateForm,
    resetForm
  } = useSmartSprintForm(
    {
      name: '',
      product: '',
      startDate: '',
      endDate: '',
      duration: 0,
      teamSize: 0,
      features: []
    },
    features,
    teamMembers
  )

  const handleProductChange = (productId) => {
    updateField('product', productId)
    updateField('features', [])
    onProductChange(productId)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('Please fix form errors before submitting', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      // Create sprint
      const sprintRes = await api.post('/sprints', formData)
      const createdSprint = sprintRes.data.sprint

      // Create tasks for each feature
      for (const featureId of formData.features) {
        const tasks = featureTasks[featureId] || []
        const feature = features.find(f => f._id === featureId)
        
        for (const task of tasks) {
          if (task.userId && task.workType && task.hours > 0) {
            await api.post(`/sprints/${createdSprint._id}/tasks`, {
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

      showToast('Sprint created successfully with intelligent planning!', 'success')
      resetForm()
      onSuccess()
    } catch (error) {
      showToast(error.response?.data?.message || 'Error creating sprint', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Create Sprint</h2>
              <p className="text-sm text-gray-600 mt-1">
                ✨ Intelligent planning with auto-calculations
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Sprint Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => touched.name = true}
              placeholder="e.g., Sprint 1 - Core Features"
              required
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                errors.name && touched.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.name && touched.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.product}
              onChange={(e) => handleProductChange(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white ${
                errors.product && touched.product ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.product && touched.product && (
              <p className="text-xs text-red-600 mt-1">{errors.product}</p>
            )}
          </div>

          {/* SMART DATE RANGE PICKER - Auto-calculates duration */}
          <SmartDateRangePicker
            startDate={formData.startDate}
            endDate={formData.endDate}
            onStartDateChange={(date) => updateField('startDate', date)}
            onEndDateChange={(date) => updateField('endDate', date)}
            errors={errors}
            touched={touched}
            showWorkingDays={false}
            required={true}
          />

          {/* SMART TEAM SIZE DISPLAY - Auto-counts unique developers */}
          {formData.product && (
            <SmartTeamSizeDisplay
              teamSize={formData.teamSize}
              developerWorkload={developerWorkload}
              teamMembers={teamMembers}
              totalEffort={totalEffort}
              duration={formData.duration}
              showDetails={true}
            />
          )}

          {/* SMART FEATURE SELECTOR - Auto-fills estimated times */}
          {formData.product && (
            <SmartFeatureSelector
              features={features}
              selectedFeatures={formData.features}
              featureTasks={featureTasks}
              teamMembers={teamMembers}
              onToggleFeature={toggleFeature}
              onAddTask={addTaskToFeature}
              onUpdateTask={updateTask}
              onRemoveTask={removeTask}
              errors={errors}
              touched={touched}
            />
          )}

          {/* SPRINT CAPACITY METRICS - Real-time capacity analysis (no developer breakdown here) */}
          {formData.teamSize > 0 && formData.duration > 0 && totalEffort > 0 && (
            <SprintCapacityMetrics
              capacityMetrics={capacityMetrics}
              totalEffort={totalEffort}
              duration={formData.duration}
              teamSize={formData.teamSize}
              showDetails={true}
            />
          )}

          {/* Warnings Display */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200"
                >
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Sprint...
                </span>
              ) : (
                'Create Sprint'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * ============================================================================
 * EDIT SPRINT MODAL - Simplified version for editing basic sprint info
 * ============================================================================
 */
function EditSprintModal({ sprint, onClose, onSuccess, isSubmitting, setIsSubmitting }) {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    name: sprint.name,
    startDate: sprint.startDate.split('T')[0],
    endDate: sprint.endDate.split('T')[0],
    duration: sprint.duration,
    teamSize: sprint.teamSize
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await api.put(`/sprints/${sprint._id}`, formData)
      showToast('Sprint updated successfully!', 'success')
      onSuccess()
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating sprint', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Sprint</h2>
              <p className="text-sm text-gray-600 mt-1">Update sprint details</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sprint Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Sprint'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * ============================================================================
 * SPRINT DETAILS PANEL
 * ============================================================================
 */
function SprintDetailsPanel({ selectedSprint, onEdit, onDelete }) {
  if (!selectedSprint) {
    return (
      <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Select a sprint to view details</p>
      </div>
    )
  }

  return (
    <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
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
              <p className="text-sm text-green-700">All tasks completed and approved. Great work!</p>
            </div>
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
              <StatusIcon status={selectedSprint.status} /> {selectedSprint.status}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(selectedSprint)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(selectedSprint._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
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
          <h3 className="font-bold mb-2">AI Sprint Success Prediction</h3>
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
    </div>
  )
}

export default SprintPlanner
