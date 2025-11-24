// Business user 23'ün kameralarını kontrol et
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBusinessUser23Cameras() {
  console.log('🔍 Business User ID 23 kamera kontrolü...');
  
  try {
    // Business user 23'ün bilgilerini al
    const user = await sql`
      SELECT id, email, full_name, membership_type
      FROM business_users 
      WHERE id = 23
    `;
    
    console.log('👤 Business User 23:', user[0]);
    
    // Business user 23'ün kameralarını al
    const cameras = await sql`
      SELECT id, business_user_id, camera_name, ip_address, port, 
             stream_url, status, location_description, is_active,
             device_id, created_at, ai_enabled
      FROM business_cameras 
      WHERE business_user_id = 23
      ORDER BY created_at DESC
    `;
    
    console.log(`📹 Business User 23'ün kameraları: ${cameras.length} adet`);
    
    cameras.forEach((camera, index) => {
      console.log(`📷 Kamera ${index + 1}:`, {
        id: camera.id,
        device_id: camera.device_id,
        camera_name: camera.camera_name,
        ip_address: camera.ip_address,
        stream_url: camera.stream_url,
        status: camera.status,
        is_active: camera.is_active,
        ai_enabled: camera.ai_enabled,
        created_at: camera.created_at
      });
    });
    
    // IoT crowd analysis verileri var mı kontrol et (camera_id ile)
    if (cameras.length > 0) {
      console.log('\n🤖 IoT crowd analysis verilerini kontrol ediyorum...');
      
      const cameraIds = cameras.map(c => c.id);
      
      const iotData = await sql`
        SELECT camera_id, person_count, crowd_density, created_at
        FROM iot_ai_analysis
        WHERE camera_id = ANY(${cameraIds})
        ORDER BY created_at DESC
        LIMIT 10
      `;
      
      console.log(`📊 IoT analiz verileri: ${iotData.length} kayıt`);
      
      iotData.forEach((data, index) => {
        console.log(`📈 Kayıt ${index + 1}:`, {
          camera_id: data.camera_id,
          person_count: data.person_count,
          crowd_density: data.crowd_density,
          created_at: data.created_at
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkBusinessUser23Cameras();