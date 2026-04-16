/**
 * SEED DATABASE SCRIPT
 * 
 * Inserts seed data into the database
 * Usage: node seed-db.js
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

async function seedDatabase() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('🌱 Seeding database...\n');

    // Check if municipalities already exist
    const municipResult = await client.query('SELECT COUNT(*) FROM municipalite;');
    console.log(`   Found ${municipResult.rows[0].count} existing municipalities`);
    
    if (parseInt(municipResult.rows[0].count) === 0) {
      // 1. Insert Municipalities
      console.log('📍 Inserting municipalities...');
      await client.query(`
        INSERT INTO municipalite (name) VALUES
          ('Tunis'),
          ('Sfax'),
          ('Sousse'),
          ('Kairouan'),
          ('Bizerte');
      `);
      console.log('   ✓ 5 municipalities inserted');
      
      // Verify they were inserted
      const verifyMunic = await client.query('SELECT COUNT(*) FROM municipalite;');
      console.log(`   ✓ Verified: ${verifyMunic.rows[0].count} municipalities in DB`);
    }

    // 2. Insert Service Types
    console.log('📋 Inserting service types...');
    await client.query(`
      INSERT INTO service_type (type) VALUES
        ('Building permits'),
        ('Administration'),
        ('Public Services'),
        ('Transport'),
        ('Infrastructure'),
        ('Business licenses'),
        ('Honoring the dead');
    `);
    console.log('   ✓ 7 service types inserted');

    // 3. Insert Services
    console.log('🔧 Inserting services...');
    await client.query(`
      INSERT INTO service (type, name, badges, description, requirements, municipalite_id)
      VALUES
        ('Building permits', 'Issuing a building permit', ARRAY['Electronic', 'Not immediate'], 
         'Request authorization to start construction work.', ARRAY['Identity document', 'land ownership proof', 'architectural plans'], 1),
        
        ('Honoring the dead', 'Printing a burial certificate', ARRAY['Electronic'], 
         'Obtain an official burial certificate.', ARRAY['Death certificate', 'ID of requester'], 1),
        
        ('Business licenses', 'Renewing a business license', ARRAY['With Fees', 'Not immediate'], 
         'Renew your commercial activity authorization.', ARRAY['Old license', 'tax clearance', 'ID'], 1),
        
        ('Building permits', 'Issuing a demolition permit', ARRAY['Electronic', 'Not immediate'], 
         'Request authorization to demolish a structure.', ARRAY['Ownership proof', 'demolition plan', 'safety report'], 1),
        
        ('Administration', 'Request for civil status certificate', ARRAY['Electronic', 'Immediate'], 
         'Get birth, marriage, or residence certificate.', ARRAY['National ID'], 1),
        
        ('Public Services', 'Garbage collection complaint', ARRAY['Free', 'Quick'], 
         'Report missed or delayed waste collection.', ARRAY['Address details'], 1),
        
        ('Transport', 'Apply for parking permit', ARRAY['With Fees'], 
         'Get residential or commercial parking authorization.', ARRAY['Vehicle registration', 'ID', 'proof of address'], 1),
        
        ('Infrastructure', 'Report road damage', ARRAY['Free'], 
         'Notify municipality about damaged roads or sidewalks.', ARRAY['Location details', 'optional photos'], 1);
    `);
    console.log('   ✓ 8 services inserted');

    // 4. Insert Test Users
    console.log('👥 Inserting test users...');
    await client.query(`
      INSERT INTO users (cin, first_name, last_name, email, adresse, telephone, password, role, status)
      VALUES
        ('12345678', 'Ahmed', 'Ben Ali', 'ahmed@example.com', '123 Main St', '+216 90 123 456', 'hashed_password_1', 'citoyen', 'accepted'),
        ('23456789', 'Fatima', 'Khalil', 'fatima@example.com', '456 Oak Ave', '+216 91 234 567', 'hashed_password_2', 'citoyen', 'accepted'),
        ('34567890', 'Mohamed', 'Salah', 'mohamed@example.com', '789 Pine Rd', '+216 92 345 678', 'hashed_password_3', 'prestataire', 'accepted');
    `);
    console.log('   ✓ 3 test users inserted');

    // 5. Insert Complaint Categories
    console.log('⚠️  Inserting complaint categories...');
    await client.query(`
      INSERT INTO plainte_categorie (type) VALUES
        ('Road Damage'),
        ('Flooding'),
        ('Noise Complaint'),
        ('Pollution'),
        ('Illegal Parking'),
        ('Other');
    `);
    console.log('   ✓ 6 complaint categories inserted');

    // 6. Insert FAQ Data
    console.log('❓ Inserting FAQs...');
    await client.query(`
      INSERT INTO faqs (question, answer) VALUES
        ('How do I apply for a building permit?', 'You can apply online through CityConnect. You will need to provide your identity document, proof of land ownership, and architectural plans.'),
        ('What is the processing time for a civil status certificate?', 'Civil status certificates are typically issued immediately upon application.'),
        ('How do I report a complaint?', 'Use the Complaints section in CityConnect to report any issues. Attach photos or documents if necessary.'),
        ('Can I track my service request status?', 'Yes, you can track all your requests in your profile dashboard.'),
        ('What payment methods are accepted?', 'We accept bank transfers, credit cards, and online payment systems.');
    `);
    console.log('   ✓ 5 FAQs inserted');

    console.log('\n✅ Database seeding completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

seedDatabase();
