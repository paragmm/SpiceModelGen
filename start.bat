@echo off
echo =======================================================
echo   SPICE Model Generator - Initializing...
echo =======================================================

:: Check if node_modules exists, if not, install dependencies
IF NOT EXIST "node_modules\" (
    echo [INFO] First time setup detected! Installing dependencies...
    call npm install
)

echo [INFO] Starting the local server...
start http://localhost:3000
node server.js
pause
