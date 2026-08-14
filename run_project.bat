@echo off
title InvestEd Launcher

echo ==========================================
echo   Starting InvestEd Servers...
echo ==========================================

:: Start the Backend Server in a new window
echo [1/2] Launching Django Backend...
start "InvestEd Django Backend" cmd /k "cd investsim\backend && ..\..\.venv\Scripts\python manage.py runserver"

:: Start the Frontend Server in a new window
echo [2/2] Launching React Frontend...
start "InvestEd React Frontend" cmd /k "cd investsim\frontend && npm run dev"

echo.
echo ==========================================
echo   Success! 
echo   - Backend runs on http://localhost:8000
echo   - Frontend runs on http://localhost:5173
echo   (Keep the command windows open to run)
echo ==========================================
echo.
pause
