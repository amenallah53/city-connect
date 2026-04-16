/**
 * DATABASE INITIALIZATION SCRIPT
 * 
 * Crée les tables dans la base de données selon le schéma city-connect-db-script-1.sql
 * Usage: node init-db.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cityconnect'
});

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database');
    client.release();

    // Read SQL script - Try multiple paths
    let sqlPath = path.join(__dirname, '../../database/city-connect-db-script-1.sql');
    
    if (!fs.existsSync(sqlPath)) {
      // Try from workspace root
      sqlPath = path.join(__dirname, '../../../database/city-connect-db-script-1.sql');
    }
    
    if (!fs.existsSync(sqlPath)) {
      // Try absolute path
      sqlPath = 'c:\\Users\\benro\\OneDrive\\Bureau\\CityConnect\\city-connect\\database\\city-connect-db-script-1.sql';
    }
    
    console.log(`📂 Reading SQL file: ${sqlPath}`);

    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ SQL file not found: ${sqlPath}`);
      
      // List available files
      const dbDir = path.join(__dirname, '../../database');
      console.log(`\nFiles in ${dbDir}:`);
      fs.readdirSync(dbDir).forEach(f => console.log(`  - ${f}`));
      
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL statements and filter empty ones
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        // Extract statement name for logging
        const match = statement.match(/CREATE\s+(\w+)\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
        const name = match ? `${match[1]} ${match[2]}` : 'statement';
        
        process.stdout.write(`  [${i + 1}/${statements.length}] Executing ${name}... `);
        
        await pool.query(statement);
        
        console.log('✓');
        successCount++;
      } catch (error) {
        // Some errors are acceptable (e.g., "already exists")
        if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
          console.log('⚠ (already exists)');
          successCount++;
        } else {
          console.log(`✗ ERROR`);
          console.log(`    ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log('');
    console.log('📊 SUMMARY');
    console.log(`  ✓ Success: ${successCount}`);
    console.log(`  ✗ Errors: ${errorCount}`);
    console.log('');

    if (errorCount === 0) {
      console.log('✅ Database initialized successfully!');
    } else {
      console.log('⚠ Database initialization completed with some errors');
    }

    // Display created tables
    console.log('');
    console.log('📋 Tables in database:');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    result.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
