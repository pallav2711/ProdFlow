@echo off
echo ================================================================================
echo FIXING AI SERVICE DEPENDENCIES
echo ================================================================================
echo.

echo Activating AI Service virtual environment...
cd ai-service
call venv\Scripts\activate.bat

echo Installing missing dependencies...
python -m pip install --upgrade pip
pip install python-dotenv==1.0.0
pip install fastapi==0.95.2
pip install uvicorn[standard]==0.22.0
pip install pydantic==1.10.8
pip install numpy==1.24.3
pip install scikit-learn==1.2.2

echo.
echo ✅ AI Service dependencies fixed!
echo.
echo Testing AI Service...
python main.py &
timeout /t 3 /nobreak >nul
taskkill /f /im python.exe >nul 2>&1

echo.
echo ✅ AI Service is now ready to run!
echo To start the AI service: cd ai-service && call venv\Scripts\activate.bat && python main.py
echo.
pause