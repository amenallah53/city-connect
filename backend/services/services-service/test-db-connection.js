#!/usr/bin/env node

/**
 * Database Connection Test
 * Tests if backend can connect to PostgreSQL
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

console.log('🔍 Testing Database Connection...');
console.log('Configuration:');
console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`  Port: ${process.env.DB_PORT || 5432}`);
console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
console.log(`  Database: ${process.env.DB_NAME || 'cityconnect'}`);
console.log('');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection FAILED:');
    console.error(err.message);
    process.exit(1);
  } else {
    console.log('✅ Connection SUCCESS!');
    console.log(`   Server time: ${res.rows[0].now}`);
    
    // Test if tables exist
    pool.query(`
      SELECT COUNT(*) 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `, (err, res) => {
      if (err) {
        console.error('❌ Could not check tables:', err.message);
      } else {
        const tableCount = res.rows[0].count;
        console.log(`   Tables found: ${tableCount}`);
        if (tableCount > 0) {
          console.log('   ✅ Database schema appears to be initialized');
        } else {
          console.log('   ⚠️  No tables found - run schema.sql to initialize');
        }
      }
      pool.end();
    });
  }
});
