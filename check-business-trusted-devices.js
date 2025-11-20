const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkBusinessTrustedDevices() {
  try {
    console.log('📋 Checking business_trusted_devices table...');
    
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'business_trusted_devices'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ business_trusted_devices table does not exist');
      console.log('✅ Creating table...');
      
      await pool.query(`
        CREATE TABLE business_trusted_devices (
          id SERIAL PRIMARY KEY,
          business_user_id INTEGER NOT NULL,
          device_fingerprint VARCHAR(255) NOT NULL,
          device_name VARCHAR(255),
          device_info JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(business_user_id, device_fingerprint)
        )
      `);
      
      console.log('✅ business_trusted_devices table created!');
    } else {
      console.log('✅ business_trusted_devices table exists');
      
      const count = await pool.query('SELECT COUNT(*) FROM business_trusted_devices');
      console.log('📊 Trusted devices:', count.rows[0].count);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkBusinessTrustedDevices();