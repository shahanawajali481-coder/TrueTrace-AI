# TrueTrace AI - Start Android Expo Dev Server (PowerShell)
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting TrueTrace AI Android App (Expo) " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$androidDir = Join-Path $scriptDir "..\apps\android"

Set-Location $androidDir

if (-not (Test-Path ".\node_modules")) {
    Write-Host "Installing dependencies in apps/android..." -ForegroundColor Yellow
    npm install
}

Write-Host "`nLaunching Expo Dev Server..." -ForegroundColor Green
Write-Host "• Press 'a' to launch on an active Android Emulator" -ForegroundColor Yellow
Write-Host "• Scan QR code using Expo Go on a physical Android device on the same Wi-Fi network" -ForegroundColor Yellow
Write-Host "• Navigate to 'Settings' screen in-app to configure/test the Backend IP address`n" -ForegroundColor Cyan

npx expo start
