/**
 * ============================================================================
 * SMART SPRINT FORM HOOK
 * ============================================================================
 * Custom React hook for intelligent sprint form management
 * Implements auto-calculations, validations, and smart defaults
 * 
 * Features:
 * - Auto-calculate duration from dates
 * - Auto-count unique developers
 * - Auto-fill feature estimated times
 * - Real-time validation
 * - Capacity warnings
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  calculateSprintDuration,
  calculateUniqueDevelopers,
  calculateTotalEffort,
  validateSprintDates,
  calculateSprintCapacity,
  getDeveloperWorkload,
  getFeatureEstimatedHours
} from '../utils/formCalculations';

/**
 * Smart Sprint Form Hook
 * @param {Object} initialValues - Initial form values
 * @param {Array} features - Available features
 * @param {Array} teamMembers - Available team members
 * @returns {Object} Form state and handlers
 */
export const useSmartSprintForm = (initialValues = {}, features = [], teamMembers = []) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    product: '',
    startDate: '',
    endDate: '',
    duration: 0, // AUTO-CALCULATED
    teamSize: 0, // AUTO-CALCULATED
    features: [],
    ...initialValues
  });

  // Feature task assignments: { featureId: [{ userId, workType, hours }] }
  const [featureTasks, setFeatureTasks] = useState({});

  // Validation errors
  const [errors, setErrors] = useState({});

  // Warnings (non-blocking)
  const [warnings, setWarnings] = useState([]);

  // Touched fields (for validation display)
  const [touched, setTouched] = useState({});

  /**
   * AUTO-CALCULATION 1: Sprint Duration
   * Automatically calculate duration when dates change
   */
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const calculatedDuration = calculateSprintDuration(
        formData.startDate,
        formData.endDate
      );
      
      // Only update if different to avoid infinite loops
      if (calculatedDuration !== formData.duration) {
        setFormData(prev => ({
          ...prev,
          duration: calculatedDuration
        }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  /**
   * AUTO-CALCULATION 2: Team Size (Unique Developers)
   * Automatically count unique developers from feature assignments
   */
  useEffect(() => {
    const uniqueDevCount = calculateUniqueDevelopers(featureTasks);
    
    // Only update if different
    if (uniqueDevCount !== formData.teamSize) {
      setFormData(prev => ({
        ...prev,
        teamSize: uniqueDevCount
      }));
    }
  }, [featureTasks]);

  /**
   * COMPUTED: Total Effort
   * Calculate total estimated effort from actual task assignments
   * This ensures the total decreases when features are unselected
   */
  const totalEffort = useMemo(() => {
    // Calculate from actual task assignments for accuracy
    let total = 0;
    
    // Only count tasks for selected features
    formData.features.forEach(featureId => {
      const tasks = featureTasks[featureId];
      if (Array.isArray(tasks)) {
        tasks.forEach(task => {
          const hours = parseFloat(task.hours) || 0;
          total += hours;
        });
      }
    });
    
    return total;
  }, [formData.features, featureTasks]);

  /**
   * COMPUTED: Sprint Capacity Metrics
   * Calculate workload distribution and warnings
   */
  const capacityMetrics = useMemo(() => {
    return calculateSprintCapacity({
      totalEffort,
      duration: formData.duration,
      developerCount: formData.teamSize
    });
  }, [totalEffort, formData.duration, formData.teamSize]);

  /**
   * COMPUTED: Developer Workload Distribution
   * Show how work is distributed across developers
   */
  const developerWorkload = useMemo(() => {
    return getDeveloperWorkload(featureTasks, features);
  }, [featureTasks, features]);

  /**
   * VALIDATION: Real-time form validation
   */
  useEffect(() => {
    const newErrors = {};
    const newWarnings = [];

    // Name validation
    if (touched.name && (!formData.name || formData.name.trim().length < 3)) {
      newErrors.name = 'Sprint name must be at least 3 characters';
    }

    // Product validation
    if (touched.product && !formData.product) {
      newErrors.product = 'Please select a product';
    }

    // Date validation
    if (touched.startDate || touched.endDate) {
      const dateValidation = validateSprintDates(formData.startDate, formData.endDate);
      if (!dateValidation.isValid) {
        newErrors.dates = dateValidation.error;
      }
    }

    // Duration validation
    if (formData.duration < 1) {
      newErrors.duration = 'Sprint must be at least 1 day';
    } else if (formData.duration > 30) {
      newErrors.duration = 'Sprint duration cannot exceed 30 days';
    }

    // Feature validation
    if (touched.features && formData.features.length === 0) {
      newWarnings.push('No features selected. Sprint should contain at least one feature.');
    }

    // Developer validation
    if (formData.teamSize === 0 && totalEffort > 0) {
      newWarnings.push('No developers assigned but features require effort.');
    }

    // Capacity warnings
    if (capacityMetrics.warnings.length > 0) {
      newWarnings.push(...capacityMetrics.warnings);
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
  }, [formData, touched, totalEffort, capacityMetrics]);

  /**
   * Update form field
   */
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    Object.keys(updates).forEach(field => {
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    });
  }, []);

  /**
   * Toggle feature selection
   */
  const toggleFeature = useCallback((featureId) => {
    setFormData(prev => {
      const isSelected = prev.features.includes(featureId);
      const newFeatures = isSelected
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId];
      
      return {
        ...prev,
        features: newFeatures
      };
    });

    // Remove tasks if feature is deselected
    setFeatureTasks(prev => {
      if (formData.features.includes(featureId)) {
        const newTasks = { ...prev };
        delete newTasks[featureId];
        return newTasks;
      }
      return prev;
    });

    setTouched(prev => ({ ...prev, features: true }));
  }, [formData.features]);

  /**
   * AUTO-FILL: Add task to feature with auto-filled estimated hours
   */
  const addTaskToFeature = useCallback((featureId) => {
    const feature = features.find(f => f._id === featureId);
    const estimatedHours = feature?.estimatedEffort || 0;

    setFeatureTasks(prev => ({
      ...prev,
      [featureId]: [
        ...(prev[featureId] || []),
        {
          userId: '',
          workType: '',
          hours: estimatedHours // AUTO-FILLED from feature
        }
      ]
    }));
  }, [features]);

  /**
   * Update task assignment
   */
  const updateTask = useCallback((featureId, taskIndex, field, value) => {
    setFeatureTasks(prev => {
      const tasks = [...(prev[featureId] || [])];
      
      // AUTO-FILL: When selecting developer, auto-fill work type from specialization
      if (field === 'userId' && value) {
        const member = teamMembers.find(m => m.user._id === value);
        const workType = member?.specialization && member.specialization !== 'None'
          ? member.specialization
          : 'Full Stack';
        
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          userId: value,
          workType: workType // AUTO-FILLED
        };
      } else {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          [field]: value
        };
      }
      
      return {
        ...prev,
        [featureId]: tasks
      };
    });
  }, [teamMembers]);

  /**
   * Remove task from feature
   */
  const removeTask = useCallback((featureId, taskIndex) => {
    setFeatureTasks(prev => ({
      ...prev,
      [featureId]: (prev[featureId] || []).filter((_, idx) => idx !== taskIndex)
    }));
  }, []);

  /**
   * Mark field as touched
   */
  const touchField = useCallback((field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      product: '',
      startDate: '',
      endDate: '',
      duration: 0,
      teamSize: 0,
      features: [],
      ...initialValues
    });
    setFeatureTasks({});
    setErrors({});
    setWarnings([]);
    setTouched({});
  }, [initialValues]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(() => {
    // Touch all fields
    setTouched({
      name: true,
      product: true,
      startDate: true,
      endDate: true,
      features: true
    });

    // Check for errors
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 &&
           formData.name.trim().length >= 3 &&
           formData.product &&
           formData.startDate &&
           formData.endDate &&
           formData.duration > 0;
  }, [errors, formData]);

  /**
   * Check if form has changes
   */
  const isDirty = useMemo(() => {
    return Object.keys(touched).length > 0;
  }, [touched]);

  return {
    // Form data
    formData,
    featureTasks,
    
    // Computed values
    totalEffort,
    capacityMetrics,
    developerWorkload,
    
    // Validation
    errors,
    warnings,
    touched,
    isValid,
    isDirty,
    
    // Actions
    updateField,
    updateFields,
    toggleFeature,
    addTaskToFeature,
    updateTask,
    removeTask,
    touchField,
    resetForm,
    validateForm
  };
};

export default useSmartSprintForm;
