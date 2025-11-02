# Property Management - Start Script
# Launches both backend and frontend servers

Write-Host "Starting Property Management Application..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host "Starting Backend (Python/FastAPI)..." -ForegroundColor Cyan
$backendPath = Join-Path $scriptDir "Backend"
$pythonExe = Join-Path $backendPath ".venv\Scripts\python.exe"

if (Test-Path $pythonExe) {
    Write-Host "Using venv Python: $pythonExe" -ForegroundColor Gray
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; & '$pythonExe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
} else {
    Write-Host "Using system Python" -ForegroundColor Gray
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
}

# Wait for backend to initialize
Write-Host "Waiting for backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend (Vite/React)..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; npm run dev"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check the new windows for server output." -ForegroundColor Gray
Write-Host "This window will close in 5 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 5
