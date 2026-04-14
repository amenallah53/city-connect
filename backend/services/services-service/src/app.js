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
const PORT = process.env.PORT || 3004;

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
app.listen(PORT, () => {
  console.log(`✅ Services-Service running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api/services`);
});

module.exports = app;
