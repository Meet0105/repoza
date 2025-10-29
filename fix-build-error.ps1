# Fix for Next.js build error on Windows
# This script cleans up build artifacts and restarts the dev server

Write-Host "🔧 Fixing Next.js build error..." -ForegroundColor Cyan

# Step 1: Stop all Node processes
Write-Host "1. Stopping Node processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Delete .next folder
Write-Host "2. Cleaning .next folder..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   ✓ Deleted .next folder" -ForegroundColor Green
} else {
    Write-Host "   - No .next folder found" -ForegroundColor Gray
}

# Step 3: Delete node_modules/.cache if exists
Write-Host "3. Cleaning cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
    Write-Host "   ✓ Deleted cache" -ForegroundColor Green
} else {
    Write-Host "   - No cache found" -ForegroundColor Gray
}

# Step 4: Create .next directory with proper permissions
Write-Host "4. Creating .next directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path ".next" -Force | Out-Null
Write-Host "   ✓ Created .next directory" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Fix complete! Now run: npm run dev" -ForegroundColor Green
Write-Host ""
