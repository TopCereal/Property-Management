@echo off
REM Start both backend and frontend servers
echo Starting Property Management Application...
echo.
echo Starting Backend (Python/FastAPI)...
start "Backend Server" cmd /k "cd /d "%~dp0Backend" && (if exist .venv\Scripts\python.exe (.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000) else (python -m uvicorn app.main:app --host 127.0.0.1 --port 8000))"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend (Vite/React)...
start "Frontend Server" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo You can close this window. Servers will keep running.
timeout /t 5 /nobreak > nul
