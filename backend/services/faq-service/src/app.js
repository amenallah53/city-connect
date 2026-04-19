const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be set in .env');
const jwtSecret = process.env.JWT_SECRET;

const app = express();
const port = process.env.PORT || 5007;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());

app.use(express.json());

function authenticateToken(req, res, next) {

  if (req.method === 'OPTIONS') {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


app.get('/unanswered', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM faqs WHERE answer IS NULL ORDER BY id DESC;'
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/answered', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM faqs WHERE answer IS NOT NULL ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }
    const query = 'INSERT INTO faqs (question, answer) VALUES ($1, $2)';
    const result = await pool.query(query, [question, answer || null]);
    res.status(201).json({ message: 'FAQ added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    if (!answer || answer.trim() === '') {
      return res.status(400).json({ error: 'Answer is required' });
    }
    const query = 'UPDATE faqs SET answer = $1 WHERE id = $2 returning  *';
    const result = await pool.query(query, [answer, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    else {
      res.json({ message: 'FAQ updated successfully', faq: result.rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/', (req, res) => {
  res.send('FAQ Service is running 🚀');
});


app.listen(port, () => {
  console.log(`FAQ Service running on port ${port} `);
});