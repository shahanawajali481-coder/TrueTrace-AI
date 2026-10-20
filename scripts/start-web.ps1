# TrueTrace AI - Start Web App (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting TrueTrace AI Web / PWA App   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$webDir = Join-Path $scriptDir "..\apps\web"

Set-Location $webDir

if (-not (Test-Path ".\node_modules")) {
    Write-Host "Installing npm dependencies in apps/web..." -ForegroundColor Yellow
    npm install
}

Write-Host "Launching Vite Dev Server at http://localhost:5173..." -ForegroundColor Green
npm run dev
