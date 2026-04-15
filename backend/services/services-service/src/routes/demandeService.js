/**
 * ROUTES DES DEMANDES DE SERVICES
 * 
 * Définit les URL endpoints pour gérer les demandes de services.
 * Gère le cycle de vie: soumission -> approbation -> complétion
 */

const express = require('express');
const router = express.Router();
const demandeServiceController = require('../controllers/demandeServiceController');

// ===== IMPORTANT: Route Order Matters in Express =====
// More specific routes must come BEFORE generic ones
// Routes are matched in order, so /admin/list must come before /:id

// ===== ADMIN ROUTES (Specific first) =====
// GET /api/service-requests - Récupérer toutes les demandes (admin)
// Query params: ?status=pending&page=1&limit=10
router.get('/', demandeServiceController.getAllServiceRequests);

// ===== PUBLIQUES ROUTES (More specific) =====
// GET /api/service-requests/user/:cin - Récupérer mes demandes
router.get('/user/:cin', demandeServiceController.getUserServiceRequests);

// PUT /api/service-requests/:id/status - Mettre à jour le statut
router.put('/:id/status', demandeServiceController.updateServiceRequestStatus);

// ===== GENERIC ROUTES (Less specific, come last) =====
// POST /api/service-requests - Soumettre une nouvelle demande
router.post('/', demandeServiceController.createServiceRequest);

// GET /api/service-requests/:id - Récupérer les détails d'une demande
router.get('/:id', demandeServiceController.getServiceRequestById);

module.exports = router;
