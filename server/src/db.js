require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully at:', result.rows[0].now);
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}

if (require.main === module) {
  testConnection();
}

module.exports = pool;
