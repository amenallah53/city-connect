const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
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

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name } = ticket.getPayload();

    // Check if user already exists
    let result = await pool.query(
      'SELECT id, email, first_name, last_name, status FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    let user = result.rows[0];

    if (!user) {
      // First time Google login — create the account
      const inserted = await pool.query(
        `INSERT INTO users (email, first_name, last_name, password, role, status)
         VALUES ($1, $2, $3, $4, 'citoyen', TRUE)
         RETURNING id, email, first_name, last_name, status`,
        [email, given_name, family_name, email] // no real password or CIN
      );
      user = inserted.rows[0];
    }

    if (!user.status) {
      return res.status(403).json({ error: 'Account is not activated yet' });
    }

    const token = generateToken(user);
    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: 'Google authentication failed' });
  }
});




function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      cin: user.cin,
      role: user.role,
      name: user.first_name ? (user.first_name + ' ' + (user.last_name || '')).trim() : ''
    },
    jwtSecret
  );
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



app.post('/login', async (req, res) => {  //login
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT id, email, password, first_name, last_name, cin, role FROM users WHERE LOWER(email) = LOWER($1)', [email]);
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
    return res.status(500).json({ error: err.message });
  }
});

app.post('/register', async (req, res) => {      //register
  try {
    const { email, password, confirmPassword, firstname, lastname, CIN, documentUrl } = req.body;

    if (!email || !password || !firstname || !lastname || !CIN) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (!documentUrl) {
      return res.status(400).json({ error: 'Supporting document is required' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE cin = $1 OR LOWER(email) = LOWER($2)',
      [CIN, email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'CIN or email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, cin, document)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, cin`,
      [email, hashedPassword, firstname, lastname, CIN, documentUrl]
    );

    return res.status(201).json({
      message: 'Account created successfully, please wait for admin approval',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message });
  }
});


app.put('/me/password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Reset token is required' });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // extract email from the reset token instead of req.user
    const payload = jwt.verify(token, jwtSecret);

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashed, payload.email]);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Reset link has expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
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
      return res.status(404).json({ message: 'there is no user with such email' });
    }

    const resetToken = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '15m' });
    const resetLink = `${process.env.CLIENT_URL}/login/reset-page-link?token=${resetToken}`;
    console.log("RESET LINK:", resetLink);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Password Reset - City Connect',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the button below to set a new password. This link expires in 15 minutes.</p>
        
        <a href="${resetLink}" 
          style="
            display:inline-block;
            padding:12px 20px;
            background-color:#007bff;
            color:white;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          ">
          Reset Password
        </a>

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
