const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function addPublicIpFields() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Adding public IP fields to business_cameras table...');
    
    // Add public IP fields
    await pool.query(`
      ALTER TABLE business_cameras 
      ADD COLUMN IF NOT EXISTS public_ip VARCHAR(15),
      ADD COLUMN IF NOT EXISTS public_port INTEGER,
      ADD COLUMN IF NOT EXISTS stream_path VARCHAR(100) DEFAULT '/stream',
      ADD COLUMN IF NOT EXISTS is_public_access BOOLEAN DEFAULT FALSE;
    `);
    
    // Add index for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_business_cameras_public_ip 
      ON business_cameras(public_ip);
    `);
    
    console.log('✅ Public IP fields added successfully!');
    console.log('📊 Updated schema:');
    console.log('  - public_ip: VARCHAR(15) - Router external IP');  
    console.log('  - public_port: INTEGER - Port forwarding target');
    console.log('  - stream_path: VARCHAR(100) - Stream endpoint path');
    console.log('  - is_public_access: BOOLEAN - Production access flag');
    
    // Test query
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'business_cameras' 
      AND column_name IN ('public_ip', 'public_port', 'stream_path', 'is_public_access')
      ORDER BY column_name;
    `);
    
    console.log('🔍 Verified new columns:', result.rows);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await pool.end();
  }
}

addPublicIpFields();