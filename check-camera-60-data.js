require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkCamera60Data() {
  try {
    // 1. Camera 60'tan son verileri kontrol et
    console.log('📊 Camera ID 60 - Son veriler:');
    const dataResult = await pool.query(`
      SELECT 
        camera_id, 
        person_count, 
        detection_objects->>'current_occupancy' as occupancy,
        created_at 
      FROM iot_ai_analysis 
      WHERE camera_id = 60 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('Toplam kayıt:', dataResult.rowCount);
    console.log('Son 5 kayıt:', dataResult.rows);
    
    // 2. business_cameras tablosunda Camera 60 var mı?
    console.log('\n📹 business_cameras tablosunda Camera 60:');
    const cameraResult = await pool.query(`
      SELECT * FROM business_cameras WHERE id = 60
    `);
    
    if (cameraResult.rowCount === 0) {
      console.log('❌ Camera ID 60 business_cameras tablosunda YOK!');
      console.log('⚠️ Bu yüzden JOIN başarısız oluyor ve dashboard boş!');
    } else {
      console.log('✅ Camera 60 bulundu:', cameraResult.rows[0]);
    }
    
    // 3. Business user 20'nin kameraları
    console.log('\n👤 Business User 20 - Kayıtlı kameralar:');
    const userCamerasResult = await pool.query(`
      SELECT id, camera_name, business_user_id 
      FROM business_cameras 
      WHERE business_user_id = 20
    `);
    
    console.log('Toplam kamera:', userCamerasResult.rowCount);
    console.log('Kameralar:', userCamerasResult.rows);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    pool.end();
  }
}

checkCamera60Data();
