# Property Management - Start Script
# Launches both backend and frontend servers

Write-Host "Starting Property Management Application..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting Backend (Python/FastAPI)..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "Backend"
$pythonExe = Join-Path $backendPath ".venv\Scripts\python.exe"

if (Test-Path $pythonExe) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; & '$pythonExe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WindowStyle Normal
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WindowStyle Normal
}

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend (Vite/React)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check the new windows for server output." -ForegroundColor Gray
