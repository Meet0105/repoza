@echo off
echo.
echo ========================================
echo   REPOZA - Quick Fix Script
echo ========================================
echo.

echo [Step 1/4] Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo       Done!

echo [Step 2/4] Cleaning build folders...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo       Done!

echo [Step 3/4] Creating fresh directories...
mkdir .next >nul 2>&1
echo       Done!

echo [Step 4/4] Starting dev server...
echo.
echo ========================================
echo   Server starting...
echo ========================================
echo.
npm run dev
