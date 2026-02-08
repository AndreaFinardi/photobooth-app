# Photobooth App Setup Script for Windows PowerShell
# Run as Administrator

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       PHOTOBOOTH APP INSTALLER" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Choose LTS version" -ForegroundColor Yellow
    exit
}
Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Create folder structure
Write-Host "[2/5] Creating folder structure..." -ForegroundColor Yellow
$folders = @(
    "photobooth-app",
    "photobooth-app\backend",
    "photobooth-app\backend\src",
    "photobooth-app\backend\src\config",
    "photobooth-app\backend\src\controllers",
    "photobooth-app\backend\src\models",
    "photobooth-app\backend\src\routes",
    "photobooth-app\backend\src\middleware",
    "photobooth-app\backend\src\services",
    "photobooth-app\frontend",
    "photobooth-app\frontend\public",
    "photobooth-app\frontend\src",
    "photobooth-app\frontend\src\components",
    "photobooth-app\frontend\src\components\Auth",
    "photobooth-app\frontend\src\components\Room",
    "photobooth-app\frontend\src\components\Camera",
    "photobooth-app\frontend\src\components\Library",
    "photobooth-app\frontend\src\pages",
    "photobooth-app\frontend\src\utils",
    "photobooth-app\database",
    "photobooth-app\scripts"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
    }
}
Write-Host "✅ Folder structure created" -ForegroundColor Green
Write-Host ""

# Create configuration files
Write-Host "[3/5] Creating configuration files..." -ForegroundColor Yellow

# Create README
$readmeContent = @"
# Photobooth App - Installation Guide

## Prerequisites
1. Node.js 18+
2. PostgreSQL (pgAdmin on port 5433)
3. NPM (included with Node.js)

## Installation Steps

### 1. PostgreSQL Database
- Open pgAdmin (localhost:5433)
- Create new database: photobooth_app
- Run database\init.sql

### 2. Backend
```bash
cd backend
npm install
npm run dev