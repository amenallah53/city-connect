const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = 5002;
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be set in .env');
const jwtSecret = process.env.JWT_SECRET;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

app.use(cors());
app.use(express.json());


function generateToken(user) {
  return jwt.sign(
    {userId: user.id,email: user.email,},jwtSecret);
}

function authenticateToken(req, res, next) {
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

app.post('/register', async (req, res) => {   //register , the admin uses it to confirm the registration of a user
  try {
    const { email, password, firstname, lastname,CIN } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE cin = $1 or email = $2', [CIN, email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'CIN or email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, firstname, lastname, cin) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, firstname, lastname, cin',
      [email, hashedPassword, firstname, lastname, CIN]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      token,
      user,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {  //login
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT id, email, password, name FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.status(200).json({
      token: token,
      user: {id: user.id,email: user.email,name: user.name}
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/me', authenticateToken, async (req, res) => {  //profile
  try {
    const result = await pool.query('SELECT email, firstname, lastname, cin FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/me/password', authenticateToken, async (req, res) => { //change password
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.userId]);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/forgot-password', async (req, res) => {     //email sending link reset password
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await pool.query('SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    const user = result.rows[0];

    // Don't reveal whether the email exists or not
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '15m' });
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Password Reset - City Connect',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to set a new password. This link expires in 15 minutes.</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: err.message });
  }
});


app.get('/', (req, res) => {
  res.status(200).json({ message: 'Auth Service is running' });
});

app.listen(5002, () => {
  console.log(`Auth service running on port ${port}`);
});