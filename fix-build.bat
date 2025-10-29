@echo off
echo.
echo ================================
echo   Fixing Next.js Build Error
echo ================================
echo.

echo [1/4] Stopping Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Cleaning .next folder...
if exist .next rmdir /s /q .next
echo       Done!

echo [3/4] Cleaning cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo       Done!

echo [4/4] Creating fresh .next directory...
mkdir .next >nul 2>&1
echo       Done!

echo.
echo ================================
echo   Fix Complete!
echo ================================
echo.
echo Now run: npm run dev
echo.
pause
