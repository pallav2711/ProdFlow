# 🚀 ProdFlow AI

**AI-Powered Sprint Planning & Team Performance Analytics Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

> A comprehensive SaaS platform that combines sprint planning, task management, and AI-powered analytics to help development teams optimize their workflow and predict sprint success rates.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

ProdFlow AI is a full-stack application designed to streamline agile development workflows. It provides:

- **Sprint Planning**: Create and manage sprints with AI-powered success predictions
- **Task Management**: Assign, track, and review development tasks
- **Team Analytics**: Real-time insights into developer performance and team productivity
- **AI Predictions**: Machine learning models that predict sprint success probability
- **Role-Based Access**: Separate dashboards for Product Managers, Team Leads, and Developers

---

## ✨ Features

### For Product Managers
- 📊 Create products and define feature backlogs
- 👥 Invite team members and manage project access
- 📈 View comprehensive analytics and performance metrics
- 🎯 Prioritize features based on business value

### For Team Leads
- 🗓️ Plan sprints with AI-powered success predictions
- ✅ Assign tasks to developers
- 👀 Review and approve completed work
- 📉 Monitor team performance and bottlenecks

### For Developers
- 📝 View assigned tasks across all sprints
- ⏱️ Track time and update task status
- 🔄 Submit work for review
- 📊 View personal performance metrics

### AI-Powered Features
- 🤖 Sprint success probability prediction
- 📊 Developer performance clustering
- 🎯 Risk identification and mitigation suggestions
- 📈 Trend analysis and forecasting

---

## 🏗️ Architecture

ProdFlow AI consists of three microservices:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (React + Vite)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
│              (Node.js + Express + MongoDB)                  │
│  • Authentication & Authorization                           │
│  • Sprint & Task Management                                 │
│  • Team & Product Management                                │
│  • Analytics Data Aggregation                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICE                               │
│              (Python + FastAPI + Scikit-learn)              │
│  • Sprint Success Prediction                                │
│  • Developer Performance Analysis                           │
│  • Risk Assessment                                          │
│  • Insights Generation                                      │
└─────────────────────────────────────────────────────────────┘
```

### Service Communication
- **Frontend ↔ Backend**: RESTful API with JWT authentication
- **Backend ↔ AI Service**: HTTP API with API key authentication
- **Data Flow**: Frontend → Backend → AI Service → Backend → Frontend

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

### AI Service
- **Language**: Python 3.9+
- **Framework**: FastAPI
- **ML Libraries**: Scikit-learn, Pandas, NumPy
- **Data Processing**: Pandas, NumPy
- **Caching**: In-memory / Redis

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 16+ and npm ([Download](https://nodejs.org/))
- **Python** 3.9+ and pip ([Download](https://www.python.org/))
- **MongoDB** 5.0+ ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/prodflow-ai.git
cd prodflow-ai

# Install all dependencies
npm run install:all

# Configure environment variables (see Configuration section)
cp .env.example.backend backend/.env
cp .env.example.frontend frontend/.env
cp .env.example.ai ai-service/.env

# Start all services
npm run dev:all
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/prodflow-ai.git
cd prodflow-ai
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Install AI Service Dependencies

```bash
cd ai-service
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

---

## ⚙️ Configuration

### Backend Configuration

1. Copy the example environment file:
```bash
cp .env.example.backend backend/.env
```

2. Edit `backend/.env` and configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/prodflow-ai

# Security (Generate secure secrets!)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your_ai_service_api_key_here

# CORS
FRONTEND_URL=http://localhost:5173
```

**Generate Secure Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Configuration

1. Copy the example environment file:
```bash
cp .env.example.frontend frontend/.env
```

2. Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:8000
```

### AI Service Configuration

1. Copy the example environment file:
```bash
cp .env.example.ai ai-service/.env
```

2. Edit `ai-service/.env`:

```env
BACKEND_API_URL=http://localhost:5000/api
API_KEY=your_ai_service_api_key_here  # Must match backend
```

---

## 🏃 Running the Application

### Development Mode

#### Option 1: Run All Services Together

```bash
# From project root
npm run dev:all
```

#### Option 2: Run Services Individually

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - AI Service:**
```bash
cd ai-service
# Activate venv first
python main.py
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **AI Service**: http://localhost:8000
- **API Health Check**: http://localhost:5000/api/health

### Default Test Accounts

After seeding the database, you can use these accounts:

```
Product Manager:
Email: manager@prodflow.ai
Password: password123

Team Lead:
Email: lead@prodflow.ai
Password: password123

Developer:
Email: dev@prodflow.ai
Password: password123
```

---

## 📁 Project Structure

```
prodflow-ai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── api/             # API client configuration
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Node.js backend API
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   └── server.js            # Entry point
│
├── ai-service/              # Python AI microservice
│   ├── ai_engine/           # ML models and algorithms
│   ├── data_ingestion/      # Data loading and preprocessing
│   ├── insights_generator/  # Insights and recommendations
│   ├── metrics_engine/      # Performance metrics calculation
│   ├── models/              # Data models and schemas
│   └── main.py              # Entry point
│
├── docs/                    # Documentation
│   ├── architecture.md
│   ├── backend.md
│   ├── frontend.md
│   ├── ai-service.md
│   ├── deployment.md
│   └── security.md
│
├── scripts/                 # Utility scripts
│   ├── install-all.bat
│   └── mongo-init.js
│
├── .env.example.backend     # Backend environment template
├── .env.example.frontend    # Frontend environment template
├── .env.example.ai          # AI service environment template
├── .gitignore
├── package.json
└── README.md
```

---

## � API Documentation

### Authentication Endpoints

```
POST   /api/auth/register    # Register new user
POST   /api/auth/login        # Login user
POST   /api/auth/refresh      # Refresh access token
POST   /api/auth/logout       # Logout user
```

### Sprint Management

```
GET    /api/sprints           # Get all sprints
POST   /api/sprints           # Create new sprint (with AI prediction)
GET    /api/sprints/:id       # Get sprint details
PUT    /api/sprints/:id       # Update sprint
DELETE /api/sprints/:id       # Delete sprint
```

### Task Management

```
GET    /api/sprints/my-tasks  # Get tasks assigned to current user
POST   /api/sprints/:id/tasks # Add task to sprint
PUT    /api/sprints/tasks/:id # Update task status
```

### Analytics

```
GET    /api/analytics/sprints # Get sprint analytics data
GET    /api/analytics/tasks   # Get task analytics data
GET    /api/analytics/summary # Get performance summary
```

For complete API documentation, see [docs/backend.md](docs/backend.md).

---

## 🚢 Deployment

### Production Environment Setup

1. **Create production environment files:**

```bash
cp .env.example.backend backend/.env.production
cp .env.example.frontend frontend/.env.production
cp .env.example.ai ai-service/.env.production
```

2. **Configure production values** (use secure secrets!)

3. **Build frontend:**

```bash
cd frontend
npm run build
```

### Deployment Options

#### Option 1: Traditional VPS/Cloud Server

- Deploy backend and AI service on the same server or separate servers
- Use PM2 for process management
- Use Nginx as reverse proxy
- See [docs/deployment.md](docs/deployment.md) for detailed instructions

#### Option 2: Platform-as-a-Service

- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: Heroku, Railway, or AWS Elastic Beanstalk
- **AI Service**: Railway, Render, or AWS Lambda
- **Database**: MongoDB Atlas

#### Option 3: Containerized (Docker)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

See [docs/deployment.md](docs/deployment.md) for comprehensive deployment guides.

---

## 🔒 Security

### Best Practices Implemented

- ✅ JWT-based authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on all endpoints
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (NoSQL)
- ✅ XSS protection
- ✅ Environment variable protection

### Security Checklist

- [ ] Change all default secrets in production
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

See [docs/security.md](docs/security.md) for detailed security guidelines.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- Scikit-learn contributors
- MongoDB team
- All open-source contributors

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/prodflow-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/prodflow-ai/discussions)

---

## 🗺️ Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Advanced AI models (deep learning)
- [ ] Mobile app (React Native)
- [ ] Integration with Jira, GitHub, GitLab
- [ ] Custom reporting and dashboards
- [ ] Multi-language support

---

**Made with ❤️ by the ProdFlow AI Team**
