@echo off
REM ======================================================================
REM AI Question Generator - One-Click Starter
REM ======================================================================
REM This script will:
REM 1. Check if Node.js is installed
REM 2. Install dependencies (first time only)
REM 3. Build the app
REM 4. Start the server
REM 5. Open the app in your browser
REM ======================================================================

setlocal enabledelayedexpansion
cls

echo.
echo ======================================================================
echo  AI Question Generator - Starten
echo ======================================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js ist nicht installiert!
    echo.
    echo Bitte laden Sie Node.js herunter von: https://nodejs.org/
    echo Installieren Sie die LTS-Version und versuchen Sie es erneut.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js gefunden: 
node --version

echo.
echo ======================================================================
echo [1/4] Abhangigkeiten installieren...
echo ======================================================================

if not exist "node_modules" (
    echo Dependencies werden zum ersten Mal installiert...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install fehlgeschlagen!
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies bereits vorhanden
)

echo.
echo ======================================================================
echo [2/4] App wird kompiliert...
echo ======================================================================

call npm run build
if errorlevel 1 (
    echo [ERROR] Build fehlgeschlagen!
    pause
    exit /b 1
)

echo [OK] Build erfolgreich!

echo.
echo ======================================================================
echo [3/4] Server wird gestartet...
echo ======================================================================
echo.
echo Die App wird auf http://localhost:3000 gestartet.
echo.
echo Drucken Sie STRG+C um den Server zu beenden.
echo.

REM Open browser
timeout /t 2 /nobreak
start http://localhost:3000

echo.
echo ======================================================================
echo [4/4] App lauft!
echo ======================================================================
echo.

REM Start the app
call npm start

pause
