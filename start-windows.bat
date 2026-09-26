@echo off
echo ==========================================
echo    JobLens - Full Stack Launcher
echo ==========================================
echo.

:: Check Node
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Install from https://nodejs.org
    pause & exit /b 1
)

:: Backend
echo [1/2] Starting Backend (Express + MongoDB)...
start "JobLens Backend" cmd /k "cd /d \"%~dp0CCPDMS_FINAL\" && node server.js"
timeout /t 3 /nobreak >nul

:: Frontend
echo [2/2] Starting Frontend (React)...
start "JobLens Frontend" cmd /k "cd /d \"%~dp0joblens-frontend\" && npm start"

echo.
echo ==========================================
echo  JobLens is starting up!
echo  Backend:  http://localhost:5000/api/health
echo  Frontend: http://localhost:3000
echo ==========================================
echo.
echo Default Demo Credentials:
echo   Coordinator: coordinator@college.edu / Test@123
echo   Student:     student@college.edu     / Test@123
echo.
pause
