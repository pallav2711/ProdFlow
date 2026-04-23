# 🔧 Backend API Documentation

## Overview

The backend is built with Node.js and Express.js, providing a RESTful API for the ProdFlow AI platform.

## Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── auth.controller.js   # Authentication logic
│   ├── product.controller.js
│   ├── sprint.controller.js
│   ├── team.controller.js
│   └── analytics.controller.js
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Global error handling
│   ├── validation.js        # Input validation
│   └── requestContext.js    # Request tracking
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Feature.js
│   ├── Sprint.js
│   ├── Task.js
│   └── ProjectMember.js
├── routes/
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── sprint.routes.js
│   ├── team.routes.js
│   ├── analytics.routes.js
│   └── health.routes.js
├── utils/
│   ├── appError.js          # Custom error class
│   ├── logger.js            # Logging utility
│   ├── pagination.js        # Pagination helper
│   └── aiClient.js          # AI service client
└── server.js                # Application entry point
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "Developer"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Developer"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refreshToken=...
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### Products

#### Create Product
```http
POST /api/products
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Mobile App",
  "vision": "Revolutionary mobile experience",
  "description": "iOS and Android app"
}
```

#### Get All Products
```http
GET /api/products?page=1&limit=20
Authorization: Bearer {accessToken}
```

#### Get Single Product
```http
GET /api/products/:id
Authorization: Bearer {accessToken}
```

#### Add Feature to Product
```http
POST /api/products/:id/features
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "User Authentication",
  "description": "OAuth 2.0 integration",
  "priority": "High",
  "businessValue": 9,
  "estimatedEffort": 40
}
```

### Sprints

#### Create Sprint (with AI Prediction)
```http
POST /api/sprints
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Sprint 1",
  "product": "507f1f77bcf86cd799439011",
  "duration": 14,
  "startDate": "2024-01-01",
  "endDate": "2024-01-14",
  "teamSize": 5,
  "features": ["507f1f77bcf86cd799439012"]
}
```

**Response** (includes AI prediction):
```json
{
  "success": true,
  "sprint": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Sprint 1",
    "aiPrediction": {
      "successProbability": 78.5,
      "predictedAt": "2024-01-01T00:00:00.000Z"
    },
    ...
  }
}
```

#### Get All Sprints
```http
GET /api/sprints?page=1&limit=20
Authorization: Bearer {accessToken}
```

#### Get Sprint Details
```http
GET /api/sprints/:id
Authorization: Bearer {accessToken}
```

#### Add Task to Sprint
```http
POST /api/sprints/:id/tasks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "feature": "507f1f77bcf86cd799439012",
  "title": "Implement login API",
  "description": "Create JWT-based authentication",
  "assignedTo": "507f1f77bcf86cd799439014",
  "workType": "Backend",
  "estimatedHours": 8
}
```

#### Update Task Status
```http
PUT /api/sprints/tasks/:taskId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "In Progress"
}
```

### Tasks

#### Get My Tasks
```http
GET /api/sprints/my-tasks?page=1&limit=20
Authorization: Bearer {accessToken}
```

### Team Management

#### Invite User to Project
```http
POST /api/teams/invite
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "email": "developer@example.com",
  "role": "Developer",
  "specialization": "Backend"
}
```

#### Get My Invitations
```http
GET /api/teams/invitations
Authorization: Bearer {accessToken}
```

#### Accept Invitation
```http
PUT /api/teams/invitations/:id/accept
Authorization: Bearer {accessToken}
```

### Analytics

#### Get Sprint Analytics
```http
GET /api/analytics/sprints?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {accessToken}
```

#### Get Task Analytics
```http
GET /api/analytics/tasks?sprintIds=id1,id2
Authorization: Bearer {accessToken}
```

#### Get Complete Analytics
```http
GET /api/analytics/complete
Authorization: Bearer {accessToken}
```

#### Get Analytics Summary
```http
GET /api/analytics/summary
Authorization: Bearer {accessToken}
```

### Health Check

#### Basic Health Check
```http
GET /api/health
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "message": "ProdFlow AI Backend is running",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "environment": "development",
    "uptime": 3600,
    "version": "1.0.0"
  }
}
```

#### Detailed Status
```http
GET /api/health/status
```

## Database Models

### User Model

```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum['Product Manager', 'Team Lead', 'Developer'],
  refreshToken: String,
  refreshTokenExpiresAt: Date,
  lastLogin: Date,
  createdAt: Date
}
```

### Product Model

```javascript
{
  name: String,
  vision: String,
  description: String,
  createdBy: ObjectId (ref: User),
  isPrivate: Boolean,
  createdAt: Date
}
```

### Sprint Model

```javascript
{
  name: String,
  product: ObjectId (ref: Product),
  duration: Number,
  startDate: Date,
  endDate: Date,
  teamSize: Number,
  features: [ObjectId] (ref: Feature),
  aiPrediction: {
    successProbability: Number,
    predictedAt: Date
  },
  status: Enum['Planning', 'Active', 'Completed'],
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### Task Model

```javascript
{
  sprint: ObjectId (ref: Sprint),
  feature: ObjectId (ref: Feature),
  title: String,
  description: String,
  assignedTo: ObjectId (ref: User),
  workType: Enum['Frontend', 'Backend', 'Database', 'UI/UX Design', 'DevOps', 'Testing', 'Full Stack'],
  estimatedHours: Number,
  status: Enum['To Do', 'In Progress', 'Pending Review', 'Completed', 'Blocked'],
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  reviewNotes: String,
  isVoided: Boolean,
  createdAt: Date
}
```

## Authentication & Authorization

### JWT Token Structure

**Access Token** (15 minutes):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "role": "Developer",
  "iat": 1640000000,
  "exp": 1640000900
}
```

**Refresh Token** (7 days):
- Stored as httpOnly cookie
- Used to obtain new access tokens
- Rotated on each refresh

### Role-Based Access Control

| Endpoint | Product Manager | Team Lead | Developer |
|----------|----------------|-----------|-----------|
| Create Product | ✅ | ❌ | ❌ |
| Create Sprint | ❌ | ✅ | ❌ |
| Add Task | ❌ | ✅ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ (own tasks) |
| Approve Task | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ |

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {},
  "requestId": "abc123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_RESOURCE`: Resource already exists
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Performance Optimizations

### Database Optimizations
- Connection pooling (50 connections)
- Compound indexes on common queries
- Lean queries for read-only operations
- Query projection to fetch only needed fields

### Caching Strategy
- In-memory caching for frequently accessed data
- Cache invalidation on data mutations
- TTL-based cache expiration

### API Optimizations
- Response compression (gzip)
- Pagination for large datasets
- Parallel query execution
- Request timeout limits

## Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **Password Hashing**: Bcrypt with 12 rounds
3. **Rate Limiting**: 500 requests per 15 minutes
4. **Input Validation**: All inputs validated and sanitized
5. **CORS**: Strict origin whitelist
6. **Headers**: Helmet.js security headers
7. **SQL Injection**: Mongoose prevents NoSQL injection
8. **XSS Protection**: Input sanitization

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Database Seeding
```bash
node scripts/seed.js
```

---

**Last Updated**: 2026
**API Version**: 1.0.0
