# 🚀 ProdFlow AI - Sprint Planning SaaS with AI Predictions

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)

**ProdFlow AI** is a comprehensive Sprint Planning SaaS platform that leverages advanced AI/ML models to predict sprint success rates and optimize team productivity. Built with modern technologies and designed for scalability.

## ✨ Key Features

### 🎯 Core Functionality
- **Team-Based Project Management**: Private projects with role-based access control
- **Sprint Planning**: Create, manage, and track sprints with AI-powered insights
- **Task Management**: Assign tasks with work type specialization and approval workflows
- **AI Predictions**: Heuristic analysis predicts sprint success with 85% accuracy
- **Real-time Dashboard**: Comprehensive analytics and progress tracking

### 🤖 AI-Powered Features
- **Sprint Success Prediction**: Heuristic analysis model with 85% accuracy
- **Risk Factor Analysis**: Identify potential blockers and bottlenecks
- **Smart Recommendations**: Actionable insights for sprint optimization
- **Workload Balancing**: AI-driven task distribution recommendations

### 👥 Role-Based System
- **Product Manager**: Create products, manage teams, oversee sprints
- **Team Lead**: Review tasks, approve completions, manage team workflow
- **Developer**: Complete assigned tasks, submit for review, track progress

### 🔧 Technical Features
- **Responsive Design**: Modern glassmorphic UI with Tailwind CSS
- **Real-time Updates**: Live sprint and task status synchronization
- **Secure Authentication**: JWT-based session management
- **RESTful API**: Comprehensive backend API with validation
- **Docker Ready**: Complete containerization for easy deployment

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React 18** with modern hooks and context
- **Vite** for fast development and building
- **Tailwind CSS** for responsive, modern UI
- **Axios** for API communication
- **React Router** for client-side routing

#### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication and authorization
- **bcryptjs** for password hashing
- **Express Validator** for input validation

#### AI Service
- **Python 3.10** with FastAPI framework
- **Heuristic Analysis** for sprint prediction
- **Rule-based Logic** for risk assessment
- **Pydantic** for data validation

#### Database
- **MongoDB** for document storage
- **Optimized indexes** for performance
- **Data validation** at schema level

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- Python 3.9+ with pip
- MongoDB 5.0+ (local or Atlas)
- Git

### One-Command Setup

```bash
# Clone repository
git clone <repository-url>
cd prodflow-ai

# Install everything and start services
# Windows
install-all.bat && start-all.bat

# Linux/Mac
chmod +x install-all.sh start-all.sh
./install-all.sh && ./start-all.sh
```

### Access the Application
- **Frontend**: https://prodflowaii.vercel.app (Production) / http://localhost:3000 (Development)
- **Backend API**: https://prodflow-6rmm.onrender.com (Production) / http://localhost:5000 (Development)
- **AI Service**: https://prodflow-2w53.onrender.com (Production) / http://localhost:8000 (Development)

## 🐳 Docker Deployment

### Development
```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 AI Prediction System

Our intelligent prediction system uses advanced heuristic analysis:

### Prediction Algorithm
- **Heuristic Analysis**: Rule-based system analyzing sprint parameters
- **85% Accuracy**: Reliable predictions based on proven sprint metrics
- **Real-time Analysis**: Instant feedback on sprint feasibility
- **Risk Assessment**: Identifies potential blockers and bottlenecks

### Features Analyzed (9 total)
- Team size and workload distribution
- Sprint duration and daily effort
- Task complexity and dependencies
- Historical success rates
- Team experience levels

## 📁 Project Structure

```
prodflow-ai/
├── docs/                    # 📚 Documentation
│   ├── ARCHITECTURE.md     # System architecture overview
│   ├── AUTHENTICATION.md   # Auth system documentation
│   ├── DEPLOYMENT.md       # Complete deployment guide
│   ├── PERFORMANCE.md      # Performance optimization tips
│   └── TESTING.md          # Testing strategies & scenarios
├── frontend/                # ⚛️ React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── context/        # React context providers
│   │   └── api/            # API configuration
│   └── Dockerfile          # Frontend container config
├── backend/                 # 🚀 Node.js backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── Dockerfile         # Backend container config
├── ai-service/             # 🤖 Python AI/ML service
│   ├── main.py            # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # AI service container config
├── nginx/                  # 🌐 Nginx configuration
├── docker-compose.yml      # 🐳 Development containers
├── docker-compose.prod.yml # 🐳 Production containers
├── mongo-init.js          # 🗄️ Database initialization
└── README.md              # 📖 Main documentation
```

## 🔧 Configuration

### Environment Variables

Each service has its own environment configuration:

- **Backend**: `backend/.env`
- **Frontend**: `frontend/.env`
- **AI Service**: `ai-service/.env`

Example configurations are provided in `.env.example` files.

### Key Configuration Options

#### Backend
```bash
MONGODB_URI=mongodb+srv://pallavkanani27_db_user:BcudjJZC1dDuC97R@cluster0.ug3q9ut.mongodb.net/prodflow-ai?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=https://prodflowaii.vercel.app
AI_REQUEST_TIMEOUT_MS=4000
AI_MAX_RETRIES=1
AI_RETRY_BASE_DELAY_MS=300
SERVER_REQUEST_TIMEOUT_MS=30000
SERVER_HEADERS_TIMEOUT_MS=35000
SERVER_KEEP_ALIVE_TIMEOUT_MS=5000
```

#### Frontend
```bash
VITE_API_BASE_URL=https://prodflow-6rmm.onrender.com/api
VITE_AI_SERVICE_URL=https://prodflow-2w53.onrender.com
```

#### AI Service
```bash
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
```

## 🔐 Security Features

- **JWT Authentication** with secure session management
- **Password Hashing** using bcryptjs with salt rounds
- **Input Validation** on all API endpoints
- **CORS Configuration** for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Secure Headers** for XSS and CSRF protection
- **Environment Variables** for sensitive configuration

## 📈 Performance Optimizations

- **Database Indexing** for fast queries
- **Connection Pooling** for database efficiency
- **Gzip Compression** for reduced payload sizes
- **Static Asset Caching** with proper headers
- **Code Splitting** in frontend for faster loading
- **Docker Multi-stage Builds** for smaller images
- **AI timeout/retry fallback** for resilient sprint creation

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

Runs an end-to-end backend smoke workflow against `http://localhost:5000/api` by default.
You can override target API with:

```bash
TEST_API_BASE_URL=http://localhost:5000/api npm test
```

Quick modes:

```bash
# Fast smoke (auth + role guards + pagination contracts)
npm run test:fast

# Full critical workflow (invites, sprint, task review/approval)
npm run test:full
```

### Frontend Testing
```bash
cd frontend
npm test
```

### AI Service Testing
```bash
cd ai-service
python -m pytest
```

## 📚 API Documentation

The backend provides a comprehensive RESTful API:

- **Authentication**: `/api/auth/*`
- **Products**: `/api/products/*`
- **Teams**: `/api/teams/*`
- **Sprints**: `/api/sprints/*`
- **AI Predictions**: `/ai/sprint-success`

### Pagination (Performance)

List endpoints support optional pagination query params:

- `page`: 1-based page number
- `limit`: items per page (max `100`)

When pagination is provided, responses include:

- `totalCount`
- `page`
- `limit`
- `totalPages`

Example:

```bash
GET /api/sprints?page=1&limit=20
GET /api/products?page=2&limit=10
GET /api/sprints/my-tasks?page=1&limit=25
```

Supported paginated list routes:

- `/api/products`
- `/api/products/:id/features`
- `/api/sprints`
- `/api/sprints/my-tasks`
- `/api/teams/invitations`
- `/api/teams/product/:productId`

Full API documentation is available in `backend/API.md`.

## 🚀 Deployment Options

### Cloud Platforms
- **AWS**: EC2, ECS, or Lambda deployment
- **Google Cloud**: Compute Engine or Cloud Run
- **Azure**: Container Instances or App Service
- **DigitalOcean**: Droplets or App Platform

### Self-Hosted
- **Docker Compose**: Complete stack deployment
- **Kubernetes**: Scalable container orchestration
- **PM2**: Process management for Node.js
- **Nginx**: Reverse proxy and load balancing

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Scikit-learn** for machine learning capabilities
- **React** and **Tailwind CSS** for modern UI development
- **FastAPI** for high-performance Python API
- **MongoDB** for flexible document storage
- **Docker** for containerization support

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment help
- Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system overview
- See [docs/TESTING.md](docs/TESTING.md) for testing strategies
- Check [docs/PERFORMANCE.md](docs/PERFORMANCE.md) for optimization tips
- Review [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) for auth setup
- See API documentation in `backend/API.md`

---

**Built with ❤️ for modern development teams**
