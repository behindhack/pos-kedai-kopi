# Build Release APK Script for Kedai Kopi POS (PowerShell)
# Usage: .\build-release.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kedai Kopi POS - Build Release APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if android directory exists
if (-not (Test-Path "android")) {
    Write-Host "Error: android directory not found!" -ForegroundColor Red
    Write-Host "Please run: npx cap add android" -ForegroundColor Yellow
    exit 1
}

# Check if keystore exists
if (-not (Test-Path "kedai-kopi.jks")) {
    Write-Host "Error: Keystore file 'kedai-kopi.jks' not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create keystore first:" -ForegroundColor Yellow
    Write-Host 'keytool -genkey -v -keystore kedai-kopi.jks -keyalg RSA -keysize 2048 -validity 10000 -alias kedai-kopi' -ForegroundColor White
    exit 1
}

Write-Host "Keystore file found: kedai-kopi.jks" -ForegroundColor Green
Write-Host ""
$keystorePassword = Read-Host "Enter keystore password" -AsSecureString
$keystorePasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($keystorePassword))

Write-Host "Building Release APK..." -ForegroundColor Green
Write-Host ""

Push-Location android
& .\gradlew.bat assembleRelease `
    -Pandroid.injected.signing.store.file="../kedai-kopi.jks" `
    -Pandroid.injected.signing.store.password="$keystorePasswordPlain" `
    -Pandroid.injected.signing.key.alias="kedai-kopi" `
    -Pandroid.injected.signing.key.password="$keystorePasswordPlain"

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
Write-Host "android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now:" -ForegroundColor Cyan
Write-Host "1. Upload to Google Play Store" -ForegroundColor White
Write-Host "2. Share APK file directly" -ForegroundColor White
Write-Host "3. Install on device: adb install android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor White
Write-Host ""
