import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import AuthDebug from './components/AuthDebug'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProductPlanning from './pages/ProductPlanning'
import SprintPlanner from './pages/SprintPlanner'
import MyTasks from './pages/MyTasks'
import AllTeamTasks from './pages/AllTeamTasks'
import SprintHistory from './pages/SprintHistory'

function AppContent() {
  const location = useLocation()
  
  // Hide navbar on login and register pages
  const hideNavbar = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
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
      
      {/* Debug component - remove in production */}
      {process.env.NODE_ENV === 'development' && <AuthDebug />}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
