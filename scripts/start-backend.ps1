# TrueTrace AI - Start Backend Service (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting TrueTrace AI Backend Service " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "..\backend"

Set-Location $backendDir

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Creating Python virtual environment in backend\.venv..." -ForegroundColor Yellow
    python -m venv .venv
    .\.venv\Scripts\python.exe -m pip install --upgrade pip
    .\.venv\Scripts\pip.exe install -r requirements.txt
}

Write-Host "Launching FastAPI Uvicorn Server at http://127.0.0.1:8000..." -ForegroundColor Green
Write-Host "Swagger OpenAPI Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow

.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
