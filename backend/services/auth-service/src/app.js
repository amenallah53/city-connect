const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'city-connect-secure-secret-2024';

/**
 * @api {post} /api/auth/login Mock Login
 * Returns a real JWT for use in development
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Simple mock check
  if (email && password) {
    // Generate a real JWT
    const token = jwt.sign(
      { id: 'dd88d885-bc01-4337-80f6-6a5e6cb5ebe9', email: email, role: 'citoyen' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({ token, user: { email, role: 'citoyen' } });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT} 🔑`);
});
