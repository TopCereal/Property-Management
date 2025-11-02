@echo off
REM Start both backend and frontend servers
echo Starting Property Management Application...
echo.
echo Starting Backend (Python/FastAPI)...
start "Backend Server" cmd /k "cd /d %~dp0Backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak > nul

echo Starting Frontend (Vite/React)...
start "Frontend Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this launcher (servers will continue running)
pause > nul
