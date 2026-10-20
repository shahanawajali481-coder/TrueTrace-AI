# TrueTrace AI - Master Production Build Automation (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Building TrueTrace AI Monorepo Bundles " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Join-Path $scriptDir ".."

# 1. Build Shared TypeScript Packages
Write-Host "`n[1/5] Building Shared TypeScript Packages..." -ForegroundColor Yellow
Set-Location (Join-Path $rootDir "packages\shared-types")
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "shared-types build failed." -ForegroundColor Red; exit 1 }

Set-Location (Join-Path $rootDir "packages\api-client")
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "api-client build failed." -ForegroundColor Red; exit 1 }
Write-Host "Shared packages compiled successfully!" -ForegroundColor Green

# 2. Build Web Production Bundle
Write-Host "`n[2/5] Building Web Application & PWA..." -ForegroundColor Yellow
$webDir = Join-Path $rootDir "apps\web"
Set-Location $webDir
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Web build failed." -ForegroundColor Red; exit 1 }
Write-Host "Web build succeeded! Output in apps/web/dist" -ForegroundColor Green

# 3. Synchronize Web Dist to Desktop Client & Build Desktop Installer
Write-Host "`n[3/5] Packaging Windows Desktop Installer & Portable Exe..." -ForegroundColor Yellow
$desktopDir = Join-Path $rootDir "apps\desktop"
$desktopWebDist = Join-Path $desktopDir "web-dist"
Copy-Item -Recurse -Force (Join-Path $webDir "dist") $desktopWebDist
Set-Location $desktopDir
npm run dist:win
if ($LASTEXITCODE -ne 0) { Write-Host "Desktop packaging failed." -ForegroundColor Red; exit 1 }
Write-Host "Windows Desktop Installer generated in apps/desktop/dist-win!" -ForegroundColor Green

# 4. Android Export & Bundle Check
Write-Host "`n[4/5] Bundling Android React Native Assets (Hermes Bytecode)..." -ForegroundColor Yellow
$androidDir = Join-Path $rootDir "apps\android"
Set-Location $androidDir
npx expo export -p android
if ($LASTEXITCODE -ne 0) { Write-Host "Android bundle export failed." -ForegroundColor Red; exit 1 }
Write-Host "Android production bundle generated in apps/android/dist!" -ForegroundColor Green

# 5. Run Backend Pytest Suite
Write-Host "`n[5/5] Validating Backend Test Suite..." -ForegroundColor Yellow
$backendDir = Join-Path $rootDir "backend"
Set-Location $backendDir
.\.venv\Scripts\pytest.exe app\tests -q
if ($LASTEXITCODE -ne 0) { Write-Host "Backend tests failed." -ForegroundColor Red; exit 1 }
Write-Host "Backend tests verified 100% pass!" -ForegroundColor Green

Set-Location $rootDir

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " TrueTrace AI Full Cross-Platform Build Completed!       " -ForegroundColor Cyan
Write-Host " - Web PWA: apps/web/dist                                " -ForegroundColor Green
Write-Host " - Windows NSIS Setup: apps/desktop/dist-win/*.exe       " -ForegroundColor Green
Write-Host " - Android Bundle: apps/android/dist                     " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
