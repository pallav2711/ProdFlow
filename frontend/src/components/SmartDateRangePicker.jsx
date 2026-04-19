/**
 * ============================================================================
 * SMART DATE RANGE PICKER COMPONENT
 * ============================================================================
 * Intelligent date range selector with auto-calculated duration
 * 
 * Features:
 * - Auto-calculate duration when dates change
 * - Prevent invalid date selections
 * - Show duration in real-time
 * - Visual feedback for errors
 * - Support for working days calculation
 * ============================================================================
 */

import { useMemo } from 'react';
import { calculateSprintDuration, calculateWorkingDays } from '../utils/formCalculations';

const SmartDateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  errors = {},
  touched = {},
  showWorkingDays = false,
  minDate = null,
  maxDate = null,
  label = 'Sprint Dates',
  required = true
}) => {
  // Auto-calculate duration
  const duration = useMemo(() => {
    return calculateSprintDuration(startDate, endDate);
  }, [startDate, endDate]);

  // Calculate working days (optional)
  const workingDays = useMemo(() => {
    if (!showWorkingDays) return 0;
    return calculateWorkingDays(startDate, endDate);
  }, [startDate, endDate, showWorkingDays]);

  // Check if dates are valid
  const hasError = errors.dates || errors.startDate || errors.endDate;
  const showError = (touched.startDate || touched.endDate) && hasError;

  // Get today's date for min date default
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Auto-calculated duration display */}
        {duration > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {duration} {duration === 1 ? 'day' : 'days'}
            </span>
            {showWorkingDays && workingDays > 0 && (
              <span className="text-gray-500">
                ({workingDays} working days)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Date inputs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Start Date {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            min={minDate || today}
            max={maxDate}
            required={required}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              showError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            End Date {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || minDate || today}
            max={maxDate}
            required={required}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              showError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Error message */}
      {showError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{hasError}</span>
        </div>
      )}

      {/* Duration info card */}
      {duration > 0 && !showError && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-500 rounded-full p-2 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                ✨ Auto-Calculated Duration
              </h4>
              <p className="text-xs text-indigo-700">
                Sprint will run for <span className="font-bold">{duration} days</span>
                {showWorkingDays && workingDays > 0 && (
                  <span> ({workingDays} working days excluding weekends)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Duration warnings */}
      {duration > 0 && (
        <>
          {duration < 7 && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Short sprint: Consider extending to at least 1 week for better planning</span>
            </div>
          )}
          {duration > 21 && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Long sprint: Consider breaking into smaller sprints (2-3 weeks recommended)</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SmartDateRangePicker;
