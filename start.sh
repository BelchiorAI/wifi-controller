#!/bin/bash

echo "========================================="
echo "   Wi-Fi Controller - Quick Start"
echo "========================================="

# Check Python command (either python3 or python)
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo "Error: Python is not installed or not in PATH."
    exit 1
fi

# Check npm command
if ! command -v npm >/dev/null 2>&1; then
    echo "Error: Node.js/npm is not installed or not in PATH."
    exit 1
fi

# ── Backend ──────────────────────────────────
echo ""
echo "Setting up Backend..."
cd Backend

if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Creating one..."
    $PYTHON_CMD -m venv .venv
    source .venv/bin/activate
    echo "Installing Backend dependencies..."
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

echo "Starting Backend server..."
uvicorn app.main:app --reload &
BACKEND_PID=$!
echo "Backend running at http://127.0.0.1:8000"

# ── Frontend ─────────────────────────────────
echo ""
echo "▶ Setting up Frontend..."
cd ../Frontend

if [ ! -d "node_modules" ]; then
    echo "▶ node_modules not found. Installing packages..."
    npm install
fi

echo "▶ Starting Frontend server..."
npm run dev &
FRONTEND_PID=$!
echo "✔ Frontend running at http://localhost:5173"

# ── Done ─────────────────────────────────────
echo ""
echo "========================================="
echo "   Both servers are running!"
echo "   Frontend : http://localhost:5173"
echo "   Backend  : http://127.0.0.1:8000"
echo "   API Docs : http://127.0.0.1:8000/docs"
echo "========================================="
echo "Press Ctrl+C to stop both servers."

# Keep script alive and kill both on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait