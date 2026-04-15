const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

const services = [
  {
    name: 'Water Connection Request',
    type: 'permit',
    description: 'Request a water connection for your property',
    badges: JSON.stringify(['Electronic', 'Immediate']),
    requirements: 'Property deed, ID card, address proof',
    municipalite_id: 1
  },
  {
    name: 'Electricity Connection',
    type: 'permit',
    description: 'Apply for electricity connection in your area',
    badges: JSON.stringify(['Electronic']),
    requirements: 'Property document, meter installation form',
    municipalite_id: 1
  },
  {
    name: 'Street Lighting Report',
    type: 'report',
    description: 'Report street lights that are not working',
    badges: JSON.stringify(['Electronic', 'Public']),
    requirements: 'Location, photo if available',
    municipalite_id: 1
  },
  {
    name: 'Pothole Report',
    type: 'report',
    description: 'Report potholes or road damage',
    badges: JSON.stringify(['Electronic', 'Public']),
    requirements: 'Location, description, photo',
    municipalite_id: 1
  },
  {
    name: 'Street Cleaning Request',
    type: 'maintenance',
    description: 'Request street cleaning in your neighborhood',
    badges: JSON.stringify(['Electronic']),
    requirements: 'Street name, area description',
    municipalite_id: 1
  },
  {
    name: 'Parking Permit Application',
    type: 'permit',
    description: 'Apply for a residential parking permit',
    badges: JSON.stringify(['Electronic', 'Not immediate']),
    requirements: 'Vehicle registration, residence proof',
    municipalite_id: 1
  },
  {
    name: 'Business License Renewal',
    type: 'permit',
    description: 'Renew your business operating license',
    badges: JSON.stringify(['Electronic']),
    requirements: 'Current license, business registration, tax certificate',
    municipalite_id: 1
  },
  {
    name: 'Marriage Certificate',
    type: 'civic',
    description: 'Request or verify marriage certificate',
    badges: JSON.stringify(['Electronic', 'Immediate']),
    requirements: 'Marriage proof, valid ID',
    municipalite_id: 1
  },
  {
    name: 'Birth Certificate Request',
    type: 'civic',
    description: 'Order certified birth certificate',
    badges: JSON.stringify(['Electronic', 'Immediate']),
    requirements: 'ID, relationship proof to applicant',
    municipalite_id: 1
  },
  {
    name: 'Death Certificate',
    type: 'civic',
    description: 'Request death certificate',
    badges: JSON.stringify(['Electronic', 'Immediate']),
    requirements: 'Proof of death, ID',
    municipalite_id: 1
  },
  {
    name: 'Noise Complaint',
    type: 'report',
    description: 'File a noise disturbance complaint',
    badges: JSON.stringify(['Electronic', 'Public']),
    requirements: 'Time, location, description, witnesses if any',
    municipalite_id: 1
  },
  {
    name: 'Waste Management Service',
    type: 'maintenance',
    description: 'Request garbage collection or waste disposal',
    badges: JSON.stringify(['Electronic', 'Recurring']),
    requirements: 'Address, waste type',
    municipalite_id: 1
  },
  {
    name: 'Public Transport Pass',
    type: 'civic',
    description: 'Apply for public transportation pass',
    badges: JSON.stringify(['Electronic', 'Immediate']),
    requirements: 'ID, residence proof, age verification if applicable',
    municipalite_id: 1
  },
  {
    name: 'Zoning Certificate',
    type: 'permit',
    description: 'Request zoning certificate for property',
    badges: JSON.stringify(['Electronic', 'Not immediate']),
    requirements: 'Property deed, land survey, construction plans',
    municipalite_id: 1
  },
  {
    name: 'Traffic Violation Appeal',
    type: 'civic',
    description: 'Appeal a traffic violation or parking ticket',
    badges: JSON.stringify(['Electronic']),
    requirements: 'Ticket number, violation details, supporting documents',
    municipalite_id: 1
  }
];

async function createSchema() {
  try {
    console.log('📋 Creating schema if it doesn\'t exist...');
    
    // Create services table with JSONB for badges
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        description TEXT,
        badges JSONB,
        requirements TEXT,
        municipalite_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Schema created/verified');
  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
    throw error;
  }
}

async function insertServices() {
  try {
    await createSchema();
    
    console.log(`\n📝 Inserting ${services.length} municipal services...`);
    
    for (const service of services) {
      const query = `
        INSERT INTO services (name, type, description, badges, requirements, municipalite_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name
      `;
      const result = await pool.query(query, [
        service.name,
        service.type,
        service.description,
        service.badges,
        service.requirements,
        service.municipalite_id
      ]);
      console.log(`  ✅ ${result.rows[0].name}`);
    }
    
    console.log('\n✅ All services added successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting services:', error.message);
    process.exit(1);
  }
}

insertServices();
