/**
 * ============================================================================
 * SPRINT CAPACITY METRICS COMPONENT - ENHANCED
 * ============================================================================
 * Visual display of sprint capacity and workload distribution
 * 
 * Features:
 * - Real-time capacity calculations
 * - Developer-wise workload breakdown
 * - Per-day work calculations for each developer
 * - Average sprint workload per day
 * - Workload warnings and optimization suggestions
 * - Visual progress indicators
 * ============================================================================
 */

import { useMemo } from 'react';

const SprintCapacityMetrics = ({
  capacityMetrics,
  totalEffort,
  duration,
  teamSize,
  developerWorkload = {},
  teamMembers = [],
  showDetails = true
}) => {
  // Calculate capacity utilization percentage
  const utilizationPercentage = useMemo(() => {
    if (!teamSize || !duration) return 0;
    const maxCapacity = teamSize * duration * 8; // 8 hours per day
    return Math.min((totalEffort / maxCapacity) * 100, 100);
  }, [totalEffort, teamSize, duration]);

  // Calculate developer-wise breakdown with per-day work
  const developerBreakdown = useMemo(() => {
    if (!developerWorkload || Object.keys(developerWorkload).length === 0) {
      return [];
    }

    return Object.entries(developerWorkload).map(([userId, workload]) => {
      const member = teamMembers.find(m => m.user._id === userId);
      const totalHours = workload.totalHours || 0;
      const hoursPerDay = duration > 0 ? totalHours / duration : 0;
      const utilizationPercent = duration > 0 ? (totalHours / (duration * 8)) * 100 : 0;

      return {
        userId,
        name: member?.user?.name || 'Unknown',
        email: member?.user?.email || '',
        specialization: member?.specialization || 'None',
        totalHours,
        hoursPerDay: Math.round(hoursPerDay * 10) / 10,
        taskCount: workload.taskCount || 0,
        featureCount: workload.features?.length || 0,
        utilizationPercent: Math.round(utilizationPercent),
        status: hoursPerDay > 8 ? 'overloaded' : 
                hoursPerDay > 6 ? 'high' : 
                hoursPerDay > 3 ? 'balanced' : 'underutilized'
      };
    }).sort((a, b) => b.hoursPerDay - a.hoursPerDay); // Sort by workload descending
  }, [developerWorkload, teamMembers, duration]);

  // Calculate average hours per day across all developers
  const avgHoursPerDay = useMemo(() => {
    if (developerBreakdown.length === 0) return 0;
    const totalHoursPerDay = developerBreakdown.reduce((sum, dev) => sum + dev.hoursPerDay, 0);
    return Math.round((totalHoursPerDay / developerBreakdown.length) * 10) / 10;
  }, [developerBreakdown]);

  // Get status color based on utilization
  const getStatusColor = () => {
    if (utilizationPercentage > 90) return 'red';
    if (utilizationPercentage > 75) return 'amber';
    if (utilizationPercentage > 50) return 'green';
    return 'blue';
  };

  const statusColor = getStatusColor();

  // Get status message
  const getStatusMessage = () => {
    if (utilizationPercentage > 90) return 'Overloaded - Consider reducing scope or extending duration';
    if (utilizationPercentage > 75) return 'High utilization - Monitor closely';
    if (utilizationPercentage > 50) return 'Good utilization - Balanced workload';
    return 'Low utilization - Consider adding more features';
  };

  // Get developer status color
  const getDevStatusColor = (status) => {
    switch (status) {
      case 'overloaded': return 'red';
      case 'high': return 'amber';
      case 'balanced': return 'green';
      case 'underutilized': return 'blue';
      default: return 'gray';
    }
  };

  // Get developer status label
  const getDevStatusLabel = (status) => {
    switch (status) {
      case 'overloaded': return 'Overloaded';
      case 'high': return 'High Load';
      case 'balanced': return 'Balanced';
      case 'underutilized': return 'Underutilized';
      default: return 'Unknown';
    }
  };

  if (!capacityMetrics || teamSize === 0 || duration === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Main capacity card */}
      <div className={`bg-gradient-to-r from-${statusColor}-50 to-${statusColor}-100 border-2 border-${statusColor}-200 rounded-xl p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Sprint Capacity Analysis</h3>
            <p className="text-sm text-gray-600">{getStatusMessage()}</p>
          </div>
          <div className={`bg-${statusColor}-500 text-white px-4 py-2 rounded-lg font-bold text-lg`}>
            {Math.round(utilizationPercentage)}%
          </div>
        </div>

        {/* Capacity bar */}
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full bg-${statusColor}-500 transition-all duration-500 ease-out`}
            style={{ width: `${utilizationPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
            {totalEffort}h / {teamSize * duration * 8}h capacity
          </div>
        </div>

        {/* Key metrics grid */}
        {showDetails && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Effort per Day</div>
              <div className="text-2xl font-bold text-gray-900">
                {capacityMetrics.effortPerDay}h
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {duration} days total
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Per Developer</div>
              <div className="text-2xl font-bold text-gray-900">
                {capacityMetrics.effortPerDeveloper}h
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {teamSize} developer{teamSize !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Avg Hours/Dev/Day</div>
              <div className={`text-2xl font-bold ${
                avgHoursPerDay > 8 ? 'text-red-600' :
                avgHoursPerDay > 6 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {avgHoursPerDay}h
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {avgHoursPerDay > 8 ? 'Overloaded' :
                 avgHoursPerDay > 6 ? 'High load' :
                 'Balanced'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DEVELOPER-WISE WORKLOAD BREAKDOWN */}
      {developerBreakdown.length > 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                👥 Developer Workload Breakdown
              </h3>
              <p className="text-sm text-gray-600">
                Per-day work allocation for each developer
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600">Sprint Average</div>
              <div className={`text-xl font-bold ${
                avgHoursPerDay > 8 ? 'text-red-600' :
                avgHoursPerDay > 6 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {avgHoursPerDay}h/day
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {developerBreakdown.map((dev) => {
              const statusColor = getDevStatusColor(dev.status);
              const statusLabel = getDevStatusLabel(dev.status);

              return (
                <div 
                  key={dev.userId}
                  className={`border-2 rounded-xl p-4 transition-all hover:shadow-md ${
                    dev.status === 'overloaded' ? 'border-red-300 bg-red-50' :
                    dev.status === 'high' ? 'border-amber-300 bg-amber-50' :
                    dev.status === 'balanced' ? 'border-green-300 bg-green-50' :
                    'border-blue-300 bg-blue-50'
                  }`}
                >
                  {/* Developer Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        dev.status === 'overloaded' ? 'bg-red-200 text-red-700' :
                        dev.status === 'high' ? 'bg-amber-200 text-amber-700' :
                        dev.status === 'balanced' ? 'bg-green-200 text-green-700' :
                        'bg-blue-200 text-blue-700'
                      }`}>
                        {dev.name.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Developer Info */}
                      <div>
                        <div className="font-bold text-gray-900">{dev.name}</div>
                        <div className="text-xs text-gray-600">{dev.specialization}</div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      dev.status === 'overloaded' ? 'bg-red-200 text-red-800' :
                      dev.status === 'high' ? 'bg-amber-200 text-amber-800' :
                      dev.status === 'balanced' ? 'bg-green-200 text-green-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {statusLabel}
                    </div>
                  </div>

                  {/* Workload Metrics */}
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Total Hours</div>
                      <div className="text-lg font-bold text-gray-900">{dev.totalHours}h</div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Hours/Day</div>
                      <div className={`text-lg font-bold ${
                        dev.hoursPerDay > 8 ? 'text-red-600' :
                        dev.hoursPerDay > 6 ? 'text-amber-600' :
                        'text-green-600'
                      }`}>
                        {dev.hoursPerDay}h
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Tasks</div>
                      <div className="text-lg font-bold text-gray-900">{dev.taskCount}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Features</div>
                      <div className="text-lg font-bold text-gray-900">{dev.featureCount}</div>
                    </div>
                  </div>

                  {/* Workload Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Daily Capacity Utilization</span>
                      <span className="font-bold text-gray-900">{dev.utilizationPercent}%</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                          dev.status === 'overloaded' ? 'bg-red-500' :
                          dev.status === 'high' ? 'bg-amber-500' :
                          dev.status === 'balanced' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(dev.utilizationPercent, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>0h/day</span>
                      <span>8h/day (optimal)</span>
                    </div>
                  </div>

                  {/* Optimization Suggestions */}
                  {dev.status === 'overloaded' && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-100 px-3 py-2 rounded-lg border border-red-200">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-bold mb-1">⚠️ Overloaded!</div>
                        <div>Reduce workload by {Math.round((dev.hoursPerDay - 8) * duration)}h or redistribute {Math.ceil((dev.hoursPerDay - 8) / 8 * duration)} tasks</div>
                      </div>
                    </div>
                  )}

                  {dev.status === 'underutilized' && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded-lg border border-blue-200">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-bold mb-1">💡 Underutilized</div>
                        <div>Can handle {Math.round((8 - dev.hoursPerDay) * duration)}h more work (~{Math.floor((8 - dev.hoursPerDay) / 8 * duration)} additional tasks)</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {developerBreakdown.filter(d => d.status === 'overloaded').length}
                </div>
                <div className="text-xs text-red-600 font-medium">Overloaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {developerBreakdown.filter(d => d.status === 'high').length}
                </div>
                <div className="text-xs text-amber-600 font-medium">High Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {developerBreakdown.filter(d => d.status === 'balanced').length}
                </div>
                <div className="text-xs text-green-600 font-medium">Balanced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {developerBreakdown.filter(d => d.status === 'underutilized').length}
                </div>
                <div className="text-xs text-blue-600 font-medium">Underutilized</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {capacityMetrics.warnings && capacityMetrics.warnings.length > 0 && (
        <div className="space-y-2">
          {capacityMetrics.warnings.map((warning, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200"
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {!capacityMetrics.isRealistic && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-500 rounded-full p-2 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-2">⚠️ Unrealistic Workload</h4>
              <p className="text-sm text-red-700 mb-3">
                The total effort ({totalEffort}h) exceeds available capacity ({teamSize * duration * 8}h).
              </p>
              <div className="text-sm text-red-800 space-y-1">
                <p className="font-medium">Recommendations:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Reduce sprint scope by removing some features</li>
                  <li>Extend sprint duration to {Math.ceil(totalEffort / (teamSize * 8))} days</li>
                  <li>Add {Math.ceil((totalEffort / (duration * 8)) - teamSize)} more developer{Math.ceil((totalEffort / (duration * 8)) - teamSize) !== 1 ? 's' : ''}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success indicator */}
      {capacityMetrics.isRealistic && !capacityMetrics.isOverloaded && utilizationPercentage > 50 && utilizationPercentage < 85 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 mb-1">✅ Well-Balanced Sprint</h4>
              <p className="text-sm text-green-700">
                Sprint capacity is well-utilized with realistic workload distribution. Good planning!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintCapacityMetrics;
