/**
 * Database Schema Inspector
 * 
 * Inspects the current database schema to see existing tables and columns
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cityconnect'
});

async function inspectSchema() {
  try {
    console.log('🔍 Inspecting database schema...\n');

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`📊 Found ${tables.length} tables:\n`);

    // Inspect relevant tables
    const tablesToInspect = ['service', 'demandeservice', 'demande_service', 'users', 'prestataire'];

    for (const tableName of tablesToInspect) {
      if (tables.includes(tableName)) {
        console.log(`\n📋 Table: "${tableName}"`);
        console.log('─'.repeat(60));

        const columnsResult = await pool.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        columnsResult.rows.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
          const defaultVal = col.column_default ? ` = ${col.column_default}` : '';
          console.log(`  • ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} ${nullable}${defaultVal}`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

inspectSchema();
