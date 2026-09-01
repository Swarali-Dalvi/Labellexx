@echo off
echo ===================================================
echo   LabelLex -- Deploy Production Build to Surge.sh
echo ===================================================
echo.
cd /d "%~dp0"
echo 1. Ensuring SPA routing files (index.html + 200.html)...
copy /Y "dist\index.html" "dist\200.html" >nul
echo.
echo 2. Deploying dist to Surge (Free 24/7 Global CDN)...
echo Enter your email address and a password when prompted:
echo.
call npx surge dist --domain labellex-lmpc-v1.surge.sh
echo.
echo ===================================================
echo Done! Your app is published at:
echo   https://labellex-lmpc-v1.surge.sh
echo ===================================================
pause
