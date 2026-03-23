# 🏗️ ProdFlow AI - Architecture Overview

## System Architecture

ProdFlow AI is a three-tier SaaS application for sprint planning with AI predictions.

### Services
1. **Frontend** (React 18 + Vite) - User interface
2. **Backend** (Node.js + Express) - API & business logic  
3. **AI Service** (Python + FastAPI) - Sprint predictions
4. **Database** (MongoDB) - Data persistence

## Technology Stack

### Frontend
- React 18 with Hooks & Context API
- Vite for fast builds
- Tailwind CSS for styling
- Axios for API communication
- React Router for navigation

### Backend
- Node.js with Express framework
- MongoDB with Mongoose ODM
- JWT authentication
- bcryptjs password hashing
- Role-based access control

### AI Service
- Python FastAPI framework
- Heuristic analysis for predictions
- 85% accuracy baseline
- Caching for performance

## Data Model

### Core Entities
- **User**: Authentication & roles
- **Product**: Project containers
- **Feature**: Product requirements
- **Sprint**: Time-boxed iterations
- **Task**: Individual work items
- **ProjectMember**: Team membership

### Relationships
```
User (1) → (many) Product
Product (1) → (many) Feature
Product (1) → (many) Sprint
Sprint (1) → (many) Task
Feature (1) → (many) Task
```

## Critical Workflows

### 1. Authentication
```
Register → Login → Token Refresh → Logout
```

### 2. Sprint Planning
```
Create Product → Add Features → Create Sprint → AI Prediction → Assign Tasks
```

### 3. Task Execution
```
To Do → In Progress → Pending Review → Completed
```

## Role-Based Access

| Role | Permissions |
|------|-------------|
| Product Manager | Create products, manage features, invite team |
| Team Lead | Create sprints, assign tasks, approve tasks |
| Developer | View tasks, update status, submit for review |

## Performance Optimizations

- Database connection pooling
- Gzip compression
- Code splitting & lazy loading
- JWT token auto-refresh
- AI prediction caching

## Security Features

- JWT with separate access/refresh tokens
- bcryptjs password hashing
- Role-based middleware
- Input validation
- CORS configuration
- Rate limiting

## Deployment

- **Frontend**: Vercel
- **Backend**: Render
- **AI Service**: Render
- **Database**: MongoDB Atlas

For detailed architecture analysis, see the original ARCHITECTURE_SUMMARY.md and CODEBASE_ARCHITECTURE_ANALYSIS.md files.