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
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-24 lg:pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orb 1 */}
          <div className="absolute top-10 sm:top-20 -left-10 sm:-left-20 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          {/* Gradient Orb 2 */}
          <div className="absolute top-20 sm:top-40 -right-10 sm:-right-20 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          {/* Gradient Orb 3 */}
          <div className="absolute -bottom-10 sm:-bottom-20 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className={`relative z-10 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Trust Badge */}
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full mb-6 sm:mb-8 shadow-sm mt-8 sm:mt-14">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-xs sm:text-sm text-gray-700 font-medium">Built for agile teams & academic excellence</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-responsive-5xl font-bold text-accent mb-4 sm:mb-6 tracking-tight leading-tight px-2">
            Smarter Planning.<br />
            Stronger Sprints.<br />
            <span className="text-indigo-600">Better Delivery.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-responsive-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            AI-powered sprint planning that predicts success before you commit. Make data-driven decisions, not guesses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
            <Link 
              to="/register" 
              className="group bg-accent text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-800 transition-all hover:shadow-2xl hover:-translate-y-1 inline-flex items-center justify-center touch-target"
            >
              Start Planning Free
              <svg className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              to="/login" 
              className="bg-white text-accent px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold border-2 border-gray-200 hover:border-accent transition-all hover:shadow-lg inline-flex items-center justify-center touch-target"
            >
              View Demo
            </Link>
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
      <section id="features" className="relative py-16 sm:py-20 lg:py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-responsive-4xl font-bold text-accent mb-4">Everything you need to plan smarter</h2>
            <p className="text-responsive-xl text-gray-600 max-w-2xl mx-auto px-4">From product vision to sprint execution, powered by real AI predictions</p>
          </div>

          <div className="grid grid-responsive-1 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 mobile-card">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-accent mb-3">Product Vision & Backlog</h3>
              <p className="text-gray-600 mb-4 leading-relaxed mobile-text">
                Define clear product vision, create prioritized features with business value scoring, and maintain a healthy backlog.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">→ Strategic planning made simple</div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 mobile-card">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-accent mb-3">Sprint Planning & Capacity</h3>
              <p className="text-gray-600 mb-4 leading-relaxed mobile-text">
                Create sprints with team capacity in mind, assign features intelligently, and track progress with visual timelines.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">→ Never overcommit again</div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ring-2 ring-indigo-600 mobile-card">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full mb-4">AI POWERED</div>
              <h3 className="text-xl sm:text-2xl font-bold text-accent mb-3">AI Sprint Success Prediction</h3>
              <p className="text-gray-600 mb-4 leading-relaxed mobile-text">
                Get real-time success probability before committing. ML model analyzes team capacity, workload, and historical patterns.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">→ Data-driven confidence</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-responsive-4xl font-bold text-accent mb-4">How ProdFlow AI Works</h2>
            <p className="text-responsive-xl text-gray-600 max-w-2xl mx-auto px-4">Three simple steps to smarter sprint planning</p>
          </div>

          <div className="grid grid-responsive-1 gap-6 sm:gap-8 relative">
            {/* Connecting lines - hidden on mobile */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 -translate-y-1/2 z-0"></div>

            {/* Step 1 */}
            <div className="relative bg-white p-6 sm:p-8 rounded-2xl border-2 border-gray-200 z-10 mobile-card">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mx-auto shadow-lg">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-accent mb-3 text-center">Plan Product & Sprints</h3>
              <p className="text-gray-600 text-center leading-relaxed mobile-text">
                Define your product vision, create features with priorities, and set up sprint parameters with team capacity.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-6 sm:p-8 rounded-2xl border-2 border-gray-200 z-10 mobile-card">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mx-auto shadow-lg">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-accent mb-3 text-center">Backend Processes Data</h3>
              <p className="text-gray-600 text-center leading-relaxed mobile-text">
                Our Express.js backend aggregates sprint metrics, calculates workload distribution, and prepares data for AI analysis.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-6 sm:p-8 rounded-2xl border-2 border-indigo-600 z-10 mobile-card">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mx-auto shadow-lg">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-accent mb-3 text-center">AI Predicts Success</h3>
              <p className="text-gray-600 text-center leading-relaxed mobile-text">
                Machine learning model analyzes patterns and returns success probability (0-100%) before you commit to the sprint.
              </p>
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
