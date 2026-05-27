@echo off
REM Build Release APK Script for Kedai Kopi POS
REM Usage: build-release.bat

echo.
echo ========================================
echo Kedai Kopi POS - Build Release APK
echo ========================================
echo.

REM Check if android directory exists
if not exist "android" (
    echo Error: android directory not found!
    echo Please run: npx cap add android
    exit /b 1
)

REM Check if keystore exists
if not exist "kedai-kopi.jks" (
    echo Error: Keystore file 'kedai-kopi.jks' not found!
    echo.
    echo Please create keystore first:
    echo keytool -genkey -v -keystore kedai-kopi.jks -keyalg RSA -keysize 2048 -validity 10000 -alias kedai-kopi
    exit /b 1
)

echo Keystore file found: kedai-kopi.jks
echo.
set /p KEYSTORE_PASSWORD="Enter keystore password: "

echo Building Release APK...
echo.

cd android
call gradlew.bat assembleRelease ^
    -Pandroid.injected.signing.store.file=../kedai-kopi.jks ^
    -Pandroid.injected.signing.store.password=%KEYSTORE_PASSWORD% ^
    -Pandroid.injected.signing.key.alias=kedai-kopi ^
    -Pandroid.injected.signing.key.password=%KEYSTORE_PASSWORD%

if errorlevel 1 (
    echo.
    echo Build failed!
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Build successful!
echo ========================================
echo.
echo APK Location:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo You can now:
echo 1. Upload to Google Play Store
echo 2. Share APK file directly
echo 3. Install on device: adb install android\app\build\outputs\apk\release\app-release.apk
echo.
pause
