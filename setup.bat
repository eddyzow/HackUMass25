@echo off
echo 🚀 Starting Language Learning Tool Setup...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

node --version | findstr /C:"v" >nul
echo ✅ Node.js version:
node --version
echo.

REM Backend setup
echo 📦 Setting up Backend...
cd backend

if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env with your MongoDB and Azure credentials!
)

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo ✅ Backend setup complete!
echo.

REM Frontend setup
echo 📦 Setting up Frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo ✅ Frontend setup complete!
echo.

REM Return to root directory
cd ..

REM Final instructions
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your credentials
echo 2. Start backend: cd backend ^&^& npm run dev
echo 3. Start frontend (new terminal): cd frontend ^&^& npm run dev
echo.
echo 📚 See README.md for detailed instructions on getting API keys
