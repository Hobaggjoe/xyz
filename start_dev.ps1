#!/usr/bin/env pwsh
Write-Host "Starting Audio to Guitar Tab Converter Development Servers..." -ForegroundColor Green

Write-Host "`nInstalling/Updating Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "`nStarting Backend Server..." -ForegroundColor Yellow
Start-Process -FilePath "python" -ArgumentList "main.py" -WindowStyle Normal

Write-Host "`nInstalling/Updating Frontend Dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install

Write-Host "`nStarting Frontend Development Server..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal

Write-Host "`n===================================" -ForegroundColor Green
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Green

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")