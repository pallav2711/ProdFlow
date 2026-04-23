# 🚀 Deployment Guide

## Overview

This guide covers deploying ProdFlow AI to production environments.

## Deployment Options

### Option 1: Platform-as-a-Service (Recommended for Beginners)

#### Frontend: Vercel

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select `frontend` as root directory

2. **Configure Build Settings**:
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend.herokuapp.com/api
   VITE_AI_SERVICE_URL=https://your-ai-service.railway.app
   ```

4. **Deploy**: Automatic on git push

#### Backend: Railway/Heroku

**Railway**:
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `backend` directory
4. Add environment variables
5. Deploy

**Heroku**:
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git subtree push --prefix backend heroku main
```

#### AI Service: Railway/Render

**Railway**:
1. New Project → Deploy from GitHub
2. Select `ai-service` directory
3. Add environment variables
4. Deploy

**Render**:
1. Go to [render.com](https://render.com)
2. New Web Service
3. Connect repository
4. Root Directory: `ai-service`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `python main.py`

#### Database: MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Add to backend environment variables

### Option 2: VPS/Cloud Server (AWS, DigitalOcean, etc.)

#### Prerequisites

- Ubuntu 20.04+ server
- Domain name (optional)
- SSL certificate (Let's Encrypt)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Deploy Backend

```bash
# Clone repository
git clone https://github.com/yourusername/prodflow-ai.git
cd prodflow-ai/backend

# Install dependencies
npm install --production

# Create production env file
cp .env.example .env
nano .env  # Edit with production values

# Start with PM2
pm2 start server.js --name prodflow-backend
pm2 save
pm2 startup
```

#### 3. Deploy AI Service

```bash
cd ../ai-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create production env file
cp .env.example .env
nano .env  # Edit with production values

# Start with PM2
pm2 start main.py --name prodflow-ai --interpreter python3
pm2 save
```

#### 4. Deploy Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Copy to Nginx directory
sudo cp -r dist/* /var/www/html/
```

#### 5. Configure Nginx

```nginx
# /etc/nginx/sites-available/prodflow
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # AI Service
    location /ai {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/prodflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 3: Docker Deployment

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://backend:5000/api
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/prodflow
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
      - ai-service

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - BACKEND_API_URL=http://backend:5000/api

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

```bash
# Deploy
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Environment Configuration

### Production Environment Files

Create these files (NOT committed to git):

**backend/.env.production**:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prodflow
JWT_SECRET=your_production_jwt_secret_here
JWT_REFRESH_SECRET=your_production_refresh_secret_here
FRONTEND_URL=https://your-frontend-domain.com
AI_SERVICE_URL=https://your-ai-service-domain.com
AI_SERVICE_API_KEY=your_production_api_key_here
```

**frontend/.env.production**:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_AI_SERVICE_URL=https://your-ai-service-domain.com
VITE_NODE_ENV=production
```

**ai-service/.env.production**:
```env
ENVIRONMENT=production
PORT=8000
BACKEND_API_URL=https://your-backend-domain.com/api
API_KEY=your_production_api_key_here
```

## Post-Deployment Checklist

- [ ] All services are running
- [ ] Database is accessible
- [ ] Environment variables are set correctly
- [ ] SSL certificates are installed
- [ ] CORS is configured properly
- [ ] API endpoints are accessible
- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] AI predictions work
- [ ] Logs are being generated
- [ ] Monitoring is set up
- [ ] Backups are configured

## Monitoring

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs prodflow-backend
pm2 logs prodflow-ai

# Monitor resources
pm2 monit
```

### Application Monitoring

Consider using:
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Infrastructure monitoring

## Backup Strategy

### Database Backups

```bash
# MongoDB backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/prodflow" --out=/backups/$(date +%Y%m%d)

# Automated daily backups
crontab -e
0 2 * * * /path/to/backup-script.sh
```

### Code Backups

- Use Git for version control
- Regular commits and pushes
- Tag releases: `git tag v1.0.0`

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Nginx, AWS ALB, or Cloudflare
2. **Multiple Backend Instances**: PM2 cluster mode
3. **Multiple AI Service Instances**: Docker Swarm or Kubernetes
4. **Shared Cache**: Redis for session storage
5. **Database Replication**: MongoDB replica set

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching strategies

## Troubleshooting

### Common Issues

**Backend won't start**:
```bash
# Check logs
pm2 logs prodflow-backend

# Check environment variables
pm2 env prodflow-backend

# Restart
pm2 restart prodflow-backend
```

**Database connection failed**:
- Check MongoDB URI
- Verify network access
- Check firewall rules

**CORS errors**:
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in server.js

---

**Last Updated**: 2026
