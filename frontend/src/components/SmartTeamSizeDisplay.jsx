/**
 * ============================================================================
 * SMART TEAM SIZE DISPLAY COMPONENT
 * ============================================================================
 * Auto-calculated team size based on unique developer assignments
 * 
 * Features:
 * - Auto-count unique developers
 * - Show developer breakdown
 * - Display workload distribution
 * - Visual capacity indicators
 * - Read-only (auto-calculated)
 * ============================================================================
 */

import { useMemo } from 'react';

const SmartTeamSizeDisplay = ({
  teamSize,
  developerWorkload = {},
  teamMembers = [],
  totalEffort = 0,
  duration = 0,
  showDetails = true
}) => {
  // Get developer details
  const developerDetails = useMemo(() => {
    return Object.entries(developerWorkload).map(([userId, workload]) => {
      const member = teamMembers.find(m => m.user._id === userId);
      return {
        userId,
        name: member?.user?.name || 'Unknown',
        email: member?.user?.email || '',
        specialization: member?.specialization || 'None',
        totalHours: workload.totalHours,
        taskCount: workload.taskCount,
        features: workload.features.length,
        hoursPerDay: duration > 0 ? Math.round((workload.totalHours / duration) * 10) / 10 : 0
      };
    });
  }, [developerWorkload, teamMembers, duration]);

  // Calculate average workload
  const avgWorkload = useMemo(() => {
    if (teamSize === 0) return 0;
    return Math.round((totalEffort / teamSize) * 10) / 10;
  }, [totalEffort, teamSize]);

  // Find overloaded developers (>8 hours/day)
  const overloadedDevs = useMemo(() => {
    return developerDetails.filter(dev => dev.hoursPerDay > 8);
  }, [developerDetails]);

  return (
    <div className="space-y-4">
      {/* Main display */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Team Size (Auto-Calculated)
        </label>
        
        <div className="relative">
          {/* Read-only input with auto-calculated value */}
          <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {teamSize}
                </div>
                <div className="text-xs text-gray-600">
                  {teamSize === 0 ? 'No developers assigned' : 
                   teamSize === 1 ? 'Unique developer' : 
                   'Unique developers'}
                </div>
              </div>
            </div>
            
            {/* Auto-calculated badge */}
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Auto-Calculated
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      {teamSize > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                ✨ Automatically Counted
              </h4>
              <p className="text-xs text-green-700">
                System counted <span className="font-bold">{teamSize} unique developer{teamSize !== 1 ? 's' : ''}</span> from feature assignments.
                {teamSize > 1 && ' Developers assigned to multiple features are counted only once.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No developers warning */}
      {teamSize === 0 && totalEffort > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>No developers assigned but features require {totalEffort} hours of effort</span>
        </div>
      )}

      {/* Overloaded developers warning */}
      {overloadedDevs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>
            {overloadedDevs.length} developer{overloadedDevs.length !== 1 ? 's' : ''} overloaded (&gt;8 hours/day)
          </span>
        </div>
      )}

      {/* Developer breakdown */}
      {showDetails && teamSize > 0 && (
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Developer Workload Distribution
          </h4>
          
          <div className="space-y-2">
            {developerDetails.map((dev) => (
              <div 
                key={dev.userId} 
                className={`p-3 rounded-lg border ${
                  dev.hoursPerDay > 8 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600">
                        {dev.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dev.name}</div>
                      <div className="text-xs text-gray-500">{dev.specialization}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{dev.totalHours}h</div>
                    <div className="text-xs text-gray-500">{dev.hoursPerDay}h/day</div>
                  </div>
                </div>
                
                {/* Workload bar */}
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                      dev.hoursPerDay > 8 ? 'bg-red-500' : 
                      dev.hoursPerDay > 6 ? 'bg-amber-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((dev.hoursPerDay / 10) * 100, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <span>{dev.taskCount} task{dev.taskCount !== 1 ? 's' : ''}</span>
                  <span>{dev.features} feature{dev.features !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Average workload */}
          {teamSize > 1 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Average workload per developer:</span>
                <span className="font-bold text-gray-900">{avgWorkload}h</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartTeamSizeDisplay;
