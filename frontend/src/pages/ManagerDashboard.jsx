/**
 * Manager Dashboard with AI Performance Analytics
 * Displays team performance metrics, developer rankings, and AI insights
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PageHeader from '../components/PageHeader'
import PageSkeleton from '../components/PageSkeleton'

const ManagerDashboard = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTab, setSelectedTab] = useState('overview') // overview, developers, teamleads, insights

  useEffect(() => {
    if (user && user.role === 'Product Manager') {
      fetchPerformanceData()
    }
  }, [user])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Call AI Performance Analysis Service
      const aiServiceUrl = import.meta.env.VITE_AI_PERFORMANCE_URL || import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001'
      const response = await fetch(`${aiServiceUrl}/ai/manager-insights`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance data')
      }
      
      const data = await response.json()
      setPerformanceData(data)
    } catch (error) {
      console.error('Error fetching performance data:', error)
      setError(error.message)
      showToast('Error loading performance analytics', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'Product Manager') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">This dashboard is only available for Product Managers.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <PageSkeleton variant="dense" cards={6} rows={8} />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-semibold">Error Loading Performance Data</p>
          </div>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={fetchPerformanceData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <PageHeader
        title="🤖 AI Performance Analytics"
        subtitle="Team performance insights powered by machine learning"
        rightContent={
          <button
            onClick={fetchPerformanceData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        }
      />

      {(() => {
        const dc = performanceData?.summary?.data_connection
        const tasks = performanceData?.total_tasks_analyzed ?? 0
        const sprints = performanceData?.total_sprints_analyzed ?? 0
        const liveButNoWork =
          tasks === 0 &&
          sprints === 0 &&
          (performanceData?.summary?.total_developers ?? 0) === 0 &&
          (performanceData?.summary?.total_team_leads ?? 0) === 0

        if (dc && dc.ok === false) {
          return (
            <div
              className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-amber-950 text-sm shadow-sm"
              role="status"
            >
              <p className="font-semibold text-amber-950">Connected to the AI service, but it could not read analytics from your backend</p>
              {dc.message && <p className="mt-2 text-amber-900">{dc.message}</p>}
              <p className="mt-3 text-xs text-amber-900/90 leading-relaxed">
                Typical fix on Render: set the same <code className="rounded bg-amber-100/80 px-1">AI_SERVICE_API_KEY</code>{' '}
                on the Node API and the Python AI service, and set{' '}
                <code className="rounded bg-amber-100/80 px-1">BACKEND_API_URL</code> on the AI service to your backend
                base (for example <code className="rounded bg-amber-100/80 px-1">https://your-api.onrender.com/api</code>
                — include <code className="rounded bg-amber-100/80 px-1">/api</code>).
              </p>
              {dc.code && (
                <p className="mt-2 text-xs font-mono text-amber-800/80">
                  code: {dc.code}
                  {dc.http_status != null ? ` · HTTP ${dc.http_status}` : ''}
                </p>
              )}
            </div>
          )
        }

        if (liveButNoWork) {
          return (
            <div
              className="mb-6 rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-4 text-blue-950 text-sm shadow-sm"
              role="status"
            >
              <p className="font-semibold">No sprint or task data yet</p>
              <p className="mt-2 text-blue-900/90 leading-relaxed">
                Analytics only appear after you create sprints and tasks in ProdFlow and assign work to developers. If you
                already have data, confirm this environment uses the same database as where you added it.
              </p>
            </div>
          )
        }

        return null
      })()}

      {/* Summary Stats */}
      {performanceData?.summary && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-900">Total Developers</h3>
              <div className="bg-blue-200 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-900">{performanceData.summary.total_developers}</p>
            <p className="text-xs text-blue-700 mt-1">
              {performanceData.summary.high_performers} high performers
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-green-900">Avg Efficiency</h3>
              <div className="bg-green-200 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-900">
              {performanceData.summary.avg_developer_efficiency?.toFixed(1)}%
            </p>
            <p className="text-xs text-green-700 mt-1">Developer performance</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-purple-900">Team Leads</h3>
              <div className="bg-purple-200 p-2 rounded-lg">
                <svg className="w-5 h-5 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-900">{performanceData.summary.total_team_leads}</p>
            <p className="text-xs text-purple-700 mt-1">
              {performanceData.summary.avg_teamlead_efficiency?.toFixed(1)}% avg efficiency
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-orange-900">Tasks Analyzed</h3>
              <div className="bg-orange-200 p-2 rounded-lg">
                <svg className="w-5 h-5 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-900">{performanceData.total_tasks_analyzed}</p>
            <p className="text-xs text-orange-700 mt-1">
              {performanceData.total_sprints_analyzed} sprints
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('developers')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'developers'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Developers ({performanceData?.developers?.length || 0})
            </button>
            <button
              onClick={() => setSelectedTab('teamleads')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'teamleads'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Team Leads ({performanceData?.team_leads?.length || 0})
            </button>
            <button
              onClick={() => setSelectedTab('insights')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'insights'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Insights ({performanceData?.team_insights?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <OverviewTab performanceData={performanceData} />
      )}
      
      {selectedTab === 'developers' && (
        <DevelopersTab developers={performanceData?.developers || []} />
      )}
      
      {selectedTab === 'teamleads' && (
        <TeamLeadsTab teamLeads={performanceData?.team_leads || []} />
      )}
      
      {selectedTab === 'insights' && (
        <InsightsTab insights={performanceData?.team_insights || []} />
      )}
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ performanceData }) {
  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Top Performers
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {performanceData?.developers?.slice(0, 3).map((dev, index) => (
            <div key={dev.developer_id} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{dev.developer_name}</p>
                  <p className="text-xs text-gray-600">{dev.performance_cluster}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-2xl font-bold text-yellow-700">{dev.efficiency_score}%</span>
                <span className="text-xs text-gray-600">{dev.tasks_completed} tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Distribution</h3>
          <div className="space-y-3">
            {['High Performer', 'Average Performer', 'Needs Improvement'].map((cluster) => {
              const count = performanceData?.developers?.filter(d => d.performance_cluster === cluster).length || 0
              const percentage = performanceData?.developers?.length > 0 
                ? (count / performanceData.developers.length * 100).toFixed(0)
                : 0
              
              return (
                <div key={cluster}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cluster}</span>
                    <span className="text-sm font-bold text-gray-900">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        cluster === 'High Performer' ? 'bg-green-500' :
                        cluster === 'Average Performer' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Team Lead Performance</h3>
          <div className="space-y-3">
            {performanceData?.team_leads?.slice(0, 3).map((tl) => (
              <div key={tl.team_lead_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{tl.team_lead_name}</p>
                  <p className="text-xs text-gray-600">{tl.sprints_managed} sprints managed</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">{tl.efficiency_score}%</p>
                  <p className="text-xs text-gray-600">efficiency</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Developers Tab Component
function DevelopersTab({ developers }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Developer Performance Rankings</h3>
        <div className="space-y-3">
          {developers.map((dev) => (
            <div key={dev.developer_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                    #{dev.rank}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{dev.developer_name}</p>
                    <p className="text-sm text-gray-600">{dev.developer_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{dev.efficiency_score}%</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    dev.performance_cluster === 'High Performer' ? 'bg-green-100 text-green-700' :
                    dev.performance_cluster === 'Average Performer' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {dev.performance_cluster}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{dev.tasks_completed}</p>
                  <p className="text-xs text-gray-600">Tasks Done</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{(dev.completion_rate * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{dev.avg_review_cycles.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">Avg Reviews</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{(dev.on_time_completion_rate * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-600">On Time</p>
                </div>
              </div>

              {dev.trend && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className={`text-xs font-medium ${
                    dev.trend === 'improving' ? 'text-green-600' :
                    dev.trend === 'declining' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {dev.trend === 'improving' ? '📈 Improving' :
                     dev.trend === 'declining' ? '📉 Declining' :
                     '➡️ Stable'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Team Leads Tab Component
function TeamLeadsTab({ teamLeads }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Team Lead Performance</h3>
        <div className="space-y-4">
          {teamLeads.map((tl) => (
            <div key={tl.team_lead_id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-lg text-gray-900">{tl.team_lead_name}</p>
                  <p className="text-sm text-gray-600">{tl.sprints_managed} sprints managed</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">{tl.efficiency_score}%</p>
                  <p className="text-xs text-gray-600">Efficiency Score</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-bold text-blue-900">{tl.planning_quality_score.toFixed(0)}%</p>
                  <p className="text-xs text-blue-700">Planning Quality</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-bold text-green-900">{tl.avg_review_time_hours.toFixed(1)}h</p>
                  <p className="text-xs text-green-700">Avg Review Time</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-bold text-purple-900">{(tl.avg_sprint_success_rate * 100).toFixed(0)}%</p>
                  <p className="text-xs text-purple-700">Sprint Success</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm font-bold text-orange-900">{tl.task_distribution_balance_score.toFixed(0)}%</p>
                  <p className="text-xs text-orange-700">Task Balance</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Insights Tab Component
function InsightsTab({ insights }) {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'recommendation':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'recommendation':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div key={index} className={`border rounded-lg p-4 ${getInsightColor(insight.insight_type)}`}>
          <div className="flex items-start gap-3">
            {getInsightIcon(insight.insight_type)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-600 uppercase">{insight.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                  insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {insight.priority}
                </span>
              </div>
              <p className="text-sm text-gray-900 font-medium">{insight.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ManagerDashboard
