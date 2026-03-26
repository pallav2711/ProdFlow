import { useState, useEffect } from 'react';
import { runSystemDiagnostics, testNetworkQuality } from '../utils/connectionTest';

const SystemStatus = ({ onClose }) => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [networkQuality, setNetworkQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const [diagResults, networkResults] = await Promise.all([
        runSystemDiagnostics(),
        testNetworkQuality()
      ]);
      setDiagnostics(diagResults);
      setNetworkQuality(networkResults);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'ok' || status === 'connected') return 'text-green-600';
    if (status === 'error' || status === 'disconnected') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (status) => {
    if (status === 'ok' || status === 'connected') return '✅';
    if (status === 'error' || status === 'disconnected') return '❌';
    return '⚠️';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Running system diagnostics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">System Status</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {diagnostics && (
          <div className="space-y-6">
            {/* API Health */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">API Health</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Status: </span>
                  <span className={getStatusColor(diagnostics.tests.apiHealth.status)}>
                    {getStatusIcon(diagnostics.tests.apiHealth.status)} {diagnostics.tests.apiHealth.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Uptime: </span>
                  <span>{diagnostics.tests.apiHealth.services?.uptime || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Network Quality */}
            {networkQuality && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Network Quality</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="font-medium">Success Rate: </span>
                    <span className={networkQuality.successRate >= 80 ? 'text-green-600' : 'text-red-600'}>
                      {networkQuality.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Avg Latency: </span>
                    <span>{networkQuality.averageLatency ? `${networkQuality.averageLatency.toFixed(0)}ms` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Min Latency: </span>
                    <span>{networkQuality.minLatency ? `${networkQuality.minLatency}ms` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Max Latency: </span>
                    <span>{networkQuality.maxLatency ? `${networkQuality.maxLatency}ms` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Environment */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Environment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">API URL:</span> {diagnostics.tests.environment.apiBaseUrl}</div>
                <div><span className="font-medium">Environment:</span> {diagnostics.tests.environment.nodeEnv}</div>
                <div><span className="font-medium">AI Service:</span> {diagnostics.tests.environment.aiServiceUrl}</div>
                <div><span className="font-medium">AI Enabled:</span> {diagnostics.tests.environment.enableAI}</div>
              </div>
            </div>

            {/* Authentication */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Authentication</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Access Token: </span>
                  <span className={diagnostics.tests.auth.hasAccessToken ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.tests.auth.hasAccessToken ? '✅ Present' : '❌ Missing'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Refresh Token: </span>
                  <span className={diagnostics.tests.auth.hasRefreshToken ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.tests.auth.hasRefreshToken ? '✅ Present' : '❌ Missing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Browser Capabilities */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Browser Capabilities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="font-medium">Local Storage: </span>
                  <span className={diagnostics.tests.browser.localStorage ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.tests.browser.localStorage ? '✅' : '❌'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Session Storage: </span>
                  <span className={diagnostics.tests.browser.sessionStorage ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.tests.browser.sessionStorage ? '✅' : '❌'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Fetch API: </span>
                  <span className={diagnostics.tests.browser.fetch ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.tests.browser.fetch ? '✅' : '❌'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Online: </span>
                  <span className={diagnostics.tests.browser.online ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.tests.browser.online ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={runDiagnostics}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
              >
                Refresh Diagnostics
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {new Date(diagnostics.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;