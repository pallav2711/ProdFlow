/**
 * ============================================================================
 * SMART FORM CALCULATIONS UTILITY
 * ============================================================================
 * Centralized business logic for intelligent form calculations
 * Reduces manual input and prevents human errors
 * 
 * Features:
 * - Auto-calculate sprint duration from dates
 * - Count unique developers from assignments
 * - Auto-fill feature estimated times
 * - Workload distribution calculations
 * - Validation helpers
 * ============================================================================
 */

/**
 * Calculate the number of days between two dates
 * @param {string|Date} startDate - Sprint start date
 * @param {string|Date} endDate - Sprint end date
 * @returns {number} Number of days (inclusive)
 */
export const calculateSprintDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }
  
  // Calculate difference in milliseconds
  const diffTime = end.getTime() - start.getTime();
  
  // Convert to days (add 1 to make it inclusive)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Calculate working days between two dates (excluding weekends)
 * Future enhancement for more accurate sprint planning
 * @param {string|Date} startDate - Sprint start date
 * @param {string|Date} endDate - Sprint end date
 * @returns {number} Number of working days
 */
export const calculateWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }
  
  let workingDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
};

/**
 * Count unique developers from feature task assignments
 * Prevents duplicate counting when same developer is assigned multiple tasks
 * @param {Object} featureTasks - Object mapping featureId to array of tasks
 * @returns {number} Count of unique developers
 * 
 * Example:
 * featureTasks = {
 *   'feature1': [{ userId: 'dev1' }, { userId: 'dev1' }],
 *   'feature2': [{ userId: 'dev2' }]
 * }
 * Returns: 2 (dev1 counted once, dev2 counted once)
 */
export const calculateUniqueDevelopers = (featureTasks) => {
  if (!featureTasks || typeof featureTasks !== 'object') {
    return 0;
  }
  
  const uniqueDeveloperIds = new Set();
  
  // Iterate through all features
  Object.values(featureTasks).forEach(tasks => {
    if (Array.isArray(tasks)) {
      tasks.forEach(task => {
        if (task.userId && task.userId.trim() !== '') {
          uniqueDeveloperIds.add(task.userId);
        }
      });
    }
  });
  
  return uniqueDeveloperIds.size;
};

/**
 * Get list of unique developer IDs
 * @param {Object} featureTasks - Object mapping featureId to array of tasks
 * @returns {Array<string>} Array of unique developer IDs
 */
export const getUniqueDeveloperIds = (featureTasks) => {
  if (!featureTasks || typeof featureTasks !== 'object') {
    return [];
  }
  
  const uniqueDeveloperIds = new Set();
  
  Object.values(featureTasks).forEach(tasks => {
    if (Array.isArray(tasks)) {
      tasks.forEach(task => {
        if (task.userId && task.userId.trim() !== '') {
          uniqueDeveloperIds.add(task.userId);
        }
      });
    }
  });
  
  return Array.from(uniqueDeveloperIds);
};

/**
 * Auto-fill estimated hours from feature data
 * When a feature is selected, automatically populate the estimated time
 * @param {string} featureId - Selected feature ID
 * @param {Array} features - Array of available features
 * @returns {number} Estimated hours for the feature
 */
export const getFeatureEstimatedHours = (featureId, features) => {
  if (!featureId || !Array.isArray(features)) {
    return 0;
  }
  
  const feature = features.find(f => f._id === featureId);
  return feature?.estimatedEffort || 0;
};

/**
 * Calculate total estimated effort for selected features
 * @param {Array<string>} selectedFeatureIds - Array of selected feature IDs
 * @param {Array} features - Array of all features
 * @returns {number} Total estimated hours
 */
export const calculateTotalEffort = (selectedFeatureIds, features) => {
  if (!Array.isArray(selectedFeatureIds) || !Array.isArray(features)) {
    return 0;
  }
  
  return selectedFeatureIds.reduce((total, featureId) => {
    const feature = features.find(f => f._id === featureId);
    return total + (feature?.estimatedEffort || 0);
  }, 0);
};

/**
 * Calculate total effort from actual task assignments
 * This is more accurate than feature estimates as it uses actual assigned hours
 * @param {Object} featureTasks - Object mapping featureId to array of tasks
 * @param {Array<string>} selectedFeatureIds - Array of selected feature IDs
 * @returns {number} Total assigned hours
 */
export const calculateTotalEffortFromTasks = (featureTasks, selectedFeatureIds) => {
  if (!featureTasks || typeof featureTasks !== 'object') {
    return 0;
  }
  
  if (!Array.isArray(selectedFeatureIds) || selectedFeatureIds.length === 0) {
    return 0;
  }
  
  let totalHours = 0;
  
  // Only count tasks for selected features
  selectedFeatureIds.forEach(featureId => {
    const tasks = featureTasks[featureId];
    if (Array.isArray(tasks)) {
      tasks.forEach(task => {
        const hours = parseFloat(task.hours) || 0;
        totalHours += hours;
      });
    }
  });
  
  return totalHours;
};

/**
 * Calculate workload per developer
 * @param {number} totalEffort - Total estimated hours
 * @param {number} developerCount - Number of developers
 * @returns {number} Hours per developer
 */
export const calculateWorkloadPerDeveloper = (totalEffort, developerCount) => {
  if (!developerCount || developerCount === 0) return 0;
  return Math.round((totalEffort / developerCount) * 10) / 10; // Round to 1 decimal
};

/**
 * Calculate effort per day
 * @param {number} totalEffort - Total estimated hours
 * @param {number} duration - Sprint duration in days
 * @returns {number} Hours per day
 */
export const calculateEffortPerDay = (totalEffort, duration) => {
  if (!duration || duration === 0) return 0;
  return Math.round((totalEffort / duration) * 10) / 10; // Round to 1 decimal
};

/**
 * Validate sprint dates
 * @param {string|Date} startDate - Sprint start date
 * @param {string|Date} endDate - Sprint end date
 * @returns {Object} Validation result with isValid and error message
 */
export const validateSprintDates = (startDate, endDate) => {
  if (!startDate) {
    return { isValid: false, error: 'Start date is required' };
  }
  
  if (!endDate) {
    return { isValid: false, error: 'End date is required' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) {
    return { isValid: false, error: 'Invalid start date format' };
  }
  
  if (isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid end date format' };
  }
  
  if (end < start) {
    return { isValid: false, error: 'End date must be after start date' };
  }
  
  const duration = calculateSprintDuration(start, end);
  
  if (duration < 1) {
    return { isValid: false, error: 'Sprint must be at least 1 day' };
  }
  
  if (duration > 30) {
    return { isValid: false, error: 'Sprint duration cannot exceed 30 days' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Check for duplicate feature assignments
 * @param {Array<string>} selectedFeatureIds - Array of selected feature IDs
 * @returns {Object} Result with hasDuplicates and duplicate IDs
 */
export const checkDuplicateFeatures = (selectedFeatureIds) => {
  if (!Array.isArray(selectedFeatureIds)) {
    return { hasDuplicates: false, duplicates: [] };
  }
  
  const seen = new Set();
  const duplicates = [];
  
  selectedFeatureIds.forEach(id => {
    if (seen.has(id)) {
      duplicates.push(id);
    } else {
      seen.add(id);
    }
  });
  
  return {
    hasDuplicates: duplicates.length > 0,
    duplicates
  };
};

/**
 * Calculate sprint capacity metrics
 * @param {Object} params - Sprint parameters
 * @returns {Object} Capacity metrics
 */
export const calculateSprintCapacity = ({
  totalEffort,
  duration,
  developerCount,
  workingDaysOnly = false
}) => {
  const effectiveDays = workingDaysOnly 
    ? Math.floor(duration * 5 / 7) // Approximate working days
    : duration;
  
  const effortPerDay = calculateEffortPerDay(totalEffort, effectiveDays);
  const effortPerDeveloper = calculateWorkloadPerDeveloper(totalEffort, developerCount);
  const effortPerDeveloperPerDay = developerCount > 0 
    ? Math.round((effortPerDeveloper / effectiveDays) * 10) / 10 
    : 0;
  
  // Capacity warnings
  const warnings = [];
  
  if (effortPerDeveloperPerDay > 8) {
    warnings.push('High workload: Developers may be overloaded (>8 hours/day)');
  }
  
  if (effortPerDeveloper > duration * 8) {
    warnings.push('Unrealistic workload: Total effort exceeds available time');
  }
  
  if (developerCount === 0 && totalEffort > 0) {
    warnings.push('No developers assigned but features require effort');
  }
  
  return {
    totalEffort,
    duration: effectiveDays,
    developerCount,
    effortPerDay,
    effortPerDeveloper,
    effortPerDeveloperPerDay,
    warnings,
    isOverloaded: effortPerDeveloperPerDay > 8,
    isRealistic: effortPerDeveloper <= duration * 8
  };
};

/**
 * Get developer workload distribution
 * @param {Object} featureTasks - Feature task assignments
 * @param {Array} features - Array of features
 * @returns {Object} Developer workload map
 */
export const getDeveloperWorkload = (featureTasks, features) => {
  const workloadMap = {};
  
  if (!featureTasks || !features) return workloadMap;
  
  Object.entries(featureTasks).forEach(([featureId, tasks]) => {
    if (!Array.isArray(tasks)) return;
    
    tasks.forEach(task => {
      if (!task.userId) return;
      
      const hours = task.hours || 0;
      
      if (!workloadMap[task.userId]) {
        workloadMap[task.userId] = {
          totalHours: 0,
          taskCount: 0,
          features: []
        };
      }
      
      workloadMap[task.userId].totalHours += hours;
      workloadMap[task.userId].taskCount += 1;
      
      if (!workloadMap[task.userId].features.includes(featureId)) {
        workloadMap[task.userId].features.push(featureId);
      }
    });
  });
  
  return workloadMap;
};

/**
 * Suggest optimal sprint duration based on effort and team size
 * @param {number} totalEffort - Total estimated hours
 * @param {number} developerCount - Number of developers
 * @param {number} hoursPerDeveloperPerDay - Expected hours per developer per day (default: 6)
 * @returns {number} Suggested duration in days
 */
export const suggestSprintDuration = (
  totalEffort, 
  developerCount, 
  hoursPerDeveloperPerDay = 6
) => {
  if (!developerCount || developerCount === 0) return 14; // Default 2 weeks
  
  const totalCapacity = developerCount * hoursPerDeveloperPerDay;
  const suggestedDays = Math.ceil(totalEffort / totalCapacity);
  
  // Clamp between 7 and 21 days (1-3 weeks)
  return Math.max(7, Math.min(21, suggestedDays));
};

export default {
  calculateSprintDuration,
  calculateWorkingDays,
  calculateUniqueDevelopers,
  getUniqueDeveloperIds,
  getFeatureEstimatedHours,
  calculateTotalEffort,
  calculateWorkloadPerDeveloper,
  calculateEffortPerDay,
  validateSprintDates,
  checkDuplicateFeatures,
  calculateSprintCapacity,
  getDeveloperWorkload,
  suggestSprintDuration
};
