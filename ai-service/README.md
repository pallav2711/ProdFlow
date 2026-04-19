# 🤖 ProdFlow AI Services

This folder contains both AI services for ProdFlow:

1. **Sprint Prediction Service** (port 8000) - Predicts sprint success/failure
2. **Performance Analysis Service** (port 8001) - Analyzes team performance

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your values

# Start both services
python start.py
```

### Production Deployment

See `../PRODUCTION_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## 📦 Services

### Sprint Prediction Service (port 8000)
- **File**: `main.py`
- **Endpoints**: `/predict`, `/health`
- **Purpose**: Predicts sprint outcomes based on planning data

### Performance Analysis Service (port 8001)
- **File**: `performance_api.py`
- **Endpoints**: `/ai/manager-insights`, `/ai/developer-performance`, `/health`
- **Purpose**: Analyzes developer and team lead performance

## 🔧 Configuration

All configuration is done via environment variables. See `.env.example` for all available options.

### Required Variables

```env
# Sprint Service
MONGODB_URI=your-mongodb-connection-string

# Performance Service
BACKEND_API_URL=your-backend-url/api
AI_SERVICE_API_KEY=your-secret-key

# Shared
CORS_ORIGINS=["your-frontend-url"]
```

## 📊 API Documentation

### Sprint Service
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Performance Service
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## 🏗️ Project Structure

```
ai-service/
├── main.py                      # Sprint Prediction Service
├── performance_api.py           # Performance Analysis Service
├── start.py                     # Unified startup script
├── requirements.txt             # Python dependencies
├── Procfile                     # Deployment configuration
├── .env.example                 # Environment template
├── config.py                    # Configuration loader
├── ai_engine/                   # ML models
│   ├── clustering.py
│   └── risk_prediction.py
├── data_ingestion/              # Data loaders
│   ├── api_data_loader.py
│   └── data_loader.py
├── insights_generator/          # Insights generation
│   └── insights.py
├── metrics_engine/              # Metrics calculation
│   ├── developer_metrics.py
│   └── teamlead_metrics.py
└── models/                      # Data models
    └── schemas.py
```

## 🔒 Security

- API key authentication for service-to-service communication
- CORS configuration for frontend access
- Environment-based configuration (no secrets in code)

## 📝 License

Part of ProdFlow AI - Sprint Management System
