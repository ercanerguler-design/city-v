const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkBusinessCameras() {
  try {
    console.log('📹 Business cameras query...');
    
    // Önce tablo yapısını kontrol et
    const structure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'business_cameras'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Table structure:', structure.rows);
    
    // Business camera'larını çek
    const cameras = await pool.query(`
      SELECT * FROM business_cameras 
      WHERE business_user_id = 20
      ORDER BY id
    `);
    
    console.log('📊 Found cameras:', cameras.rows.length);
    
    cameras.rows.forEach((cam, index) => {
      console.log(`📹 Camera ${index + 1}:`, cam);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkBusinessCameras();