const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkBusinessRemoteSessions() {
  try {
    console.log('📋 Checking business_remote_sessions table...');
    
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'business_remote_sessions'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ business_remote_sessions table does not exist');
      console.log('✅ Creating table...');
      
      await pool.query(`
        CREATE TABLE business_remote_sessions (
          id SERIAL PRIMARY KEY,
          business_user_id INTEGER NOT NULL,
          ip_address VARCHAR(255),
          device_info JSONB,
          location VARCHAR(255),
          accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          session_type VARCHAR(50) DEFAULT 'remote'
        )
      `);
      
      console.log('✅ business_remote_sessions table created!');
    } else {
      console.log('✅ business_remote_sessions table exists');
      
      const count = await pool.query('SELECT COUNT(*) FROM business_remote_sessions');
      console.log('📊 Remote sessions:', count.rows[0].count);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkBusinessRemoteSessions();