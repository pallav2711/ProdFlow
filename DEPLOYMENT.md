# 🚀 ProdFlow AI - Deployment Guide

Complete deployment guide for ProdFlow AI Sprint Planning SaaS with AI Predictions.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 16.0.0 or higher
- **Python**: 3.9 or higher
- **MongoDB**: 5.0 or higher (local) or MongoDB Atlas (cloud)
- **Docker**: 20.10 or higher (for containerized deployment)
- **Git**: Latest version

### Development Tools
- **npm**: 8.0.0 or higher
- **pip**: Latest version
- **Virtual Environment**: Python venv or conda

## 🏠 Local Development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prodflow-ai
   ```

2. **Install all dependencies**
   ```bash
   # Windows
   install-all.bat
   
   # Linux/Mac
   chmod +x install-all.sh
   ./install-all.sh
   ```

3. **Start all services**
   ```bash
   # Windows
   start-all.bat
   
   # Linux/Mac
   ./start-all.sh
   ```

4. **Access the application**
   - Frontend: https://prodflowaii.vercel.app (Production) / http://localhost:3000 (Development)
   - Backend API: https://prodflow-6rmm.onrender.com (Production) / http://localhost:5000 (Development)
   - AI Service: http://localhost:8000

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate.bat  # Windows

pip install -r requirements.txt
python train_model_advanced.py
python main.py
```

## 🐳 Docker Deployment

### Development with Docker

1. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services**
   ```bash
   docker-compose down
   ```

### Production with Docker

1. **Create production environment**
   ```bash
   cp .env.example .env.prod
   # Edit .env.prod with production values
   ```

2. **Deploy production stack**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
   ```

## 🌐 Production Deployment

### Cloud Platforms

#### Render Deployment (Backend)

**ProdFlow AI Backend is already deployed on Render**: https://prodflow-6rmm.onrender.com

For your own Render deployment:

1. **Connect Repository**
   - Go to [Render Dashboard](https://render.com/dashboard)
   - Create new Web Service
   - Connect your GitHub repository
   - Select the `backend` folder as root directory

2. **Configure Build Settings**
   ```bash
   # Build Command
   npm install
   
   # Start Command
   npm start
   
   # Environment
   Node.js
   ```

3. **Environment Variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://pallavkanani27_db_user:BcudjJZC1dDuC97R@cluster0.ug3q9ut.mongodb.net/prodflow-ai?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   AI_SERVICE_URL=https://your-ai-service-domain.com
   FRONTEND_URL=https://prodflowaii.vercel.app
   ```

4. **Deploy**
   - Render will automatically deploy on every push to main branch
   - Custom domain can be configured in service settings

#### Vercel Deployment (Frontend)

**ProdFlow AI Frontend is already deployed on Vercel**: https://prodflowaii.vercel.app

For your own Vercel deployment:

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

2. **Configure Build Settings**
   ```bash
   # Build Command
   npm run build
   
   # Output Directory
   dist
   
   # Install Command
   npm install
   ```

3. **Environment Variables**
   ```bash
   VITE_API_BASE_URL=https://prodflow-6rmm.onrender.com/api
   VITE_AI_SERVICE_URL=https://your-ai-service-domain.com
   VITE_NODE_ENV=production
   ```

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Custom domain can be configured in project settings

#### AWS Deployment
1. **EC2 Instance Setup**
   - Launch EC2 instance (t3.medium or larger)
   - Install Docker and Docker Compose
   - Configure security groups (ports 80, 443)

2. **Database Setup**
   - Use MongoDB Atlas or AWS DocumentDB
   - Configure connection string in environment

3. **Load Balancer**
   - Set up Application Load Balancer
   - Configure SSL certificates
   - Route traffic to services

#### Google Cloud Platform
1. **Compute Engine Setup**
   - Create VM instance
   - Install required software
   - Configure firewall rules

2. **Cloud SQL or MongoDB Atlas**
   - Set up managed database
   - Configure connection

#### Azure Deployment
1. **Container Instances**
   - Deploy using Azure Container Instances
   - Configure networking and storage

2. **Cosmos DB**
   - Use Azure Cosmos DB with MongoDB API
   - Configure connection string

### Manual Production Setup

1. **Server Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Python
   sudo apt install python3 python3-pip python3-venv -y
   
   # Install MongoDB (if using local)
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd prodflow-ai
   
   # Install dependencies
   ./install-all.sh
   
   # Configure environment
   cp backend/.env.production backend/.env
   cp frontend/.env.production frontend/.env
   cp ai-service/.env.production ai-service/.env
   
   # Edit environment files with production values
   ```

3. **Process Management (PM2)**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start services
   pm2 start ecosystem.config.js
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

4. **Reverse Proxy (Nginx)**
   ```bash
   # Install Nginx
   sudo apt install nginx -y
   
   # Configure Nginx (see nginx configuration below)
   sudo nano /etc/nginx/sites-available/prodflow-ai
   
   # Enable site
   sudo ln -s /etc/nginx/sites-available/prodflow-ai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## ⚙️ Environment Configuration

### Backend Environment Variables

```bash
# Server Configuration
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prodflow-ai

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# Services
AI_SERVICE_URL=https://your-ai-service-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Performance
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_AI_SERVICE_URL=https://your-ai-service-domain.com

# App Configuration
VITE_APP_NAME=ProdFlow AI
VITE_NODE_ENV=production

# Features
VITE_ENABLE_AI_PREDICTIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### AI Service Environment Variables

```bash
# Server Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production

# CORS
CORS_ORIGINS=["https://your-frontend-domain.com", "https://your-backend-domain.com"]

# Performance
MAX_WORKERS=8
TIMEOUT=30
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Sign up at MongoDB Atlas
   - Create a new cluster
   - Configure network access (IP whitelist)

2. **Create Database User**
   - Go to Database Access
   - Create user with readWrite permissions
   - Note username and password

3. **Get Connection String**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with actual password

### Local MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt install mongodb-org
   
   # Start service
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Create Database and User**
   ```bash
   mongosh
   use prodflow-ai
   db.createUser({
     user: "prodflow-app",
     pwd: "your-password",
     roles: ["readWrite"]
   })
   ```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- **Backend**: `GET /api/health`
- **Frontend**: `GET /health`
- **AI Service**: `GET /health`

### Monitoring Setup

1. **Application Monitoring**
   ```bash
   # Install monitoring tools
   npm install -g pm2
   pm2 install pm2-logrotate
   ```

2. **Log Management**
   ```bash
   # View logs
   pm2 logs
   
   # Monitor specific service
   pm2 logs backend
   ```

3. **System Monitoring**
   ```bash
   # Install system monitoring
   sudo apt install htop iotop nethogs
   ```

### Docker Health Checks

All Docker containers include health checks:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 30 seconds (AI service)

## 🔧 Troubleshooting

### Common Issues

#### 1. AI Service Model Not Found
```bash
# Solution: Train the model
cd ai-service
source venv/bin/activate
python train_model_advanced.py
```

#### 2. Database Connection Failed
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI

# Test connection
mongosh "$MONGODB_URI"
```

#### 3. Port Already in Use
```bash
# Find process using port
netstat -tulpn | grep :5000

# Kill process
sudo kill -9 <PID>
```

#### 4. Frontend Build Fails
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Performance Optimization

1. **Database Indexing**
   ```javascript
   // MongoDB indexes are created automatically via mongo-init.js
   db.users.createIndex({ "email": 1 }, { unique: true });
   db.products.createIndex({ "createdBy": 1 });
   db.sprints.createIndex({ "productId": 1, "status": 1 });
   ```

2. **Caching**
   ```bash
   # Install Redis for caching
   sudo apt install redis-server
   
   # Configure Redis in backend
   npm install redis
   ```

3. **Load Balancing**
   ```nginx
   upstream backend {
       server localhost:5000;
       server localhost:5001;
   }
   
   upstream ai-service {
       server localhost:8000;
       server localhost:8001;
   }
   ```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secrets
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Use non-root users in containers
- [ ] Configure firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use secure headers

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs` or `pm2 logs`
2. Verify environment variables
3. Test health check endpoints
4. Check database connectivity
5. Review firewall/security group settings

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install  # in backend and frontend
pip install -r requirements.txt  # in ai-service

# Restart services
pm2 restart all
# or
docker-compose restart
```

### Database Backups
```bash
# MongoDB backup
mongodump --uri="$MONGODB_URI" --out=backup-$(date +%Y%m%d)

# Restore
mongorestore --uri="$MONGODB_URI" backup-20240310/
```

---

**🎉 Congratulations!** Your ProdFlow AI application is now ready for production deployment.