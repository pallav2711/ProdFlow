import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api/config'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const [invitations, setInvitations] = useState([])
  const [showInvitationsModal, setShowInvitationsModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchInvitations()
    }
  }, [user])

  const fetchInvitations = async () => {
    try {
      const res = await api.get('/teams/invitations')
      setInvitations(res.data.invitations)
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await api.put(`/teams/invitations/${invitationId}/accept`)
      alert('Invitation accepted!')
      fetchInvitations()
      setShowInvitationsModal(false)
    } catch (error) {
      alert(error.response?.data?.message || 'Error accepting invitation')
    }
  }

  const handleRejectInvitation = async (invitationId) => {
    try {
      await api.put(`/teams/invitations/${invitationId}/reject`)
      alert('Invitation rejected')
      fetchInvitations()
    } catch (error) {
      alert(error.response?.data?.message || 'Error rejecting invitation')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center h-16 px-6">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-accent tracking-tight">
                ProdFlow <span className="text-indigo-600">AI</span>
              </Link>
            </div>

            <div className="flex items-center space-x-8">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-accent transition-colors px-3 py-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  
                  {user.role === 'Product Manager' && (
                    <Link to="/product-planning" className="text-gray-700 hover:text-accent transition-colors px-3 py-2 text-sm font-medium">
                      Product Planning
                    </Link>
                  )}
                  
                  {user.role === 'Team Lead' && (
                    <>
                      <Link to="/sprint-planner" className="text-gray-700 hover:text-accent transition-colors px-3 py-2 text-sm font-medium">
                        Sprint Planner
                      </Link>
                      <Link to="/all-team-tasks" className="text-gray-700 hover:text-accent transition-colors px-3 py-2 text-sm font-medium">
                        All Team Tasks
                      </Link>
                      <Link to="/sprint-history" className="text-gray-700 hover:text-accent transition-colors px-3 py-2 text-sm font-medium">
                        Sprint History
                      </Link>
                    </>
                  )}

                  {(user.role === 'Developer' || user.role === 'Product Manager') && (
                    <Link to="/my-tasks" className="text-gray-700 hover:text-accent transition-colors px-3 py-2 text-sm font-medium">
                      My Tasks
                    </Link>
                  )}

                  {/* Invitations Badge */}
                  <button
                    onClick={() => setShowInvitationsModal(true)}
                    className="relative text-gray-700 hover:text-accent transition-colors px-3 py-2 text-sm font-medium"
                  >
                    Invitations
                    {invitations.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {invitations.length}
                      </span>
                    )}
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    {user.name} ({user.role})
                  </span>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-accent text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-all hover:shadow-lg text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {isLanding && (
                    <>
                      <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-accent transition-colors text-sm font-medium">
                        Features
                      </button>
                      <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-accent transition-colors text-sm font-medium">
                        How It Works
                      </button>
                      <button onClick={() => scrollToSection('ai-powered')} className="text-gray-700 hover:text-accent transition-colors text-sm font-medium">
                        AI Technology
                      </button>
                    </>
                  )}
                  <Link to="/login" className="text-gray-700 hover:text-accent transition-colors text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="bg-accent text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm font-medium">
                    Start Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Invitations Modal */}
      {showInvitationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Project Invitations</h2>
              <button
                onClick={() => setShowInvitationsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {invitations.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No pending invitations</p>
            ) : (
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{invitation.product?.name}</h3>
                        <p className="text-sm text-gray-600">{invitation.product?.vision}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Role: <span className="font-medium">{invitation.role}</span>
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                        Pending
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvitation(invitation._id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectInvitation(invitation._id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
