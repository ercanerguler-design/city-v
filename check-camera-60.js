require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkCamera() {
  console.log('🔍 Camera ID 60 kontrolü başlıyor...\n');
  
  // Camera ID 60'ı ara
  const camera = await sql`
    SELECT id, camera_name, business_user_id, is_active, stream_url, ip_address
    FROM business_cameras 
    WHERE id = 60
  `;
  
  if (camera.length > 0) {
    console.log('✅ Camera ID 60 bulundu:');
    console.log(camera[0]);
  } else {
    console.log('❌ Camera ID 60 bulunamadı!\n');
    
    // Mevcut kameraları göster
    const allCameras = await sql`
      SELECT id, camera_name, business_user_id, is_active
      FROM business_cameras 
      ORDER BY id DESC 
      LIMIT 10
    `;
    
    console.log('📋 Mevcut kameralar (son 10):');
    allCameras.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: ${c.camera_name}, BusinessUserID: ${c.business_user_id}, Active: ${c.is_active}`);
    });
    
    console.log('\n💡 ÇÖZÜM: ESP32\'de Camera ID değiştir veya business_cameras\'a ID 60 ekle');
  }
  
  // IoT crowd analysis'de device_id="60" var mı?
  console.log('\n🔍 iot_crowd_analysis tablosunda device_id="60" kontrol ediliyor...');
  const iotData = await sql`
    SELECT COUNT(*) as count, MAX(analysis_timestamp) as last_update
    FROM iot_crowd_analysis
    WHERE device_id = '60'
  `;
  
  console.log(`📊 IoT Veri: ${iotData[0].count} kayıt, Son güncelleme: ${iotData[0].last_update || 'Yok'}`);
}

checkCamera().catch(console.error);
