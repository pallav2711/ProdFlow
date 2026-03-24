import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import { Suspense, lazy, useEffect, memo, useMemo } from 'react'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import { preloadCriticalData } from './api/config'

// Lazy load components for better performance with preloading
const Landing = lazy(() => 
  import('./pages/Landing').then(module => {
    // Preload other critical components
    import('./pages/Login');
    import('./pages/Dashboard');
    return module;
  })
)
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ProductPlanning = lazy(() => import('./pages/ProductPlanning'))
const SprintPlanner = lazy(() => import('./pages/SprintPlanner'))
const MyTasks = lazy(() => import('./pages/MyTasks'))
const AllTeamTasks = lazy(() => import('./pages/AllTeamTasks'))
const SprintHistory = lazy(() => import('./pages/SprintHistory'))

// Optimized loading component with better UX
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <div className="animate-ping absolute top-0 left-0 rounded-full h-12 w-12 border-2 border-indigo-400 opacity-20"></div>
      </div>
      <p className="text-gray-600 text-sm font-medium">Loading ProdFlow AI...</p>
    </div>
  </div>
))

// Optimized page loader for transitions
const PageLoader = memo(() => (
  <div className="flex items-center justify-center py-20">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      <span className="text-gray-600 text-sm">Loading...</span>
    </div>
  </div>
))

// Memoized AppContent to prevent unnecessary re-renders
const AppContent = memo(() => {
  const location = useLocation()
  
  // Memoize navbar visibility calculation
  const hideNavbar = useMemo(() => 
    ['/login', '/register'].includes(location.pathname), 
    [location.pathname]
  )

  // Preload critical data on app start
  useEffect(() => {
    preloadCriticalData()
  }, [])

  // Preload components based on current route
  useEffect(() => {
    const preloadComponents = async () => {
      if (location.pathname === '/') {
        // Preload login and register for landing page
        import('./pages/Login');
        import('./pages/Register');
      } else if (location.pathname === '/login') {
        // Preload dashboard for after login
        import('./pages/Dashboard');
      }
    }
    
    preloadComponents();
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes with role-based access */}
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
    </div>
  )
})

// Set display names for better debugging
LoadingSpinner.displayName = 'LoadingSpinner';
PageLoader.displayName = 'PageLoader';
AppContent.displayName = 'AppContent';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <DashboardProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <AppContent />
            </Suspense>
          </DashboardProvider>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
