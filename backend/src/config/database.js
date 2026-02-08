const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl: {
    rejectUnauthorized: false, // ✅ OBBLIGATORIO su Render
  },

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connesso (Render, SSL attivo)');
    client.release();
  } catch (err) {
    console.error('❌ Errore connessione PostgreSQL:', err.message);
  }
})();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
