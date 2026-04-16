/**
 * CONFIGURATION BASE DE DONNÉES
 * 
 * Ce fichier configure la connexion à PostgreSQL.
 * Il crée un pool de connexions réutilisables pour de meilleures performances.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Création du pool de connexions
// Un pool maintient plusieurs connexions ouvertes pour ne pas créer une nouvelle
// connexion à chaque requête (c'est plus rapide)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cityconnect'
});

// Gestion des erreurs du pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
