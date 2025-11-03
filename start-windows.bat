@echo off
echo ====================================
echo AfriBet Games - Starting Application
echo ====================================
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo ERROR: Dependencies not found!
    echo Please run setup-windows.bat first
    pause
    exit /b 1
)

echo Starting the development server...
echo.
echo The application will be available at:
echo http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

set NODE_ENV=development
npm run dev
