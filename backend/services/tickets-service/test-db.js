const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

async function testConnection() {
  console.log('Attempting to connect to the database...');
  console.log(`Config: host=${process.env.DB_HOST}, user=${process.env.DB_USER}, db=${process.env.DB_NAME}`);
  
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW() as current_time');
    console.log('📊 Database time:', res.rows[0].current_time);
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📂 Tables found:', tables.rows.map(r => r.table_name).join(', '));
    
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
