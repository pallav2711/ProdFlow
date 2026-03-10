# ProdFlow AI - Complete Setup Guide

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Python 3.9+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git (optional)

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your configuration:
# - Set MONGODB_URI (local: mongodb://localhost:27017/prodflow-ai)
# - Set JWT_SECRET (any random string)
# - Set AI_SERVICE_URL (http://localhost:8000)

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. AI Service Setup

```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model
python train_model.py

# Start the AI service
uvicorn main:app --reload --port 8000
```

AI Service will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## MongoDB Setup Options

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/prodflow-ai`

### Option 2: MongoDB Atlas (Cloud)
1. Create free account at mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in backend/.env

## Testing the Application

### 1. Register Users
Create three users with different roles:
- Product Manager
- Team Lead
- Developer

### 2. Create Product (as Product Manager)
- Login as Product Manager
- Go to Product Planning
- Create a product with vision
- Add features with priorities and effort estimates

### 3. Create Sprint (as Team Lead)
- Login as Team Lead
- Go to Sprint Planner
- Create a sprint
- Select features from backlog
- View AI success prediction

### 4. View Dashboard
- All users can view dashboard
- See sprint statistics and AI predictions

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify .env file exists and has correct values
- Check port 5000 is not in use

### AI Service errors
- Ensure Python virtual environment is activated
- Run `python train_model.py` to create model file
- Check port 8000 is not in use

### Frontend issues
- Clear browser cache
- Check backend is running on port 5000
- Verify proxy settings in vite.config.js

### CORS errors
- Ensure backend CORS is configured
- Check frontend is making requests to correct URL

## Project Structure

```
prodflow-ai/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── .env.example     # Environment template
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Main app
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── ai-service/
│   ├── main.py          # FastAPI app
│   ├── train_model.py   # Model training
│   └── requirements.txt
└── README.md
```

## For College Viva Preparation

### Key Points to Explain:

1. **Architecture**: 3-tier (Frontend, Backend, AI Service)
2. **Authentication**: JWT-based with role-based access control
3. **Database**: MongoDB with Mongoose ODM
4. **AI Model**: Logistic Regression for sprint success prediction
5. **Frontend**: React with Tailwind CSS for clean UI
6. **API**: RESTful design with proper HTTP methods

### Demo Flow:
1. Show landing page and explain features
2. Register users with different roles
3. Create product and features (Product Manager)
4. Create sprint with AI prediction (Team Lead)
5. Explain AI model training and prediction logic
6. Show dashboard with statistics

### Technical Questions to Prepare:
- Why Logistic Regression? (Binary classification, interpretable)
- How does JWT work? (Token-based authentication)
- Why MongoDB? (Flexible schema, good for MVP)
- How is AI integrated? (Separate microservice via REST API)
- What are the user roles? (Product Manager, Team Lead, Developer)

## Next Steps (Future Phases)

Phase 2 could include:
- Task assignment and tracking
- Real-time collaboration
- Advanced AI models (Random Forest, Neural Networks)
- Sprint burndown charts
- Team velocity tracking
- Integration with Git/Jira
