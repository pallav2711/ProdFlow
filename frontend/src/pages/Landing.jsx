import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-primary">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-20 sm:pb-28 lg:pb-40 overflow-hidden min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orb 1 */}
          <div className="absolute top-10 sm:top-20 -left-10 sm:-left-20 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          {/* Gradient Orb 2 */}
          <div className="absolute top-20 sm:top-40 -right-10 sm:-right-20 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          {/* Gradient Orb 3 */}
          <div className="absolute -bottom-10 sm:-bottom-20 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className={`relative z-10 text-center transition-all duration-1000 w-full ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Trust Badge */}
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full mb-8 sm:mb-10 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-xs sm:text-sm text-gray-700 font-medium">Built for agile teams & academic excellence</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-accent mb-6 sm:mb-8 tracking-tight leading-tight px-2">
            Smarter Planning.<br />
            Stronger Sprints.<br />
            <span className="text-indigo-600">Better Delivery.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 sm:mb-14 max-w-4xl mx-auto leading-relaxed px-4">
            AI-powered sprint planning that predicts success before you commit. Make data-driven decisions, not guesses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-16 sm:mb-20 px-4">
            <Link 
              to="/register" 
              className="group bg-accent text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold hover:bg-gray-800 transition-all hover:shadow-2xl hover:-translate-y-1 inline-flex items-center justify-center touch-target"
            >
              Start Planning Free
              <svg className="w-5 sm:w-6 h-5 sm:h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a 
              href="https://youtu.be/QwM0esu3Kcw"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-accent px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold border-2 border-gray-200 hover:border-accent transition-all hover:shadow-lg inline-flex items-center justify-center gap-2 touch-target"
            >
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              View Demo
            </a>
          </div>

          {/* Stats/Social Proof */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto pt-6 sm:pt-8 border-t border-gray-200 px-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">AI-Driven</div>
              <div className="text-xs sm:text-sm text-gray-600">Real ML Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">3-Tier</div>
              <div className="text-xs sm:text-sm text-gray-600">Scalable Architecture</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">Role-Based</div>
              <div className="text-xs sm:text-sm text-gray-600">Access Control</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">Production</div>
              <div className="text-xs sm:text-sm text-gray-600">Ready MVP</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative bg-white py-12 sm:py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 uppercase tracking-wider font-semibold">Designed for Modern Product Teams</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-center justify-items-center opacity-60">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">Product Managers</div>
              <div className="text-xs sm:text-sm text-gray-600">Vision & Strategy</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">Agile Teams</div>
              <div className="text-xs sm:text-sm text-gray-600">Sprint Execution</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">Engineering Leads</div>
              <div className="text-xs sm:text-sm text-gray-600">Capacity Planning</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">Universities</div>
              <div className="text-xs sm:text-sm text-gray-600">Academic Projects</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Powerful Features
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-accent mb-6 leading-tight">
              Everything you need to<br />
              <span className="text-indigo-600">plan smarter</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From product vision to sprint execution, powered by real AI predictions
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Feature 1 */}
            <div className="group relative bg-white p-8 lg:p-10 rounded-3xl border border-gray-200 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 mobile-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-accent mb-4 leading-tight">Product Vision & Backlog</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                  Define clear product vision, create prioritized features with business value scoring, and maintain a healthy backlog.
                </p>
                <div className="flex items-center text-indigo-600 font-semibold text-lg group-hover:translate-x-2 transition-transform duration-300">
                  <span>Strategic planning made simple</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white p-8 lg:p-10 rounded-3xl border border-gray-200 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 mobile-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-accent mb-4 leading-tight">Sprint Planning & Capacity</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                  Create sprints with team capacity in mind, assign features intelligently, and track progress with visual timelines.
                </p>
                <div className="flex items-center text-indigo-600 font-semibold text-lg group-hover:translate-x-2 transition-transform duration-300">
                  <span>Never overcommit again</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature 3 - Highlighted */}
            <div className="group relative bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 lg:p-10 rounded-3xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 mobile-card overflow-hidden lg:transform lg:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full mb-6">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI POWERED
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">AI Sprint Success Prediction</h3>
                <p className="text-indigo-100 mb-6 leading-relaxed text-lg">
                  Get real-time success probability before committing. ML model analyzes team capacity, workload, and historical patterns.
                </p>
                <div className="flex items-center text-white font-semibold text-lg group-hover:translate-x-2 transition-transform duration-300">
                  <span>Data-driven confidence</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Simple Process
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-accent mb-6 leading-tight">
              How ProdFlow AI<br />
              <span className="text-indigo-600">Works</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Three simple steps to smarter sprint planning
            </p>
          </div>

          <div className="relative">
            {/* Connecting Path - Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 z-0">
              <svg className="w-full h-2" viewBox="0 0 1200 8" fill="none">
                <path d="M0 4 Q300 0 600 4 T1200 4" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="8,4"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e5e7eb" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
              {/* Step 1 */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center text-2xl lg:text-3xl font-bold mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    1
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-xl"></div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-200 group-hover:border-indigo-300 group-hover:shadow-xl transition-all duration-300 mobile-card">
                  <h3 className="text-2xl lg:text-3xl font-bold text-accent mb-4">Plan Product & Sprints</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Define your product vision, create features with priorities, and set up sprint parameters with team capacity.
                  </p>
                  <div className="mt-6 flex items-center justify-center space-x-2 text-indigo-600">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl flex items-center justify-center text-2xl lg:text-3xl font-bold mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    2
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-xl"></div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-200 group-hover:border-blue-300 group-hover:shadow-xl transition-all duration-300 mobile-card">
                  <h3 className="text-2xl lg:text-3xl font-bold text-accent mb-4">Backend Processes Data</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Our Express.js backend aggregates sprint metrics, calculates workload distribution, and prepares data for AI analysis.
                  </p>
                  <div className="mt-6 flex items-center justify-center">
                    <div className="flex space-x-1">
                      <div className="w-3 h-8 bg-blue-500 rounded animate-pulse"></div>
                      <div className="w-3 h-6 bg-blue-400 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-3 h-10 bg-blue-600 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-3 h-4 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.3s'}}></div>
                      <div className="w-3 h-7 bg-blue-500 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 - Highlighted */}
              <div className="group text-center lg:transform lg:scale-105">
                <div className="relative mb-8">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-3xl flex items-center justify-center text-2xl lg:text-3xl font-bold mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    3
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur-xl"></div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl border-2 border-green-300 group-hover:border-green-400 group-hover:shadow-xl transition-all duration-300 mobile-card">
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-4">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI MAGIC
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-accent mb-4">AI Predicts Success</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Machine learning model analyzes patterns and returns success probability (0-100%) before you commit to the sprint.
                  </p>
                  <div className="mt-6 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">84%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative py-24 bg-gradient-to-b from-secondary to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-accent mb-4">Beautiful, Intuitive Dashboard</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Track everything that matters in one clean interface</p>
          </div>

          {/* Mock Dashboard */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-w-5xl mx-auto">
            {/* Dashboard Header */}
            <div className="bg-accent text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Sprint Dashboard</h3>
                <p className="text-gray-300 text-sm">Real-time insights at a glance</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live</span>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Stat Card 1 */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-200">
                  <div className="text-sm text-gray-600 mb-2">Active Sprint</div>
                  <div className="text-3xl font-bold text-accent mb-1">Sprint 3</div>
                  <div className="text-sm text-green-600 font-semibold">On Track</div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-200">
                  <div className="text-sm text-gray-600 mb-2">Tasks Completed</div>
                  <div className="text-3xl font-bold text-accent mb-1">12 / 18</div>
                  <div className="text-sm text-blue-600 font-semibold">67% Complete</div>
                </div>

                {/* Stat Card 3 - AI Prediction */}
                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border-2 border-green-400 relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">AI</div>
                  <div className="text-sm text-gray-600 mb-2">Success Probability</div>
                  <div className="text-4xl font-bold text-green-600 mb-1">84%</div>
                  <div className="text-sm text-gray-600 font-semibold">High Confidence</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">Sprint Progress</span>
                  <span className="text-sm text-gray-600">7 days remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full" style={{width: '67%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Technology Section */}
      <section id="ai-powered" className="relative py-24 bg-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-indigo-600 rounded-full text-sm font-bold mb-6">REAL AI TECHNOLOGY</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Built with Real AI — Not Just Rules</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Unlike simple rule-based systems, ProdFlow AI uses genuine machine learning to predict sprint outcomes.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Logistic Regression Model</h3>
                    <p className="text-gray-300">Trained on sprint patterns to classify success probability with high accuracy.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Data-Driven Predictions</h3>
                    <p className="text-gray-300">Analyzes team capacity, workload distribution, and sprint duration for accurate forecasts.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Future-Ready Architecture</h3>
                    <p className="text-gray-300">Microservices design allows easy upgrades to advanced models like Random Forest or Neural Networks.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-sm text-gray-400 mb-4 font-mono">AI Model Architecture</div>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="text-sm text-gray-400 mb-2">Input Features</div>
                    <div className="text-white font-mono text-sm">
                      • Total Tasks<br />
                      • Sprint Duration<br />
                      • Team Size<br />
                      • Estimated Effort
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div className="bg-indigo-600 p-4 rounded-lg">
                    <div className="text-sm text-indigo-200 mb-2">ML Processing</div>
                    <div className="text-white font-semibold">Logistic Regression + StandardScaler</div>
                  </div>
                  <div className="flex justify-center">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div className="bg-green-600 p-4 rounded-lg">
                    <div className="text-sm text-green-200 mb-2">Output</div>
                    <div className="text-white font-bold text-2xl">Success Probability: 0-100%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 bg-gradient-to-b from-white to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-accent mb-6 leading-tight">
            Make Better Sprint Decisions — Starting Today
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join teams using AI-powered planning to deliver projects on time, every time.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center bg-accent text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-gray-800 transition-all hover:shadow-2xl hover:-translate-y-1"
          >
            Start Planning Now
            <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-sm text-gray-500 mt-6">No credit card required • Free forever • Setup in 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-2xl font-bold mb-2">ProdFlow <span className="text-indigo-400">AI</span></div>
              <p className="text-gray-400 text-sm">AI-Driven Product & Sprint Planning</p>
            </div>
            <div className="flex space-x-8 text-sm">
              <Link to="/register" className="text-gray-400 hover:text-white transition-colors">Get Started</Link>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#ai-powered" className="text-gray-400 hover:text-white transition-colors">Technology</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 ProdFlow AI. Built with React, Express.js, and Machine Learning.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
