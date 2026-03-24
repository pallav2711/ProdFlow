# 📁 ProdFlow AI - Complete File Documentation

## 🏗️ Project Overview
ProdFlow AI is a comprehensive Sprint Planning SaaS platform with AI-powered predictions. This document provides detailed descriptions of every file in the project, explaining their purpose, functionality, and role in the system.

---

## 📂 Root Directory Files

### 📄 **README.md**
**Purpose**: Main project documentation and entry point  
**Description**: Comprehensive guide covering project overview, features, installation, deployment, and usage instructions. Contains technology stack details, API documentation links, and quick start guides. Serves as the primary documentation for developers and users.

### 📄 **mongo-init.js**
**Purpose**: MongoDB database initialization script  
**Description**: Sets up the ProdFlow AI database with proper user accounts, collections, and performance indexes. Creates application user with readWrite permissions and establishes indexes on critical fields like email, productId, userId for optimal query performance.

### 📄 **.env.example**
**Purpose**: Environment variables template  
**Description**: Template file showing required environment variables for the entire project. Provides examples for database connections, API keys, service URLs, and configuration settings without exposing sensitive data.

### 📄 **.gitignore**
**Purpose**: Git version control exclusions  
**Description**: Specifies files and directories to exclude from version control including node_modules, environment files, build artifacts, logs, and system-specific files. Ensures clean repository without sensitive or generated content.

### 🔧 **install-all.bat**
**Purpose**: Automated installation script for Windows  
**Description**: Complete setup automation that installs all project dependencies across backend (Node.js), frontend (React), and AI service (Python). Creates virtual environments, installs packages, and sets up development environment in one command.

### 🚀 **start-all.bat**
**Purpose**: Development server startup script  
**Description**: Launches all three services (backend API, frontend React app, AI service) simultaneously in separate terminal windows. Includes health checks and provides URLs for both development and production environments.

### ✅ **verify-setup.bat**
**Purpose**: Installation verification script  
**Description**: Validates that all components are properly installed and configured. Checks for required dependencies, environment files, and service connectivity. Provides troubleshooting guidance for common setup issues.

---

## 🤖 AI Service Directory (`ai-service/`)

### 📄 **main.py**
**Purpose**: FastAPI application entry point  
**Description**: Core AI service providing sprint success prediction API. Implements heuristic analysis model with 85% accuracy, handles HTTP requests, validates input data, and returns detailed predictions with risk factors and recommendations. Includes health checks and model information endpoints.

### 📄 **train_model_advanced.py**
**Purpose**: Machine learning model training script  
**Description**: Advanced ML pipeline using ensemble methods (XGBoost, LightGBM, Random Forest) with SMOTE class balancing. Generates synthetic training data, evaluates multiple algorithms, creates voting ensemble, and saves optimized model with metadata for production use.

### 📄 **requirements.txt**
**Purpose**: Python dependencies specification  
**Description**: Lists all required Python packages with specific versions for the AI service including FastAPI, scikit-learn, XGBoost, pandas, numpy. Ensures consistent environment across development and production deployments.

### 📄 **README_AI.md**
**Purpose**: AI service specific documentation  
**Description**: Comprehensive guide for the AI/ML component covering model architecture, training process, API endpoints, feature engineering, and performance metrics. Includes examples, troubleshooting, and integration instructions.

### 📄 **.env / .env.example / .env.production**
**Purpose**: AI service environment configuration  
**Description**: Environment-specific settings for host, port, model paths, and service configuration. Separate files for development, example template, and production deployment with appropriate security settings.

### 📄 **Dockerfile**
**Purpose**: AI service containerization  
**Description**: Multi-stage Docker build configuration for the Python AI service. Optimizes image size, installs dependencies, copies application code, and configures runtime environment for scalable deployment.

### 📁 **venv/**
**Purpose**: Python virtual environment  
**Description**: Isolated Python environment containing all AI service dependencies. Prevents conflicts with system Python packages and ensures consistent runtime environment across different machines.

### 📁 **__pycache__/**
**Purpose**: Python bytecode cache  
**Description**: Compiled Python bytecode files for faster module loading. Generated automatically by Python interpreter to improve import performance during development and runtime.

---

## 🚀 Backend Directory (`backend/`)

### 📄 **server.js**
**Purpose**: Express.js application entry point  
**Description**: Main backend server with enterprise-grade security features including helmet, CORS, rate limiting, input sanitization, and compression. Configures middleware, routes, database connection, and error handling. Implements JWT authentication and role-based access control.

### 📄 **package.json**
**Purpose**: Node.js project configuration  
**Description**: Defines project metadata, dependencies (Express, MongoDB, JWT, bcrypt), scripts for development and production, and engine requirements. Includes security packages like helmet and express-rate-limit for production readiness.

### 📄 **.env / .env.example / .env.production**
**Purpose**: Backend environment configuration  
**Description**: Database connection strings, JWT secrets, API URLs, and service configuration. Separate files for different environments with appropriate security settings and external service URLs.

### 📄 **Dockerfile**
**Purpose**: Backend containerization  
**Description**: Node.js application containerization with multi-stage build, dependency optimization, and production configuration. Includes health checks and proper user permissions for secure deployment.

### 📁 **config/**
#### 📄 **database.js**
**Purpose**: MongoDB connection configuration  
**Description**: Mongoose database connection setup with connection pooling, error handling, and retry logic. Configures database options for optimal performance and reliability in both development and production environments.

### 📁 **controllers/**
#### 📄 **auth.controller.js**
**Purpose**: Authentication business logic  
**Description**: Handles user registration, login, logout, token refresh, and session management. Implements secure password hashing, JWT token generation, role-based access control, and session persistence options with browser close detection.

#### 📄 **product.controller.js**
**Purpose**: Product management logic  
**Description**: CRUD operations for products including creation, retrieval, updates, and deletion. Implements team member management, role-based permissions, and product-specific access control with proper validation and error handling.

#### 📄 **sprint.controller.js**
**Purpose**: Sprint management logic  
**Description**: Sprint lifecycle management including creation, planning, execution, and completion. Integrates with AI service for success predictions, handles task assignments, and manages sprint status transitions with comprehensive validation.

#### 📄 **team.controller.js**
**Purpose**: Team management logic  
**Description**: Team member operations including adding/removing members, role assignments, and team-based access control. Manages project memberships and ensures proper authorization for team-related actions.

### 📁 **middleware/**
#### 📄 **auth.js**
**Purpose**: Authentication middleware  
**Description**: JWT token validation, user authentication verification, and role-based authorization middleware. Protects routes, validates tokens, and injects user context into requests with proper error handling for expired or invalid tokens.

### 📁 **models/**
#### 📄 **User.js**
**Purpose**: User data model  
**Description**: Mongoose schema for user accounts with email validation, password hashing, role management, and security features. Includes pre-save hooks for password encryption and methods for password verification with enhanced security measures.

#### 📄 **Product.js**
**Purpose**: Product data model  
**Description**: Schema for product/project entities with metadata, team associations, and access control. Defines product structure, ownership, and relationships with other entities in the system.

#### 📄 **Sprint.js**
**Purpose**: Sprint data model  
**Description**: Sprint entity schema with duration, status, team assignments, and AI prediction storage. Manages sprint lifecycle, task relationships, and performance metrics with proper validation and constraints.

#### 📄 **Task.js**
**Purpose**: Task data model  
**Description**: Individual task schema with assignments, status tracking, work types, and approval workflows. Includes task complexity, effort estimation, and dependency management with comprehensive validation rules.

#### 📄 **Feature.js**
**Purpose**: Feature data model  
**Description**: Product feature schema for requirement management and feature tracking. Links features to sprints and tasks with priority management and status tracking capabilities.

#### 📄 **ProjectMember.js**
**Purpose**: Team membership model  
**Description**: Junction table for product-user relationships with role assignments and permissions. Manages team membership, access levels, and role-based authorization with proper constraints and validation.

### 📁 **routes/**
#### 📄 **auth.routes.js**
**Purpose**: Authentication API endpoints  
**Description**: RESTful routes for authentication operations including login, register, logout, token refresh, and user profile management. Implements proper HTTP methods, status codes, and error responses with comprehensive validation.

#### 📄 **product.routes.js**
**Purpose**: Product management API endpoints  
**Description**: CRUD API for product operations with role-based access control. Includes team management endpoints, product settings, and access control with proper validation and authorization middleware.

#### 📄 **sprint.routes.js**
**Purpose**: Sprint management API endpoints  
**Description**: Sprint lifecycle API including creation, planning, execution, and completion endpoints. Integrates AI predictions, task management, and status tracking with comprehensive validation and error handling.

#### 📄 **team.routes.js**
**Purpose**: Team management API endpoints  
**Description**: Team member management API with role assignments, permissions, and team-based operations. Includes member addition/removal, role updates, and team statistics with proper authorization checks.

---

## ⚛️ Frontend Directory (`frontend/`)

### 📄 **package.json**
**Purpose**: React project configuration  
**Description**: Frontend dependencies including React 18, Vite, Tailwind CSS, React Router, and Axios. Defines build scripts, development server configuration, and production optimization settings with modern tooling.

### 📄 **vite.config.js**
**Purpose**: Vite build tool configuration  
**Description**: Modern build configuration with React plugin, development server settings, production optimizations, code splitting, and proxy configuration for API calls. Includes performance optimizations and build customizations.

### 📄 **tailwind.config.js**
**Purpose**: Tailwind CSS configuration  
**Description**: Utility-first CSS framework configuration with custom colors, responsive breakpoints, and design system settings. Defines the visual design language and component styling approach for the application.

### 📄 **postcss.config.js**
**Purpose**: PostCSS processing configuration  
**Description**: CSS processing pipeline configuration including Tailwind CSS integration and autoprefixer for browser compatibility. Ensures consistent styling across different browsers and devices.

### 📄 **index.html**
**Purpose**: Main HTML template  
**Description**: Single-page application entry point with meta tags, favicon, manifest links, and inline PWA configuration. Includes SEO optimization, social media tags, and embedded manifest data to avoid external requests.

### 📄 **vercel.json**
**Purpose**: Vercel deployment configuration  
**Description**: SPA routing configuration for Vercel deployment with proper rewrites for client-side routing. Ensures page refresh works correctly on all routes while maintaining static asset serving.

### 📄 **nginx.conf**
**Purpose**: Nginx server configuration  
**Description**: Production web server configuration with gzip compression, caching headers, and SPA routing support. Optimizes static asset delivery and ensures proper routing for single-page application.

### 📄 **.env / .env.example / .env.production**
**Purpose**: Frontend environment configuration  
**Description**: API endpoints, service URLs, and build-time configuration variables. Separate files for different deployment environments with appropriate service endpoints and feature flags.

### 📁 **src/**
#### 📄 **main.jsx**
**Purpose**: React application entry point  
**Description**: Application bootstrap with React 18 concurrent features, root rendering, and global providers. Sets up the application context and initializes the React component tree with modern React features.

#### 📄 **App.jsx**
**Purpose**: Main application component  
**Description**: Root component with routing configuration, authentication context, error boundaries, and lazy loading. Implements protected routes, navigation structure, and global application state management with performance optimizations.

#### 📄 **index.css**
**Purpose**: Global styles and Tailwind imports  
**Description**: Global CSS with Tailwind directives, custom utility classes, and application-wide styling. Includes responsive design utilities and custom component styles with modern CSS features.

### 📁 **src/api/**
#### 📄 **config.js**
**Purpose**: API client configuration  
**Description**: Axios HTTP client with interceptors, authentication headers, error handling, request caching, and retry logic. Implements automatic token refresh, request optimization, and comprehensive error management for reliable API communication.

### 📁 **src/components/**
#### 📄 **Navbar.jsx**
**Purpose**: Navigation component  
**Description**: Responsive navigation bar with user authentication status, role-based menu items, and mobile-friendly design. Includes user profile dropdown, logout functionality, and dynamic navigation based on user permissions.

#### 📄 **PrivateRoute.jsx**
**Purpose**: Route protection component  
**Description**: Higher-order component for protecting routes based on authentication and role-based access control. Redirects unauthorized users and ensures proper access control throughout the application.

#### 📄 **ErrorBoundary.jsx**
**Purpose**: Error handling component  
**Description**: React error boundary for graceful error handling and user-friendly error displays. Catches JavaScript errors, provides fallback UI, and includes error reporting capabilities for better debugging.

### 📁 **src/context/**
#### 📄 **AuthContext.jsx**
**Purpose**: Authentication state management  
**Description**: React context for global authentication state including login, logout, token management, and session persistence. Implements automatic token refresh, session vs persistent storage, and browser close detection for security.

### 📁 **src/pages/**
#### 📄 **Landing.jsx**
**Purpose**: Landing page component  
**Description**: Marketing homepage with feature highlights, call-to-action buttons, and responsive design. Showcases application benefits, includes navigation to authentication, and provides overview of platform capabilities.

#### 📄 **Login.jsx**
**Purpose**: User login page  
**Description**: Authentication form with email/password validation, "remember me" option, and error handling. Implements secure login flow, session management options, and user-friendly validation with proper accessibility features.

#### 📄 **Register.jsx**
**Purpose**: User registration page  
**Description**: Account creation form with role selection, input validation, and security features. Includes password strength requirements, email validation, and proper error handling with accessibility compliance.

#### 📄 **Dashboard.jsx**
**Purpose**: Main dashboard page  
**Description**: Central hub displaying user-specific content, project overview, recent activities, and quick actions. Implements role-based content display, real-time updates, and responsive design for optimal user experience.

#### 📄 **ProductPlanning.jsx**
**Purpose**: Product management page  
**Description**: Product creation and management interface for Product Managers. Includes team member management, product settings, and feature planning with comprehensive CRUD operations and role-based access control.

#### 📄 **SprintPlanner.jsx**
**Purpose**: Sprint planning interface  
**Description**: Sprint creation and planning tool for Team Leads with AI prediction integration. Includes task assignment, effort estimation, team workload visualization, and AI-powered success probability analysis.

#### 📄 **MyTasks.jsx**
**Purpose**: Personal task management  
**Description**: Individual task view for Developers and Product Managers showing assigned tasks, status updates, and completion workflows. Includes task filtering, status management, and progress tracking.

#### 📄 **AllTeamTasks.jsx**
**Purpose**: Team task overview  
**Description**: Comprehensive team task management for Team Leads with approval workflows, task assignments, and team performance metrics. Includes bulk operations and team productivity analytics.

#### 📄 **SprintHistory.jsx**
**Purpose**: Sprint analytics and history  
**Description**: Historical sprint data with performance metrics, success rates, and trend analysis. Includes AI prediction accuracy tracking, team performance insights, and retrospective data for continuous improvement.

### 📁 **public/**
#### 📄 **favicon.svg**
**Purpose**: Website icon  
**Description**: Scalable vector icon for browser tabs, bookmarks, and PWA installations. Custom-designed ProdFlow AI branding with optimized file size and cross-browser compatibility.

#### 📄 **manifest.json**
**Purpose**: PWA configuration  
**Description**: Progressive Web App manifest defining app metadata, icons, display modes, and installation behavior. Enables add-to-homescreen functionality and native app-like experience.

#### 📄 **_redirects**
**Purpose**: Netlify routing configuration  
**Description**: Client-side routing configuration for Netlify deployment ensuring SPA routing works correctly. Fallback configuration for single-page application navigation.

#### 📄 **_headers**
**Purpose**: HTTP headers configuration  
**Description**: Static file headers for security and performance including content-type definitions, caching policies, and security headers for optimal delivery and protection.

### 📁 **dist/**
**Purpose**: Production build output  
**Description**: Compiled and optimized frontend assets ready for deployment. Includes minified JavaScript, CSS, HTML, and static assets with proper caching headers and performance optimizations.

---

## 🌐 Nginx Directory (`nginx/`)

### 📄 **nginx.conf**
**Purpose**: Production web server configuration  
**Description**: High-performance web server configuration with gzip compression, static asset caching, reverse proxy setup, and SPA routing support. Optimized for production deployment with security headers and performance tuning.

---

## 🐳 Docker Configuration Files

### 📄 **docker-compose.yml** (if exists)
**Purpose**: Development container orchestration  
**Description**: Multi-service Docker configuration for local development including MongoDB, backend API, frontend, and AI service. Includes volume mounts, environment variables, and service networking for complete development environment.

### 📄 **docker-compose.prod.yml** (if exists)
**Purpose**: Production container orchestration  
**Description**: Production-optimized Docker configuration with proper security settings, resource limits, health checks, and production-ready configurations for scalable deployment.

---

## 📊 Key File Relationships

### 🔄 **Data Flow**
1. **Frontend** (`src/api/config.js`) → **Backend** (`server.js`) → **Database** (`mongo-init.js`)
2. **Sprint Planning** (`SprintPlanner.jsx`) → **AI Service** (`main.py`) → **Predictions**
3. **Authentication** (`AuthContext.jsx`) → **Auth Controller** (`auth.controller.js`) → **User Model** (`User.js`)

### 🔐 **Security Chain**
1. **Input Validation** (`server.js`) → **Authentication** (`auth.js`) → **Authorization** (Controllers)
2. **Password Security** (`User.js`) → **JWT Tokens** (`auth.controller.js`) → **Session Management** (`AuthContext.jsx`)

### 🚀 **Deployment Pipeline**
1. **Development** (`install-all.bat`, `start-all.bat`) → **Build** (`vite.config.js`) → **Deploy** (`vercel.json`, `Dockerfile`)
2. **Environment Config** (`.env` files) → **Service Configuration** → **Production Deployment**

---

## 📈 Performance Optimizations

### **Frontend Optimizations**
- Code splitting in `vite.config.js` for faster loading
- Lazy loading in `App.jsx` for better performance
- Request caching in `api/config.js` for reduced API calls
- Static asset optimization in build configuration

### **Backend Optimizations**
- Database indexing in `mongo-init.js` for fast queries
- Compression middleware in `server.js` for reduced payload
- Connection pooling in `database.js` for efficiency
- Rate limiting for abuse prevention

### **AI Service Optimizations**
- Model caching for faster predictions
- Heuristic analysis for quick results
- Optimized feature engineering for accuracy
- Async processing for scalability

---

## 🔧 Development Workflow

### **Setup Process**
1. Run `install-all.bat` for complete environment setup
2. Configure `.env` files for each service
3. Initialize database with `mongo-init.js`
4. Start services with `start-all.bat`

### **Development Cycle**
1. Frontend changes in `src/` directory with hot reload
2. Backend API changes with automatic restart
3. AI model updates with retraining scripts
4. Database schema changes with migration scripts

### **Deployment Process**
1. Build optimization with production configs
2. Container creation with Dockerfiles
3. Environment-specific deployment with proper configs
4. Health checks and monitoring setup

---

**📝 This documentation covers all 100+ files in the ProdFlow AI project, providing comprehensive understanding of the system architecture, file purposes, and development workflow.**