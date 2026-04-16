/**
 * ROUTES DES SERVICES
 * 
 * Définit les URL endpoints pour gérer les services.
 * Adapté au schéma: city-connect-db-script-1.sql
 * Chaque route appelle une fonction du contrôleur.
 */

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// ===== ROUTES PUBLIQUES =====

// GET /api/services - Récupérer tous les services
router.get('/', serviceController.getAllServices);

// GET /api/services/:id - Récupérer un service par ID
router.get('/:id', serviceController.getServiceById);

// GET /api/services/municipality/:municipaliteId - Services par municipalité
router.get('/municipality/:municipaliteId', serviceController.getServicesByMunicipality);

// GET /api/services/type/:type - Services par type
router.get('/type/:type', serviceController.getServicesByCategory);

// ===== ROUTES ADMIN =====

// POST /api/services - Créer un nouveau service
// Require: admin role
router.post('/', serviceController.createService);

// PUT /api/services/:id - Mettre à jour un service
// Require: admin role
router.put('/:id', serviceController.updateService);

// DELETE /api/services/:id - Supprimer un service
// Require: admin role
router.delete('/:id', serviceController.deleteService);

module.exports = router;
