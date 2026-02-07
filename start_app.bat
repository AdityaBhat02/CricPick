@echo off
echo ==========================================
echo   CRICKET AUCTION APP - LAN STARTUP
echo ==========================================
echo.
echo [1/3] Installing Dependencies...
call npm install
echo.
echo [2/3] Building Frontend...
call npm run build
echo.
echo [3/3] Starting Server...
echo.
echo App will be available at: http://localhost:3000
echo For LAN access, use your IP address (e.g., http://192.168.1.5:3000)
echo.
npm start
