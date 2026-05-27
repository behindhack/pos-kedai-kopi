# Build Debug APK Script for Kedai Kopi POS (PowerShell)
# Usage: .\build-debug.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kedai Kopi POS - Build Debug APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if android directory exists
if (-not (Test-Path "android")) {
    Write-Host "Error: android directory not found!" -ForegroundColor Red
    Write-Host "Please run: npx cap add android" -ForegroundColor Yellow
    exit 1
}

Write-Host "Building Debug APK..." -ForegroundColor Green
Write-Host ""

Push-Location android
& .\gradlew.bat assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Build successful!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "APK Location:" -ForegroundColor Cyan
Write-Host "android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Connect your Android device via USB" -ForegroundColor White
Write-Host "2. Enable USB Debugging on device" -ForegroundColor White
Write-Host "3. Run: adb install -r android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
Write-Host ""
