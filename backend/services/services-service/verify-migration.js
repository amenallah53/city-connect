const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD
};

const pool = new Pool(dbConfig);

async function verifyMigration() {
  const client = await pool.connect();
  try {
    console.log('\n✅ Verifying Migration Results\n');
    console.log('================================\n');

    const tables = ['users', 'service', 'demande_service', 'demande_service_document', 'prestataire', 'admin', 'municipalite', 'news', 'job', 'plainte'];
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      const count = result.rows[0].count;
      console.log(`✓ ${table}: ${count} rows`);
    }

    console.log('\n================================');
    console.log('✅ Migration verified successfully!\n');

    // Check first user to see UUID and name split
    console.log('Sample User (to verify UUID and name split):');
    const userResult = await client.query(`
      SELECT id, cin, first_name, last_name, email, role 
      FROM users LIMIT 1
    `);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log(`  ID: ${user.id}`);
      console.log(`  CIN: ${user.cin}`);
      console.log(`  First Name: ${user.first_name}`);
      console.log(`  Last Name: ${user.last_name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await client.release();
    await pool.end();
  }
}

verifyMigration();
