/**
 * SERVICES-SERVICE - Backend API
 * 
 * Ce fichier est le point d'entrée principal de l'application.
 * Il configure Express, les middlewares et démarre le serveur.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const serviceRoutes = require('./routes/services');
const demandeServiceRoutes = require('./routes/demandeService');

const app = express();
const PORT = process.env.PORT || 5006;

// ===== MIDDLEWARES =====
// CORS: Permet aux requêtes du frontend d'accéder à ce backend
app.use(cors());

// Body Parser: Convertit les données JSON en objets JavaScript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
// Préfixe: /api/services pour toutes les routes
app.use('/api/services', serviceRoutes);
app.use('/api/service-requests', demandeServiceRoutes);

// ===== ROUTE DE TEST =====
app.get('/health', (req, res) => {
  res.json({
    status: 'Services-Service is running',
    timestamp: new Date().toISOString()
  });
});

// ===== GESTION DES ERREURS =====
// Si aucune route ne match, retourner 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ===== DÉMARRAGE DU SERVEUR =====
const server = app.listen(PORT, () => {
  console.log(`✅ Services-Service running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api/services`);
});

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop the existing process and retry.`);
    return;
  }

  console.error('❌ Failed to start Services-Service:', error);
});

server.on('close', () => {
  console.warn('⚠️ Services-Service server has closed.');
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down Services-Service...`);
  server.close(() => {
    console.log('✅ Services-Service stopped cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
