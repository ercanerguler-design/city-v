require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function testBusinessAnalytics() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('📊 Business Analytics API Test\n');
    
    // Camera ID 60'ın business_user_id'si
    const businessUserId = 23;
    
    // Analytics API'nin kullandığı query (business_cameras tablosu üzerinden)
    const analyticsQuery = await sql`
      SELECT 
        bc.id as camera_id,
        bc.camera_name,
        bc.device_id,
        COUNT(ica.id) as total_records,
        AVG(ica.people_count) as avg_people,
        MAX(ica.people_count) as max_people,
        MIN(ica.people_count) as min_people,
        MAX(ica.analysis_timestamp) as last_analysis
      FROM business_cameras bc
      LEFT JOIN iot_crowd_analysis ica ON CAST(ica.device_id AS VARCHAR) = CAST(bc.id AS VARCHAR)
      WHERE bc.business_user_id = ${businessUserId}
        AND bc.is_active = true
      GROUP BY bc.id, bc.camera_name, bc.device_id
      ORDER BY bc.id
    `;
    
    console.log(`✅ Business User ID ${businessUserId} Analytics:\n`);
    
    if (analyticsQuery.length === 0) {
      console.log('❌ Hiç kamera bulunamadı!');
      return;
    }
    
    analyticsQuery.forEach((cam, i) => {
      console.log(`${i + 1}. Camera ID ${cam.camera_id} - ${cam.camera_name || 'İsimsiz'}`);
      console.log(`   device_id: "${cam.device_id}"`);
      console.log(`   Toplam kayıt: ${cam.total_records}`);
      
      if (cam.total_records > 0) {
        console.log(`   Ortalama kişi: ${Math.round(cam.avg_people)}`);
        console.log(`   Min-Max: ${cam.min_people} - ${cam.max_people}`);
        console.log(`   Son analiz: ${new Date(cam.last_analysis).toLocaleString('tr-TR')}`);
      } else {
        console.log('   ⚠️  Hiç IoT verisi yok!');
      }
      console.log();
    });
    
    // Device ID eşleşmesi kontrol
    console.log('🔍 Device ID Eşleşme Kontrolü:\n');
    
    const cameras = await sql`
      SELECT id, device_id 
      FROM business_cameras 
      WHERE business_user_id = ${businessUserId}
    `;
    
    for (const cam of cameras) {
      const iotCount = await sql`
        SELECT COUNT(*) as count
        FROM iot_crowd_analysis
        WHERE device_id = ${cam.device_id}
      `;
      
      const iotCountById = await sql`
        SELECT COUNT(*) as count
        FROM iot_crowd_analysis
        WHERE device_id = CAST(${cam.id} AS VARCHAR)
      `;
      
      console.log(`Camera ID ${cam.id}:`);
      console.log(`  device_id: "${cam.device_id}"`);
      console.log(`  IoT kayıt (device_id match): ${iotCount[0].count}`);
      console.log(`  IoT kayıt (camera id match): ${iotCountById[0].count}`);
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

testBusinessAnalytics();
