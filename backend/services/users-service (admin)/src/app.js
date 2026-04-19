const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = parseInt(process.env.PORT, 10) || 5009;

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be set in .env');
const jwtSecret = process.env.JWT_SECRET;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token not provided' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}

app.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { first_name, last_name, email, cin, role, status } = req.body;

    // build dynamic query — only update fields that were sent
    const fields = [];
    const values = [];
    let i = 1;

    if (first_name !== undefined) { fields.push(`first_name = $${i++}`); values.push(first_name); }
    if (last_name !== undefined)  { fields.push(`last_name = $${i++}`);  values.push(last_name); }
    if (email !== undefined)      { fields.push(`email = $${i++}`);      values.push(email); }
    if (cin !== undefined)        { fields.push(`cin = $${i++}`);        values.push(cin); }
    if (role !== undefined)       { fields.push(`role = $${i++}`);       values.push(role); }
    if (status !== undefined)     { fields.push(`status = $${i++}`);     values.push(status); }
    

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, email, first_name as "firstName", last_name as "lastName", cin, role, status`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { first_name, last_name, email, cin, role, status } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name and email are required' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, cin, role, status, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name as "firstName", last_name as "lastName", cin, role, status`,
      [first_name, last_name, email, cin, role || 'citoyen', status || 'pending', 'changeme']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users with filters
app.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = 'SELECT id, email, first_name as "firstName", last_name as "lastName", cin, role, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) { params.push(role); query += ` AND role = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }  // ← fix: no boolean conversion

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user
app.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name as "firstName", last_name as "lastName", cin, role, status, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name as "firstName", last_name as "lastName", cin, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Users service is running' });
});

app.listen(port, () => {
  console.log(`Users service running on port ${port}`);
});