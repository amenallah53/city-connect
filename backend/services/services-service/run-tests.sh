#!/bin/bash
# Script pour démarrer le service et les tests

echo "=========================================="
echo "Starting Services-Service Tests"
echo "=========================================="
echo ""

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Démarrer le service en arrière-plan
echo "🚀 Starting services-service..."
npm start &
SERVICE_PID=$!

# Attendre que le service démarre
echo "⏳ Waiting for service to start (5 seconds)..."
sleep 5

# Vérifier que le service est en cours d'exécution
if ! kill -0 $SERVICE_PID 2>/dev/null; then
    echo "❌ Failed to start the service"
    exit 1
fi

echo "✅ Service started (PID: $SERVICE_PID)"
echo ""

# Exécuter les tests
echo "🧪 Running API tests..."
node test-api.js
TEST_RESULT=$?

# Arrêter le service
echo ""
echo "🛑 Stopping service..."
kill $SERVICE_PID 2>/dev/null

echo ""
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
