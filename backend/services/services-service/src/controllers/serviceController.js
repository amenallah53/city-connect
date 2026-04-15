/**
 * CONTRÔLEUR DES SERVICES
 * 
 * Contient la logique métier pour gérer les services.
 * Adapté au schéma: city-connect-db-script-1.sql
 * Chaque fonction fait appel à PostgreSQL et retourne les résultats.
 */

const pool = require('../config/db');

// ===== RÉCUPÉRER TOUS LES SERVICES =====
/**
 * GET /api/services
 * Récupère tous les services disponibles avec pagination
 */
exports.getAllServices = async (req, res) => {
  try {
    // Paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Requête SQL pour récupérer les services
    const serviceName = req.query.search ? `%${req.query.search}%` : '%';
    
    const query = `
      SELECT 
        id,
        name,
        type,
        description,
        badges,
        requirements,
        municipalite_id
      FROM service
      WHERE name ILIKE $1
      ORDER BY name ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [serviceName, limit, offset]);

    // Transform database fields to match frontend model
    const transformedData = result.rows.map(service => ({
      id: service.id,
      name: service.name,
      type: service.type,
      description: service.description,
      badges: service.badges ? (Array.isArray(service.badges) ? service.badges : service.badges.split(',').map(b => b.trim())) : [],
      requirements: Array.isArray(service.requirements) ? service.requirements : (service.requirements ? service.requirements.split(',').map(r => r.trim()) : []),
      municipalite_id: service.municipalite_id
    }));

    // Compter le nombre total de services pour la pagination
    const countQuery = `SELECT COUNT(*) as total FROM service WHERE name ILIKE $1`;
    const countResult = await pool.query(countQuery, [serviceName]);

    res.status(200).json({
      success: true,
      data: transformedData,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER UN SERVICE PAR ID =====
/**
 * GET /api/services/:id
 * Récupère les détails d'un service spécifique
 */
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        s.id,
        s.name,
        s.type,
        s.description,
        s.badges,
        s.requirements,
        s.municipalite_id,
        m.name as municipalite_name
      FROM service s
      LEFT JOIN municipalite m ON s.municipalite_id = m.id
      WHERE s.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    const service = result.rows[0];
    const transformedService = {
      id: service.id,
      name: service.name,
      type: service.type,
      description: service.description,
      badges: service.badges ? (Array.isArray(service.badges) ? service.badges : service.badges.split(',').map(b => b.trim())) : [],
      requirements: Array.isArray(service.requirements) ? service.requirements : (service.requirements ? service.requirements.split(',').map(r => r.trim()) : []),
      municipalite_id: service.municipalite_id,
      municipalite_name: service.municipalite_name
    };

    res.status(200).json({
      success: true,
      data: transformedService
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service',
      message: error.message
    });
  }
};

// ===== CRÉER UN NOUVEAU SERVICE (Admin) =====
/**
 * POST /api/services
 * Crée un nouveau service (requires admin role)
 * Body: { name, type, description, badges, requirements, municipalite_id }
 */
exports.createService = async (req, res) => {
  try {
    const {
      nom,
      name,
      type,
      description,
      badges,
      requirements,
      municipalite_id
    } = req.body;

    // Validation des données requises
    const serviceName = name || nom; // Support both 'name' and 'nom' for backward compatibility
    if (!serviceName || !type) {
      return res.status(400).json({
        success: false,
        error: 'name (or nom) and type are required'
      });
    }

    const query = `
      INSERT INTO service (
        name, type, description, badges, requirements, municipalite_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      RETURNING 
        id, name, type, description, badges, requirements, municipalite_id
    `;

    const values = [
      serviceName, type, description, badges, requirements, municipalite_id
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER LES SERVICES PAR MUNICIPALITÉ =====
/**
 * GET /api/services/municipality/:municipaliteId
 * Récupère tous les services d'une municipalité spécifique
 */
exports.getServicesByMunicipality = async (req, res) => {
  try {
    const { municipaliteId } = req.params;

    const query = `
      SELECT 
        id, name, type, description, badges, requirements, municipalite_id
      FROM service
      WHERE municipalite_id = $1
      ORDER BY name ASC
    `;

    const result = await pool.query(query, [municipaliteId]);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching services by municipality:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER LES SERVICES PAR TYPE =====
/**
 * GET /api/services/type/:type
 * Récupère tous les services d'un type spécifique
 * Note: Le nouveau schéma n'a pas de colonne "category", utiliser "type" à la place
 */
exports.getServicesByCategory = async (req, res) => {
  try {
    const { type } = req.params;

    const query = `
      SELECT 
        id, name, type, description, badges, requirements, municipalite_id
      FROM service
      WHERE type::text ILIKE $1
      ORDER BY name ASC
    `;

    const result = await pool.query(query, [`%${type}%`]);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching services by type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: error.message
    });
  }
};

// ===== METTRE À JOUR UN SERVICE =====
/**
 * PUT /api/services/:id
 * Met à jour un service existant (admin only)
 */
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, name, type, description, badges, requirements, municipalite_id } = req.body;
    const serviceName = name || nom; // Support both 'name' and 'nom' for backward compatibility

    const query = `
      UPDATE service
      SET 
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        description = COALESCE($3, description),
        badges = COALESCE($4, badges),
        requirements = COALESCE($5, requirements),
        municipalite_id = COALESCE($6, municipalite_id)
      WHERE id = $7
      RETURNING id, name, type, description, badges, requirements, municipalite_id
    `;

    const result = await pool.query(query, [
        serviceName, type, description, badges, requirements, municipalite_id, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service',
      message: error.message
    });
  }
};

// ===== SUPPRIMER UN SERVICE =====
/**
 * DELETE /api/services/:id
 * Supprime un service (hard delete)
 */
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM service
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service',
      message: error.message
    });
  }
};
