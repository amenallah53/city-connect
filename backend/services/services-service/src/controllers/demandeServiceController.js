/**
 * CONTRÔLEUR DES DEMANDES DE SERVICES
 * 
 * Gère les requêtes des utilisateurs pour les services.
 * Adapté au nouveau schéma UUID: table demande_service
 */

const pool = require('../config/db');

// ===== SOUMETTRE UNE DEMANDE DE SERVICE =====
/**
 * POST /api/service-requests
 * L'utilisateur demande un service
 * Body: { cin, service_id, description }
 */
exports.createServiceRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      cin,
      service_id,
      description,
      telephone,
      phone,
      attachments,
      attachments_name,
      attachment_types
    } = req.body;

    // Validation
    if (!cin || !service_id) {
      return res.status(400).json({
        success: false,
        error: 'cin and service_id are required'
      });
    }

    // Vérifier que l'utilisateur existe et récupérer son UUID
    const userCheck = await client.query(
      `SELECT id, first_name, last_name, email, adresse, telephone
       FROM users
       WHERE cin = $1`,
      [cin]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    const user = userCheck.rows[0];
    const userId = user.id;
    const requestPhone = (telephone || phone || '').toString().trim();
    const resolvedTelephone = requestPhone || user.telephone || null;

    // Vérifier que le service existe
    const serviceCheck = await client.query(
      'SELECT id FROM service WHERE id = $1',
      [service_id]
    );
    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    const attachmentUrls = Array.isArray(attachments)
      ? attachments.map((value) => String(value).trim()).filter(Boolean)
      : [];

    const attachmentNames = Array.isArray(attachments_name)
      ? attachments_name.map((value) => String(value).trim())
      : [];

    const attachmentTypes = Array.isArray(attachment_types)
      ? attachment_types.map((value) => String(value).trim())
      : [];

    const resolveFileType = (mime, url) => {
      const mimeValue = String(mime || '').toLowerCase();
      if (mimeValue.startsWith('image/')) return 'image';
      if (mimeValue.startsWith('video/')) return 'video';

      const cleanUrl = String(url || '').toLowerCase().split('?')[0];
      if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(cleanUrl)) return 'image';
      if (/\.(mp4|mov|avi|webm|mkv)$/.test(cleanUrl)) return 'video';
      return 'document';
    };

    await client.query('BEGIN');

    // Créer la demande
    const query = `
      INSERT INTO demande_service (
        user_id,
        service_id,
        status,
        description,
        cin,
        first_name,
        last_name,
        email,
        addresse,
        telephone,
        attachments_name,
        attachments
      ) VALUES (
        $1, $2, 'pending', $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING 
        id,
        user_id,
        service_id,
        status,
        description,
        cin,
        first_name,
        last_name,
        email,
        addresse,
        telephone,
        attachments_name,
        attachments,
        submission_date
    `;

    const result = await client.query(query, [
      userId, 
      service_id, 
      description || '',
      cin,
      user.first_name || null,
      user.last_name || null,
      user.email || null,
      user.addresse || null,
      resolvedTelephone,
      attachmentNames,
      attachmentUrls
    ]);

    const createdRequest = result.rows[0];

    if (attachmentUrls.length > 0) {
      for (let index = 0; index < attachmentUrls.length; index++) {
        const url = attachmentUrls[index];
        const mime = attachmentTypes[index] || null;
        const fileType = resolveFileType(mime, url);

        await client.query(
          `
            INSERT INTO demande_service_document (file_url, file_type, demande_id)
            VALUES ($1, $2, $3)
          `,
          [url, fileType, createdRequest.id]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: createdRequest
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      // ignore rollback errors
    }
    console.error('Error creating service request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service request',
      message: error.message
    });
  } finally {
    client.release();
  }
};

// ===== RÉCUPÉRER LES DEMANDES DE L'UTILISATEUR =====
/**
 * GET /api/service-requests/user/:cin
 * Récupère toutes les demandes de service d'un utilisateur
 */
exports.getUserServiceRequests = async (req, res) => {
  try {
    const { cin } = req.params;

    // Get user by CIN to find UUID
    const userQuery = 'SELECT id FROM users WHERE cin = $1';
    const userResult = await pool.query(userQuery, [cin]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userId = userResult.rows[0].id;

    const query = `
      SELECT 
        ds.id,
        ds.user_id,
        ds.cin,
        ds.service_id,
        s.name as service_name,
        s.type,
        ds.status,
        ds.description,
        ds.attachments_name,
        ds.attachments,
        ds.submission_date
      FROM demande_service ds
      LEFT JOIN service s ON ds.service_id = s.id
      WHERE ds.user_id = $1
      ORDER BY ds.submission_date DESC
    `;

    const result = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching user service requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service requests',
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER UNE DEMANDE PAR ID =====
/**
 * GET /api/service-requests/:id
 * Récupère les détails d'une demande de service
 */
exports.getServiceRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        ds.id,
        ds.user_id,
        ds.cin,
        ds.service_id,
        s.name as service_name,
        s.description as service_description,
        s.type,
        ds.status,
        ds.description,
        ds.attachments_name,
        ds.attachments,
        ds.submission_date,
        COALESCE(ds.first_name, u.first_name) as first_name,
        COALESCE(ds.last_name, u.last_name) as last_name,
        COALESCE(ds.email, u.email) as email,
        COALESCE(ds.telephone, u.telephone) as telephone
      FROM demande_service ds
      LEFT JOIN service s ON ds.service_id = s.id
      LEFT JOIN users u ON ds.user_id = u.id
      WHERE ds.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service request',
      message: error.message
    });
  }
};

// ===== METTRE À JOUR LE STATUT D'UNE DEMANDE =====
/**
 * PUT /api/service-requests/:id/status
 * Met à jour le statut d'une demande
 */
exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Map English status values to French (support both for backward compatibility)
    const statusMap = {
      // English to French
      'pending': 'pending',
      'in_progress': 'in_progress',
      'approved': 'approved',
      'rejected': 'rejected',
      'completed': 'completed',
      // Also accept French and map to English
      'en_attente': 'pending',
      'en_cours': 'in_progress',
      'approuvee': 'approved',
      'rejetee': 'rejected',
      'terminee': 'completed'
    };

    const dbStatus = statusMap[status];
    if (!dbStatus) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed values: pending, in_progress, approved, rejected, completed`
      });
    }

    const query = `
      UPDATE demande_service
      SET status = $1
      WHERE id = $2
      RETURNING id, user_id, service_id, status, submission_date
    `;

    const result = await pool.query(query, [dbStatus, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service request status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating service request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service request',
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER TOUTES LES DEMANDES (Admin) =====
/**
 * GET /api/service-requests
 * Admin: Récupère toutes les demandes filtrées par statut
 * Query params: ?status=en_attente&page=1&limit=10
 */
exports.getAllServiceRequests = async (req, res) => {
  try {
    const requestedStatus = (req.query.status || 'all').toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Valid status values (English status as stored in database)
    const validStatuses = ['pending', 'in_progress', 'approved', 'rejected', 'completed'];
    if (requestedStatus !== 'all' && !validStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed values: all, pending, in_progress, approved, rejected, completed`
      });
    }

    const hasStatusFilter = requestedStatus !== 'all';

    // Récupérer les requêtes de service
    const baseQuery = `
      SELECT 
        ds.id,
        ds.user_id,
        ds.cin,
        COALESCE(ds.first_name, u.first_name) as first_name,
        COALESCE(ds.last_name, u.last_name) as last_name,
        COALESCE(ds.email, u.email) as email,
        COALESCE(ds.telephone, u.telephone) as telephone,
        s.name as service_name,
        s.type,
        ds.status,
        ds.description,
        ds.attachments_name,
        ds.attachments,
        ds.submission_date
      FROM demande_service ds
      LEFT JOIN users u ON ds.user_id = u.id
      LEFT JOIN service s ON ds.service_id = s.id
      ORDER BY ds.submission_date DESC
      LIMIT $${hasStatusFilter ? '2' : '1'} OFFSET $${hasStatusFilter ? '3' : '2'}
    `;

    const query = hasStatusFilter
      ? `${baseQuery.replace('ORDER BY ds.submission_date DESC', 'WHERE ds.status = $1\n      ORDER BY ds.submission_date DESC')}`
      : baseQuery;

    const queryParams = hasStatusFilter
      ? [requestedStatus, limit, offset]
      : [limit, offset];

    const result = await pool.query(query, queryParams);

    // Récupérer les documents pour chaque requête
    const requestsWithDocuments = await Promise.all(
      result.rows.map(async (request) => {
        let attachments = [];

        if (Array.isArray(request.attachments) && request.attachments.length > 0) {
          attachments = request.attachments.map((url, idx) => {
            const nameFromArray = Array.isArray(request.attachments_name) ? request.attachments_name[idx] : null;
            const fallbackName = url ? String(url).split('/').pop() : null;
            const fileName = nameFromArray || fallbackName || `Document_${idx + 1}`;
            const lowered = String(fileName).toLowerCase();
            const type = /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(lowered)
              ? 'image'
              : /\.(mp4|mov|avi|webm|mkv)$/.test(lowered)
                ? 'video'
                : 'document';

            return {
              id: idx + 1,
              name: fileName,
              type,
              size: '',
              url,
              bgColor: ['#FEE2E2', '#E0E7FF', '#DBEAFE', '#F3E8FF', '#FCE7F3', '#FEF3C7'][idx % 6]
            };
          });
        }
        
        try {
          if (!attachments.length) {
            const docQuery = `
              SELECT 
                id,
                file_url,
                file_type
              FROM demande_service_document
              WHERE demande_id = $1
              ORDER BY id ASC
            `;
            const docResult = await pool.query(docQuery, [request.id]);

            attachments = docResult.rows.map((doc, idx) => {
              const fallbackName = doc.file_url ? String(doc.file_url).split('/').pop() : null;
              return {
                id: idx + 1,
                name: fallbackName || `Document_${doc.id}`,
                type: doc.file_type || 'document',
                size: '',
                url: doc.file_url,
                bgColor: ['#FEE2E2', '#E0E7FF', '#DBEAFE', '#F3E8FF', '#FCE7F3', '#FEF3C7'][idx % 6]
              };
            });
          }
        } catch (docError) {
          // Document table doesn't exist or query failed - just continue with empty attachments
          if (!attachments.length) {
            attachments = [];
          }
        }
        
        return {
          ...request,
          fullname: `${request.first_name} ${request.last_name}`,
          attachments: attachments
        };
      })
    );

    // Compter le total
    const countQuery = hasStatusFilter
      ? 'SELECT COUNT(*) as total FROM demande_service WHERE status = $1'
      : 'SELECT COUNT(*) as total FROM demande_service';
    const countResult = hasStatusFilter
      ? await pool.query(countQuery, [requestedStatus])
      : await pool.query(countQuery);

    res.status(200).json({
      success: true,
      data: requestsWithDocuments,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service requests',
      message: error.message
    });
  }
};
