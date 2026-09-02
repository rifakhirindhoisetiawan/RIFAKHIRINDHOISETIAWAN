@echo off
title MyLove - Supabase Server
color 0A
echo ========================================
echo  MyLove - JA-DI Supabase
echo ========================================
echo.
echo  Project: xsacwgxxoptdrgbbzzib
echo  Supabase: https://xsacwgxxoptdrgbbzzib.supabase.co
echo.
echo  Menjalankan server di http://localhost:8000
echo.

REM Cek Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo  [ERROR] Node.js tidak ditemukan!
  echo  Install dari https://nodejs.org
  pause
  exit /b
)

REM Cek npx serve, kalau belum ada install dulu
where serve >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo  [INFO] 'serve' belum ada, mencoba pakai npx...
  echo.
  npx serve . -l 8000
) else (
  serve . -l 8000
)

REM Fallback ke python kalau npx gagal
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo  Mencoba python...
  python -m http.server 8000
  if %ERRORLEVEL% NEQ 0 (
    py -m http.server 8000
  )
)

pause
