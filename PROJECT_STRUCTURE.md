# ProdFlow AI - Project Structure

## 📁 Project Organization

```
ProdFlow AI/
├── 📁 ai-service/          # AI/ML Service (Python FastAPI)
│   ├── 📄 main.py          # FastAPI server with ML predictions
│   ├── 📄 requirements.txt # Python dependencies
│   └── 📄 .env.example     # Environment configuration template
│
├── 📁 backend/             # Backend API (Node.js Express)
│   ├── 📁 config/          # Database and app configuration
│   ├── 📁 controllers/     # API route handlers
│   ├── 📁 middleware/      # Authentication, validation, error handling
│   ├── 📁 models/          # MongoDB/Mongoose data models
│   ├── 📁 routes/          # API route definitions
│   ├── 📄 server.js        # Express server entry point
│   └── 📄 .env.example     # Environment configuration template
│
├── 📁 frontend/            # Frontend App (React + Vite)
│   ├── 📁 public/          # Static assets
│   ├── 📁 src/             # React source code
│   │   ├── 📁 api/         # API client configuration
│   │   ├── 📁 components/  # Reusable React components
│   │   ├── 📁 context/     # React context providers
│   │   ├── 📁 pages/       # Page components
│   │   └── 📁 utils/       # Utility functions
│   ├── 📄 index.html       # HTML template
│   ├── 📄 vite.config.js   # Vite build configuration
│   └── 📄 .env.example     # Environment configuration template
│
├── 📁 deployment/          # Deployment configurations
│   └── 📁 nginx/           # Nginx reverse proxy config
│
├── 📁 scripts/             # Development and setup scripts
│   ├── 📄 install-all.bat  # Install all dependencies
│   ├── 📄 start-all.bat    # Start all services locally
│   └── 📄 mongo-init.js    # MongoDB initialization script
│
├── 📄 README.md            # Main project documentation
├── 📄 .env.example         # Root environment template
└── 📄 .gitignore           # Git ignore rules
```

## 🚀 Quick Start

### Development Setup
```bash
# 1. Install all dependencies
./scripts/install-all.bat

# 2. Configure environment variables
# Copy .env.example files and update with your values

# 3. Start all services
./scripts/start-all.bat
```

### Production Deployment
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **AI Service**: Deployed on Render
- **Database**: MongoDB Atlas

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Routing**: React Router
- **API Client**: Axios with interceptors

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **Validation**: Express-validator
- **Security**: Helmet, CORS, rate limiting

### AI Service (Python + FastAPI)
- **Framework**: FastAPI
- **ML Library**: Scikit-learn
- **Model**: Logistic Regression for sprint success prediction
- **Features**: Team size, task count, duration, effort estimation

## 🔧 Key Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Product Manager, Team Lead, Developer)
- Secure session management

### Sprint Planning
- Product and feature management
- Sprint creation with team capacity planning
- Task assignment and tracking
- AI-powered success probability prediction

### Real-time Monitoring
- System health checks
- Network quality monitoring
- CORS diagnostics
- Performance metrics

## 📦 Dependencies

### Backend
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- helmet: Security middleware
- cors: Cross-origin resource sharing
- express-validator: Input validation

### Frontend
- react: UI library
- react-router-dom: Client-side routing
- axios: HTTP client
- tailwindcss: Utility-first CSS

### AI Service
- fastapi: Modern Python web framework
- scikit-learn: Machine learning library
- pandas: Data manipulation
- numpy: Numerical computing

## 🌐 Deployment URLs

- **Production Frontend**: https://prodflowaii.vercel.app
- **Production Backend**: https://prodflow-6rmm.onrender.com
- **Production AI Service**: https://prodflow-2w53.onrender.com

## 📝 Environment Configuration

Each service has its own `.env.example` file with required environment variables. Copy these files to `.env` and update with your specific values.

## 🔒 Security Features

- CORS protection with dynamic origin validation
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers
- Secure password hashing

## 🧪 Testing & Diagnostics

- Built-in system status monitoring
- Network quality testing
- CORS configuration validation
- API health checks
- Performance monitoring