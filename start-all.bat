@echo off
echo ================================================================================
echo PRODFLOW AI - STARTING ALL SERVICES
echo ================================================================================
echo.

echo Checking if all services are ready...

echo [1/4] Checking Backend...
if not exist "backend\node_modules" (
    echo ❌ Backend dependencies not installed. Run install-all.bat first.
    pause
    exit /b 1
)

echo [2/4] Checking Frontend...
if not exist "frontend\node_modules" (
    echo ❌ Frontend dependencies not installed. Run install-all.bat first.
    pause
    exit /b 1
)

echo [3/4] Checking AI Service...
if not exist "ai-service\venv" (
    echo ❌ AI Service virtual environment not found. Run install-all.bat first.
    pause
    exit /b 1
)

if not exist "ai-service\sprint_success_model.pkl" (
    echo ❌ AI Model not found. Training model now...
    cd ai-service
    call venv\Scripts\activate.bat
    python train_model_advanced.py
    if %errorlevel% neq 0 (
        echo ❌ Model training failed!
        pause
        exit /b 1
    )
    cd ..
)

echo [4/4] All checks passed! Starting services...
echo.

echo ================================================================================
echo 🚀 STARTING SERVICES
echo ================================================================================

echo Starting AI Service (Port 8000)...
start "ProdFlow AI Service" cmd /k "cd ai-service && call venv\Scripts\activate.bat && python main.py"
timeout /t 3 /nobreak >nul

echo Starting Backend API (Port 5000)...
start "ProdFlow Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo Starting Frontend (Port 3000)...
start "ProdFlow Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ================================================================================
echo ✅ ALL SERVICES STARTED SUCCESSFULLY!
echo ================================================================================
echo.
echo Services running:
echo - Frontend:   https://prodflowaii.vercel.app (Production) / http://localhost:3000 (Development)
echo - Backend:    http://localhost:5000
echo - AI Service: http://localhost:8000
echo.
echo 📱 Production Frontend: https://prodflowaii.vercel.app
echo 🛠️  Development Frontend: http://localhost:3000
echo.
echo To stop all services, close the terminal windows or press Ctrl+C in each.
echo For production deployment, use Docker: docker-compose up -d
echo.
pause
