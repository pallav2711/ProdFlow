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
- **AI Predictions**: Advanced ensemble ML models predict sprint success with 98%+ accuracy
- **Real-time Dashboard**: Comprehensive analytics and progress tracking

### 🤖 AI-Powered Features
- **Sprint Success Prediction**: XGBoost ensemble model with 98.25% accuracy
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
- **Python 3.11** with FastAPI framework
- **Scikit-learn** for machine learning models
- **XGBoost & LightGBM** for ensemble predictions
- **Pandas & NumPy** for data processing
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
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000

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

## 📊 AI Model Performance

Our advanced AI prediction system uses ensemble machine learning:

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|-------|----------|-----------|--------|----------|---------|
| **XGBoost** | **98.25%** | **99.35%** | **98.40%** | **98.88%** | **99.94%** |
| LightGBM | 98.25% | 99.35% | 98.40% | 98.88% | 99.83% |
| Gradient Boosting | 98.00% | 99.04% | 98.40% | 98.72% | 99.84% |
| Random Forest | 97.75% | 99.35% | 97.76% | 98.55% | 99.81% |

### Features Used (14 total)
- Team size and composition
- Sprint duration and workload
- Task complexity and dependencies
- Historical success rates
- Workload distribution metrics

## 📁 Project Structure

```
prodflow-ai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── context/        # React context providers
│   │   └── ...
│   ├── Dockerfile          # Frontend container config
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── Dockerfile         # Backend container config
│   └── package.json
├── ai-service/             # Python AI/ML service
│   ├── main.py            # FastAPI application
│   ├── train_model_advanced.py  # ML model training
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # AI service container config
├── PROJECT_DOCUMENTATION/ # Academic documentation
├── docker-compose.yml     # Development containers
├── docker-compose.prod.yml # Production containers
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
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
MONGODB_URI=mongodb://localhost:27017/prodflow-ai
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://localhost:8000
```

#### Frontend
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:8000
```

#### AI Service
```bash
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
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

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
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

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

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
- Check the [DEPLOYMENT.md](DEPLOYMENT.md) for troubleshooting
- Review the API documentation in `backend/API.md`

---

**Built with ❤️ for modern development teams**
