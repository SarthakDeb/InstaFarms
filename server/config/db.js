const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const checkDbConnection = async () => {
  let client;
  try {
    console.log('[DB Connection Test] Attempting to connect to PostgreSQL...');
    client = await pool.connect(); 
    console.log('[DB Connection Test] Successfully acquired a client from the pool.');
    await client.query('SELECT NOW()'); 
    console.log('[DB Connection Test] Test query "SELECT NOW()" successful. Database connection is working.');
    client.release();
    return true;
  } catch (error) {
    console.error('[DB Connection Test] FAILED to connect to PostgreSQL or test query failed.');
    console.error('Error Message:', error.message);
    if (error.code) {
        console.error('Error Code:', error.code);
        if (error.code === '28P01') console.error('This means: Authentication failed. Check DB_USER and DB_PASSWORD.');
        if (error.code === '3D000') console.error('This means: Database does not exist. Check DB_DATABASE.');
        if (error.code === 'ECONNREFUSED') console.error('This means: Connection refused. Check DB_HOST, DB_PORT, and if PostgreSQL server is running and accessible.');
    }
    console.error('Current .env values being used (password omitted for security):');
    console.error(`  DB_USER: ${process.env.DB_USER}`);
    console.error(`  DB_HOST: ${process.env.DB_HOST}`);
    console.error(`  DB_DATABASE: ${process.env.DB_DATABASE}`);
    console.error(`  DB_PORT: ${process.env.DB_PORT}`);
    if (client) {
      client.release();
    }
    return false;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  checkDbConnection 
};