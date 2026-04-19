const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = parseInt(process.env.PORT, 10) || 5003;

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

app.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name AS "firstName", last_name AS "lastName", cin FROM users WHERE id = $1',
      [req.user.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/edit-profile', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, email, newPassword, confirmPassword } = req.body;

    if (!first_name && !last_name && !email && !newPassword) {
      return res.status(400).json({ error: 'At least one field is required' });
    }

    const result = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
      [req.user.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
        [email, req.user.userId]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email is already taken' });
      }
    }

    let hashedPassword = null;
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const updated = await pool.query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name  = COALESCE($2, last_name),
        email      = COALESCE($3, email),
        password   = COALESCE($4, password)
       WHERE id = $5
       RETURNING id, email, first_name AS "firstName", last_name AS "lastName"`,
      [first_name || null, last_name || null, email || null, hashedPassword, req.user.userId]
    );

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updated.rows[0],
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users with filters
app.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { role, status } = req.query;

    let query = 'SELECT id, email, first_name, last_name, cin, role, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    if (status !== undefined) {
      params.push(status === 'true');
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a user
app.delete('/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate a user
app.patch('/users/:id/validate', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET status = TRUE WHERE id = $1 RETURNING id, email, first_name, last_name, status',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User validated successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Validate user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Users service is running' });
});

app.listen(port, () => {
  console.log(`Users service running on port ${port}`);
});