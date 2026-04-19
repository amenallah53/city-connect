const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5013;
const JWT_SECRET = process.env.JWT_SECRET || 'city-connect-secure-secret-2024';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());
app.use(express.json());

// Auth Middleware (matching tickets-service style)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error (Schedules):', err.message);
      return res.status(403).json({ error: 'Token is invalid or expired', message: err.message });
    }
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Routes (AUTH DISABLED AS REQUESTED)
app.get('/api/schedules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM horaire_service ORDER BY name ASC');
    res.json(result.rows.map(row => ({
      ...row,
      heureDeb: row.heure_deb,
      heureFin: row.heure_fin,
      municipaliteId: row.municipalite_id
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/schedules', async (req, res) => {
  const { type, name, heureDeb, heureFin, days, municipaliteId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO horaire_service (type, name, heure_deb, heure_fin, days, municipalite_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [type, name, heureDeb, heureFin, days, municipaliteId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  const { type, name, heureDeb, heureFin, days, municipaliteId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE horaire_service SET type = $1, name = $2, heure_deb = $3, heure_fin = $4, days = $5, municipalite_id = $6 WHERE id = $7 RETURNING *',
      [type, name, heureDeb, heureFin, days, municipaliteId, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM horaire_service WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Schedules Service running on port ${port} 🕒`);
});
