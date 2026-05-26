@echo off
setlocal

cd /d "%~dp0apps\web"

if not exist node_modules (
  echo Installing dependencies...
  call "C:\Program Files\nodejs\npm.cmd" install
  if errorlevel 1 (
    echo.
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Starting Talent Match...
echo.
echo Open http://127.0.0.1:5173/ in your browser.
echo Keep this window open while using the website.
echo.

call "C:\Program Files\nodejs\npm.cmd" run dev

pause
