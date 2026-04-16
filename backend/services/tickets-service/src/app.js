const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'city-connect-secure-secret-2024';

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error (Tickets):', err.message);
      return res.status(403).json({ error: 'Token is invalid or expired', message: err.message });
    }
    req.user = user;
    next();
  });
};

/**
 * @api {get} /api/tickets Get all tickets
 */
app.get('/api/tickets', async (req, res) => {
  try {
    const { city, category, status, page = 1, limit = 10 } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedOffset = (parseInt(page ?? '1') - 1) * parsedLimit;

    let countQuery = `
      SELECT count(*) as total
      FROM plainte p
      LEFT JOIN plainte_categorie pc ON p.categorie_id = pc.id
      WHERE 1=1
    `;
    let query = `
      SELECT p.*, p.location as location, pc.type as category, pm.file_url as image
      FROM plainte p
      LEFT JOIN plainte_categorie pc ON p.categorie_id = pc.id
      LEFT JOIN plainte_media pm ON p.id = pm.plainte_id
      WHERE 1=1
    `;
    const values = [];

    if (city) {
      values.push(city);
      query += ` AND p.location = $${values.length}`;
      countQuery += ` AND p.location = $${values.length}`;
    }
    if (category) {
      values.push(category);
      query += ` AND pc.type = $${values.length}`;
      countQuery += ` AND pc.type = $${values.length}`;
    }
    if (status) {
      values.push(status);
      query += ` AND p.status = $${values.length}`;
      countQuery += ` AND p.status = $${values.length}`;
    }

    const countResult = await pool.query(countQuery, values);
    const totalRecords = parseInt(countResult.rows[0].total);

    query += ` ORDER BY p.date_creation DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    const paginationValues = [...values, parsedLimit, parsedOffset];

    const result = await pool.query(query, paginationValues);
    res.json({
      data: result.rows,
      total: totalRecords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @api {post} /api/tickets Create a new ticket
 */
app.post('/api/tickets', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, description, city, category, image } = req.body;
    const userId = req.user.userId; // Extracted from JWT

    await client.query('BEGIN');

    // 1. Get or find category ID
    const catResult = await client.query('SELECT id FROM plainte_categorie WHERE type = $1', [category]);
    let categoryId = catResult.rows.length > 0 ? catResult.rows[0].id : null;

    // 2. Insert into plainte
    const ticketResult = await client.query(
      'INSERT INTO plainte (title, description, location, user_id, categorie_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title || 'Untitled Report', description, city, userId, categoryId]
    );
    const ticket = ticketResult.rows[0];

    // 3. Insert media if image URL is provided
    if (image) {
      await client.query(
        'INSERT INTO plainte_media (file_url, file_type, plainte_id) VALUES ($1, $2, $3)',
        [image, 'image', ticket.id]
      );
      ticket.image = image;
    }

    await client.query('COMMIT');
    res.status(201).json(ticket);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create ticket' });
  } finally {
    client.release();
  }
});

/**
 * @api {get} /api/tickets/search Search tickets
 */
app.get('/api/tickets/search', async (req, res) => {
  try {
    const { q } = req.query;
    const result = await pool.query(
      'SELECT * FROM plainte WHERE description ILIKE $1 OR location ILIKE $1',
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * @api {patch} /api/tickets/:id/status Update ticket status
 */
app.patch('/api/tickets/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE plainte SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Status update failed' });
  }
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Tickets service running on port ${PORT} 🎫`);
});
