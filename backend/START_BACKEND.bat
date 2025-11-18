@echo off
echo ====================================
echo Starting Calorie Tracker Backend
echo ====================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --quiet --eval "db.runCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: MongoDB is not running!
    echo.
    echo Please start MongoDB first:
    echo   Open Command Prompt as Administrator
    echo   Run: net start MongoDB
    echo.
    pause
    exit /b 1
)

echo MongoDB is running!
echo.

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Please create .env file with your configuration.
    pause
    exit /b 1
)

echo Starting backend server...
echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

npm run dev

