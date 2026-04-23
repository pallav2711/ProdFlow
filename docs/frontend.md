# 🎨 Frontend Documentation

## Overview

The frontend is a modern React application built with Vite, providing a responsive and intuitive user interface for the ProdFlow AI platform.

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API

## Project Structure

```
frontend/src/
├── api/
│   └── config.js           # Axios configuration
├── components/
│   ├── Navbar.jsx          # Navigation bar
│   ├── PrivateRoute.jsx    # Protected route wrapper
│   ├── ErrorBoundary.jsx   # Error handling
│   ├── PageHeader.jsx      # Page title component
│   └── ...
├── context/
│   ├── AuthContext.jsx     # Authentication state
│   ├── DashboardContext.jsx # Dashboard data
│   └── ToastContext.jsx    # Notifications
├── hooks/
│   └── useSmartSprintForm.js # Sprint form logic
├── pages/
│   ├── Landing.jsx         # Landing page
│   ├── Login.jsx           # Login page
│   ├── Register.jsx        # Registration page
│   ├── Dashboard.jsx       # Main dashboard
│   ├── ProductPlanning.jsx # Product management
│   ├── SprintPlanner.jsx   # Sprint creation
│   ├── MyTasks.jsx         # Developer tasks
│   ├── AllTeamTasks.jsx    # Team lead view
│   ├── SprintHistory.jsx   # Sprint history
│   └── ManagerDashboard.jsx # Analytics
├── utils/
│   ├── apiError.js         # Error handling
│   ├── taskHelpers.js      # Task utilities
│   └── formCalculations.js # Form helpers
├── App.jsx                 # Main app component
└── main.jsx                # Entry point
```

## Key Features

### 1. Authentication

**Login Flow**:
```javascript
// AuthContext.jsx
const login = async (email, password, rememberMe) => {
  const response = await api.post('/auth/login', { email, password })
  const { accessToken, user } = response.data.data
  
  // Store token
  if (rememberMe) {
    localStorage.setItem('accessToken', accessToken)
  } else {
    sessionStorage.setItem('accessToken', accessToken)
  }
  
  setUser(user)
}
```

**Protected Routes**:
```javascript
<PrivateRoute roles={['Team Lead']}>
  <SprintPlanner />
</PrivateRoute>
```

### 2. Role-Based UI

Different dashboards for each role:

- **Product Manager**: Analytics, product management, team invitations
- **Team Lead**: Sprint planning, task assignment, team tasks
- **Developer**: My tasks, task status updates

### 3. Sprint Planning with AI

```javascript
// SprintPlanner.jsx
const createSprint = async (sprintData) => {
  const response = await api.post('/sprints', sprintData)
  const { sprint } = response.data
  
  // Display AI prediction
  if (sprint.aiPrediction) {
    showToast(`Success probability: ${sprint.aiPrediction.successProbability}%`)
  }
}
```

### 4. Real-Time Updates

```javascript
// DashboardContext.jsx
const refreshDashboard = async () => {
  const [products, sprints, tasks] = await Promise.all([
    api.get('/products'),
    api.get('/sprints'),
    api.get('/sprints/my-tasks')
  ])
  
  setDashboardData({ products, sprints, tasks })
}
```

## Components

### Navbar Component

```jsx
<Navbar>
  - Logo
  - Navigation Links (role-based)
  - User Menu
  - Logout Button
</Navbar>
```

### PrivateRoute Component

```jsx
<PrivateRoute roles={['Product Manager', 'Team Lead']}>
  <ProtectedPage />
</PrivateRoute>
```

Redirects to login if not authenticated or insufficient permissions.

### ErrorBoundary Component

Catches React errors and displays fallback UI.

## State Management

### AuthContext

Manages authentication state:
- User information
- Login/logout functions
- Token management
- Role-based access

### DashboardContext

Manages dashboard data:
- Products
- Sprints
- Tasks
- Refresh functions

### ToastContext

Manages notifications:
- Success messages
- Error messages
- Info messages

## API Integration

### Axios Configuration

```javascript
// api/config.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true
})

// Request interceptor (add JWT token)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor (handle errors)
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error)
  }
)
```

## Styling

### Tailwind CSS

Utility-first CSS framework for rapid UI development.

**Example**:
```jsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    Sprint Planning
  </h2>
</div>
```

### Responsive Design

Mobile-first approach with breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Performance Optimizations

### Code Splitting

```javascript
// App.jsx
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SprintPlanner = lazy(() => import('./pages/SprintPlanner'))

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/sprint-planner" element={<SprintPlanner />} />
  </Routes>
</Suspense>
```

### Memoization

```javascript
const filteredTasks = useMemo(() => 
  tasks.filter(task => task.status === filterStatus),
  [tasks, filterStatus]
)
```

### Debouncing

```javascript
const debouncedSearch = useMemo(
  () => debounce((value) => setSearchTerm(value), 300),
  []
)
```

## Building for Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

Output: `dist/` directory with optimized static files

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_APP_NAME=ProdFlow AI
VITE_ENABLE_AI_PREDICTIONS=true
```

## Development

### Running Dev Server

```bash
npm run dev
```

Access at: http://localhost:5173

### Linting

```bash
npm run lint
```

---

**Last Updated**: 2026
**Version**: 1.0.0
