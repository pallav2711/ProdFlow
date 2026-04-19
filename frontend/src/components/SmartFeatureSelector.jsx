/**
 * ============================================================================
 * SMART FEATURE SELECTOR COMPONENT
 * ============================================================================
 * Intelligent feature selection with auto-filled estimated times
 * 
 * Features:
 * - Auto-fill estimated hours from feature data
 * - Auto-select work type from developer specialization
 * - Show total effort calculation
 * - Prevent duplicate assignments
 * - Visual capacity indicators
 * ============================================================================
 */

import { useMemo } from 'react';
import { WorkTypeIcon } from './AppIcons';

const SmartFeatureSelector = ({
  features = [],
  selectedFeatures = [],
  featureTasks = {},
  teamMembers = [],
  onToggleFeature,
  onAddTask,
  onUpdateTask,
  onRemoveTask,
  errors = {},
  touched = {}
}) => {
  // Calculate total effort
  const totalEffort = useMemo(() => {
    return selectedFeatures.reduce((total, featureId) => {
      const feature = features.find(f => f._id === featureId);
      return total + (feature?.estimatedEffort || 0);
    }, 0);
  }, [selectedFeatures, features]);

  // Calculate assigned effort
  const assignedEffort = useMemo(() => {
    let total = 0;
    Object.values(featureTasks).forEach(tasks => {
      if (Array.isArray(tasks)) {
        tasks.forEach(task => {
          total += task.hours || 0;
        });
      }
    });
    return total;
  }, [featureTasks]);

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get work type color
  const getWorkTypeColor = (workType) => {
    switch (workType) {
      case 'Frontend':
        return 'bg-purple-100 text-purple-700';
      case 'Backend':
        return 'bg-blue-100 text-blue-700';
      case 'Database':
        return 'bg-cyan-100 text-cyan-700';
      case 'UI/UX Design':
        return 'bg-pink-100 text-pink-700';
      case 'DevOps':
        return 'bg-orange-100 text-orange-700';
      case 'Testing':
        return 'bg-teal-100 text-teal-700';
      case 'Full Stack':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with effort summary */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Select Features & Assign Developers
        </label>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Total Effort:</span>
            <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {totalEffort}h
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Assigned:</span>
            <span className={`font-bold px-3 py-1 rounded-full ${
              assignedEffort > totalEffort 
                ? 'text-red-600 bg-red-50' 
                : assignedEffort === totalEffort 
                ? 'text-green-600 bg-green-50' 
                : 'text-amber-600 bg-amber-50'
            }`}>
              {assignedEffort}h
            </span>
          </div>
        </div>
      </div>

      {/* Features list */}
      {features.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-600 font-medium">No features available</p>
          <p className="text-gray-500 text-sm mt-1">Select a product first to see available features</p>
        </div>
      ) : (
        <div className="space-y-4">
          {features.map((feature) => {
            const isSelected = selectedFeatures.includes(feature._id);
            const tasks = featureTasks[feature._id] || [];
            
            return (
              <div
                key={feature._id}
                className={`border-2 rounded-xl transition-all ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Feature header */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => onToggleFeature(feature._id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-600' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Feature info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(feature.priority)}`}>
                          {feature.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">{feature.estimatedEffort}h</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Value: {feature.businessValue}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task assignments (shown when selected) */}
                {isSelected && (
                  <div className="border-t border-indigo-200 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-semibold text-gray-900">Developer Assignments</h5>
                      <button
                        type="button"
                        onClick={() => onAddTask(feature._id)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Assignment
                      </button>
                    </div>

                    {tasks.length === 0 ? (
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">No developers assigned yet</p>
                        <p className="text-xs text-gray-500 mt-1">Click "Add Assignment" to assign a developer</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="grid grid-cols-12 gap-3">
                              {/* Developer selection */}
                              <div className="col-span-5">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Developer
                                </label>
                                <select
                                  value={task.userId}
                                  onChange={(e) => onUpdateTask(feature._id, taskIndex, 'userId', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                  <option value="">Select developer</option>
                                  {teamMembers.map((member) => (
                                    <option key={member.user._id} value={member.user._id}>
                                      {member.user.name} {member.specialization !== 'None' && `(${member.specialization})`}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Work type (auto-filled) */}
                              <div className="col-span-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Work Type
                                  {task.userId && (
                                    <span className="ml-1 text-green-600">(Auto-filled)</span>
                                  )}
                                </label>
                                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getWorkTypeColor(task.workType)}`}>
                                  <div className="flex items-center gap-2">
                                    <WorkTypeIcon workType={task.workType} />
                                    {task.workType || 'Not set'}
                                  </div>
                                </div>
                              </div>

                              {/* Hours (auto-filled from feature) */}
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Hours
                                  <span className="ml-1 text-green-600">(Auto)</span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={task.hours}
                                  onChange={(e) => onUpdateTask(feature._id, taskIndex, 'hours', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-green-50"
                                />
                              </div>

                              {/* Remove button */}
                              <div className="col-span-1 flex items-end">
                                <button
                                  type="button"
                                  onClick={() => onRemoveTask(feature._id, taskIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove assignment"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Auto-fill indicator */}
                            {task.userId && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Work type auto-filled from developer specialization</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feature effort summary */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Feature effort:</span>
                        <span className="font-medium text-gray-900">{feature.estimatedEffort}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Assigned:</span>
                        <span className={`font-medium ${
                          tasks.reduce((sum, t) => sum + (t.hours || 0), 0) > feature.estimatedEffort
                            ? 'text-red-600'
                            : tasks.reduce((sum, t) => sum + (t.hours || 0), 0) === feature.estimatedEffort
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }`}>
                          {tasks.reduce((sum, t) => sum + (t.hours || 0), 0)}h
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Warnings */}
      {touched.features && selectedFeatures.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Sprint should contain at least one feature</span>
        </div>
      )}

      {assignedEffort > totalEffort && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>Assigned effort ({assignedEffort}h) exceeds total feature effort ({totalEffort}h)</span>
        </div>
      )}
    </div>
  );
};

export default SmartFeatureSelector;
