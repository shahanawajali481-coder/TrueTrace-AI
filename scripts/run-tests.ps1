# TrueTrace AI - Automated Test Suite Runner (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Running TrueTrace AI Automated Tests  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Join-Path $scriptDir ".."
$backendDir = Join-Path $rootDir "backend"
$webDir = Join-Path $rootDir "apps\web"

# 1. Run Backend Pytest Suite
Set-Location $backendDir
if (-not (Test-Path ".\.venv\Scripts\pytest.exe")) {
    Write-Host "Error: Virtual environment not found in backend\.venv." -ForegroundColor Red
    exit 1
}

Write-Host "`n[1/2] Executing Python Backend Pytest Suite (25 Tests)..." -ForegroundColor Green
.\.venv\Scripts\pytest.exe app\tests -v
$backendExit = $LASTEXITCODE

# 2. Run Frontend Vitest Suite
Set-Location $webDir
Write-Host "`n[2/2] Executing React Frontend Vitest Suite..." -ForegroundColor Green
npm run test
$webExit = $LASTEXITCODE

Set-Location $rootDir

if ($backendExit -eq 0 -and $webExit -eq 0) {
    Write-Host "`n==================================================" -ForegroundColor Green
    Write-Host " All TrueTrace AI Backend & Frontend Tests Passed! " -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome tests failed. Check log output above." -ForegroundColor Red
    exit 1
}
