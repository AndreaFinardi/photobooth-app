# start.ps1 - PowerShell script per avviare tutto
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "🚀 AVVIO PHOTOBOOTH APP" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Verifica Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js non trovato!" -ForegroundColor Red
    Write-Host "Installa da: https://nodejs.org/" -ForegroundColor Yellow
    exit
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Verifica struttura cartelle
if (-not (Test-Path "backend\package.json")) {
    Write-Host "❌ Struttura cartelle errata" -ForegroundColor Red
    Write-Host "Assicurati che backend/ e frontend/ esistano" -ForegroundColor Yellow
    exit
}

# Avvia backend
Write-Host ""
Write-Host "[1/2] Avvio Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Avvia frontend
Write-Host "[2/2] Avvio Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Applicazione avviata!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "⚙️  Backend:  http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Premi un tasto per continuare..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")