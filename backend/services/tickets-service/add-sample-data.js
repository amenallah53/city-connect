const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

async function addSampleTicket() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Sample Ticket Insertion ---');
    await client.query('BEGIN');

    // 1. Create a test user if not exists
    const userEmail = 'test_citizen@example.com';
    let userResult = await client.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    let userId;

    if (userResult.rows.length === 0) {
      console.log('Creating test user...');
      const newUser = await client.query(
        "INSERT INTO users (full_name, email, password, role, cin) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        ['Test Citizen', userEmail, 'hashed_password', 'citoyen', 12345678]
      );
      userId = newUser.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }
    console.log(`User ID: ${userId}`);

    // 2. Generate a valid JWT for this user (simulating Auth API)
    const token = jwt.sign({ id: userId, email: userEmail, role: 'citoyen' }, JWT_SECRET);
    console.log('Generated JWT Token successfully.');

    // 3. Ensure Category exists
    const categoryName = 'Public Works';
    await client.query('INSERT INTO plainte_categorie (type) VALUES ($1) ON CONFLICT DO NOTHING', [categoryName]);
    const catResult = await client.query('SELECT id FROM plainte_categorie WHERE type = $1', [categoryName]);
    const categoryId = catResult.rows[0].id;

    // 4. Insert Ticket (Plainte) - Same logic as POST /api/tickets
    console.log('Inserting ticket into database...');
    const ticketResult = await client.query(
      'INSERT INTO plainte (description, localisation, user_id, categorie_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      ['Pothole on Main Street near the central park.', 'Gafsa Centre', userId, categoryId, 'en_attente']
    );
    const ticket = ticketResult.rows[0];

    // 5. Insert Media
    const sampleImageUrl = 'https://backblaze.com/sample-image.jpg';
    await client.query(
        'INSERT INTO plainte_media (file_url, file_type, plainte_id) VALUES ($1, $2, $3)',
        [sampleImageUrl, 'image', ticket.id]
      );

    await client.query('COMMIT');
    console.log('✅ Success! Sample ticket added with ID:', ticket.id);
    console.log('Ticket Data:', ticket);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to add sample ticket:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addSampleTicket();
