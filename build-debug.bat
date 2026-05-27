@echo off
REM Build Debug APK Script for Kedai Kopi POS
REM Usage: build-debug.bat

echo.
echo ========================================
echo Kedai Kopi POS - Build Debug APK
echo ========================================
echo.

REM Check if android directory exists
if not exist "android" (
    echo Error: android directory not found!
    echo Please run: npx cap add android
    exit /b 1
)

echo Building Debug APK...
echo.

cd android
call gradlew.bat assembleDebug
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
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Next steps:
echo 1. Connect your Android device via USB
echo 2. Enable USB Debugging on device
echo 3. Run: adb install -r android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
