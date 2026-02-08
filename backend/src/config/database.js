const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Errore connessione database:', err.message);
    console.log('🔧 Verifica:');
    console.log('1. PostgreSQL è avviato?');
    console.log('2. Porta corretta? (5433)');
    console.log('3. Credenziali corrette?');
    console.log('4. Database "photobooth_app" esiste?');
  } else {
    console.log('✅ Connesso a PostgreSQL su porta 5433');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};