import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Suspense, lazy, useEffect } from 'react'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import { preloadCriticalData } from './api/config'

// Lazy load components for better performance
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ProductPlanning = lazy(() => import('./pages/ProductPlanning'))
const SprintPlanner = lazy(() => import('./pages/SprintPlanner'))
const MyTasks = lazy(() => import('./pages/MyTasks'))
const AllTeamTasks = lazy(() => import('./pages/AllTeamTasks'))
const SprintHistory = lazy(() => import('./pages/SprintHistory'))
const AuthDebug = lazy(() => import('./components/AuthDebug'))

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
)

// Optimized loading component for page transitions
const PageLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
)

function AppContent() {
  const location = useLocation()
  
  // Hide navbar on login and register pages
  const hideNavbar = ['/login', '/register'].includes(location.pathname)

  // Preload critical data on app start
  useEffect(() => {
    preloadCriticalData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/product-planning" element={
            <PrivateRoute roles={['Product Manager']}>
              <ProductPlanning />
            </PrivateRoute>
          } />
          
          <Route path="/sprint-planner" element={
            <PrivateRoute roles={['Team Lead']}>
              <SprintPlanner />
            </PrivateRoute>
          } />
          
          <Route path="/my-tasks" element={
            <PrivateRoute roles={['Developer', 'Product Manager']}>
              <MyTasks />
            </PrivateRoute>
          } />
          
          <Route path="/all-team-tasks" element={
            <PrivateRoute roles={['Team Lead']}>
              <AllTeamTasks />
            </PrivateRoute>
          } />
          
          <Route path="/sprint-history" element={
            <PrivateRoute roles={['Team Lead', 'Product Manager']}>
              <SprintHistory />
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      
      {/* Debug component - only in development */}
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <AuthDebug />
        </Suspense>
      )}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <AppContent />
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
