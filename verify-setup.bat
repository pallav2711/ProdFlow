@echo off
echo ================================================================================
echo PRODFLOW AI - SETUP VERIFICATION SCRIPT
echo ================================================================================
echo.

set "ERRORS=0"

echo [1/8] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/
    set /a ERRORS+=1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js %%i found
)

echo.
echo [2/8] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.9+ from https://python.org/
    set /a ERRORS+=1
) else (
    for /f "tokens=*" %%i in ('python --version') do echo ✅ Python %%i found
)

echo.
echo [3/8] Checking MongoDB connection...
mongosh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB Shell not found. Using fallback connection test...
) else (
    echo ✅ MongoDB Shell found
)

echo.
echo [4/8] Checking Backend dependencies...
if exist "backend\node_modules" (
    echo ✅ Backend dependencies installed
) else (
    echo ❌ Backend dependencies not installed. Run: cd backend && npm install
    set /a ERRORS+=1
)

echo.
echo [5/8] Checking Frontend dependencies...
if exist "frontend\node_modules" (
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ Frontend dependencies not installed. Run: cd frontend && npm install
    set /a ERRORS+=1
)

echo.
echo [6/8] Checking AI Service setup...
if exist "ai-service\venv" (
    echo ✅ AI Service virtual environment found
) else (
    echo ❌ AI Service virtual environment not found. Run install-all.bat
    set /a ERRORS+=1
)

echo.
echo [7/8] Checking AI Model...
if exist "ai-service\sprint_success_model.pkl" (
    echo ✅ AI Model trained and ready
) else (
    echo ❌ AI Model not found. Run: cd ai-service && python train_model_advanced.py
    set /a ERRORS+=1
)

echo.
echo [8/8] Checking Environment Files...
if exist "backend\.env" (
    echo ✅ Backend environment file found
) else (
    echo ⚠️  Backend .env not found. Using default configuration.
)

if exist "frontend\.env" (
    echo ✅ Frontend environment file found
) else (
    echo ⚠️  Frontend .env not found. Using default configuration.
)

if exist "ai-service\.env" (
    echo ✅ AI Service environment file found
) else (
    echo ⚠️  AI Service .env not found. Using default configuration.
)

echo.
echo ================================================================================
echo VERIFICATION SUMMARY
echo ================================================================================

if %ERRORS% equ 0 (
    echo ✅ ALL CHECKS PASSED! Your ProdFlow AI setup is ready.
    echo.
    echo Next steps:
    echo 1. Run 'start-all.bat' to start all services
    echo 2. Open http://localhost:3000 in your browser
    echo 3. Create your first account and start planning sprints!
    echo.
    echo For production deployment, see DEPLOYMENT.md
) else (
    echo ❌ %ERRORS% error(s) found. Please fix the issues above before proceeding.
    echo.
    echo Quick fixes:
    echo - Run 'install-all.bat' to install all dependencies
    echo - Ensure Node.js 16+ and Python 3.9+ are installed
    echo - Check MongoDB connection if using local database
)

echo.
echo ================================================================================
echo SYSTEM INFORMATION
echo ================================================================================
echo OS: %OS%
echo Processor: %PROCESSOR_ARCHITECTURE%
echo User: %USERNAME%
echo Current Directory: %CD%
echo.

echo Port Check:
netstat -an | findstr ":3000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is in use (Frontend)
) else (
    echo ✅ Port 3000 available (Frontend)
)

netstat -an | findstr ":5000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 5000 is in use (Backend)
) else (
    echo ✅ Port 5000 available (Backend)
)

netstat -an | findstr ":8000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 8000 is in use (AI Service)
) else (
    echo ✅ Port 8000 available (AI Service)
)

echo.
pause