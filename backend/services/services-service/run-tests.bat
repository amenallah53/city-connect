@echo off
REM Script pour démarrer le service et les tests sous Windows

echo ==========================================
echo Starting Services-Service Tests
echo ==========================================
echo.

REM Vérifier que Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    exit /b 1
)

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Démarrer le service en arrière-plan
echo 🚀 Starting services-service...
start "Services-Service" npm start

REM Attendre que le service démarre
echo ⏳ Waiting for service to start ^(5 seconds^)...
timeout /t 5 /nobreak

REM Vérifier la connexion au service
echo ✅ Service should be running on http://localhost:3004
echo.

REM Exécuter les tests
echo 🧪 Running API tests...
node test-api.js

REM Attendre avant de fermer
echo.
echo Press any key to stop the service and close...
pause
