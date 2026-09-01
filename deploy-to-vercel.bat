@echo off
echo ===================================================
echo   LabelLex -- Deploy Production Build to Vercel
echo ===================================================
echo.
cd /d "%~dp0"
echo 1. Building production SPA bundle...
call npm run build
echo.
echo 2. Deploying to Vercel (Free 24/7 Global Edge CDN)...
echo Follow the interactive prompts to link your Vercel account.
echo.
call npx vercel --prod
echo.
echo ===================================================
echo Done! Your app is permanently live on Vercel!
echo ===================================================
pause
