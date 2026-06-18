@echo off

echo =========================================
echo    Wi-Fi Controller - Quick Start
echo =========================================

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npm is not installed or not in PATH.
    pause
    exit /b 1
)

:: ── Backend ──────────────────────────────────
echo.
echo ^> Setting up Backend...
cd Backend

if not exist venv (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    call .\venv\Scripts\activate.bat
    echo [INFO] Installing python dependencies...
    pip install -r requirements.txt
) else (
    call .\venv\Scripts\activate.bat
)

echo ^> Starting Backend server...
start "Backend" cmd /k "call .\venv\Scripts\activate.bat && uvicorn app.main:app --reload"
echo [OK] Backend running at http://127.0.0.1:8000

:: ── Frontend ─────────────────────────────────
echo.
echo ^> Setting up Frontend...
cd ..\Frontend

if not exist node_modules (
    echo [INFO] Installing npm packages...
    npm install
)

echo ^> Starting Frontend server...
start "Frontend" cmd /k "npm run dev"
echo [OK] Frontend running at http://localhost:5173

:: ── Done ─────────────────────────────────────
echo.
echo =========================================
echo    Both servers are running!
echo    Frontend : http://localhost:5173
echo    Backend  : http://127.0.0.1:8000
echo    API Docs : http://127.0.0.1:8000/docs
echo =========================================
echo Two terminal windows have been opened.
echo Close them to stop the servers.
pause