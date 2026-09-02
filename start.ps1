Write-Host "========================================" -ForegroundColor Green
Write-Host " MyLove - JA-DI Supabase" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host " Project: xsacwgxxoptdrgbbzzib" -ForegroundColor Cyan
Write-Host " URL: http://localhost:8000" -ForegroundColor Yellow
Write-Host " Admin: http://localhost:8000/admin.html (pass: admin123)" -ForegroundColor Yellow
Write-Host " JA-DI: http://localhost:8000/modul/ja-di.html" -ForegroundColor Yellow
Write-Host ""

if (Get-Command node -ErrorAction SilentlyContinue) {
  Write-Host "Menjalankan npx serve ..." -ForegroundColor Green
  npx serve . -l 8000
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Fallback ke python..." -ForegroundColor Yellow
    try { python -m http.server 8000 } catch { py -m http.server 8000 }
  }
} else {
  Write-Host "Node tidak ada, coba python..." -ForegroundColor Yellow
  try { python -m http.server 8000 } catch { py -m http.server 8000 }
}
