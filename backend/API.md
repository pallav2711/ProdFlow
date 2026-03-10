# ProdFlow AI - API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Product Manager" // or "Team Lead" or "Developer"
}

Response: 201 Created
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Product Manager"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "user": { ... }
}
```

## Products

### Create Product (Product Manager only)
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "E-Commerce Platform",
  "vision": "Build the best online shopping experience",
  "description": "Optional description"
}

Response: 201 Created
{
  "success": true,
  "product": { ... }
}
```

### Get All Products
```http
GET /products
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "count": 5,
  "products": [ ... ]
}
```

### Get Single Product
```http
GET /products/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "product": { ... }
}
```

### Add Feature to Product (Product Manager only)
```http
POST /products/:id/features
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "User Authentication",
  "description": "Implement login and registration",
  "priority": "High", // High, Medium, or Low
  "businessValue": 9, // 1-10
  "estimatedEffort": 40 // hours
}

Response: 201 Created
{
  "success": true,
  "feature": { ... }
}
```

### Get Features for Product
```http
GET /products/:id/features
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "count": 10,
  "features": [ ... ]
}
```

## Sprints

### Create Sprint (Team Lead only)
```http
POST /sprints
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sprint 1",
  "product": "product_id",
  "duration": 14, // days
  "startDate": "2024-01-01",
  "endDate": "2024-01-14",
  "teamSize": 5,
  "features": ["feature_id_1", "feature_id_2"]
}

Response: 201 Created
{
  "success": true,
  "sprint": {
    ...
    "aiPrediction": {
      "successProbability": 74.5,
      "predictedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get All Sprints
```http
GET /sprints
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "count": 3,
  "sprints": [ ... ]
}
```

### Get Single Sprint
```http
GET /sprints/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "sprint": { ... },
  "tasks": [ ... ]
}
```

### Add Task to Sprint (Team Lead only)
```http
POST /sprints/:id/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "feature": "feature_id",
  "title": "Implement login form",
  "description": "Create React component for login",
  "assignedTo": "user_id",
  "estimatedHours": 8
}

Response: 201 Created
{
  "success": true,
  "task": { ... }
}
```

### Update Task Status
```http
PUT /sprints/tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Progress" // To Do, In Progress, or Done
}

Response: 200 OK
{
  "success": true,
  "task": { ... }
}
```

## Error Responses

All endpoints may return error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error
