@echo off
title PropMinds Property Management System
cd /d "%~dp0"
echo ========================================================
echo   PropMinds Property Management System - Windows Launcher
echo ========================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js LTS from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules\" (
    echo [INFO] First time setup detected. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an issue. Please check your internet connection.
        pause
        exit /b 1
    )
)

:: Open default browser to the app after a 2-second grace period
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start the application dev server
echo [INFO] Launching PropMinds on http://localhost:3000 ...
call npm run dev
pause
