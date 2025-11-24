require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkDeviceIds() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Camera 60'ın device_id'si
    const camera = await sql`SELECT device_id FROM business_cameras WHERE id = 60`;
    console.log('📸 Camera ID 60 - device_id:', camera[0]?.device_id);
    console.log();
    
    // IoT kayıtlarında hangi device_id'ler var?
    const iotRecords = await sql`
      SELECT DISTINCT device_id, COUNT(*) as count
      FROM iot_crowd_analysis  
      WHERE device_id IN ('60', ${camera[0]?.device_id || ''})
      GROUP BY device_id
      ORDER BY count DESC
    `;
    
    console.log('📊 iot_crowd_analysis tablosundaki kayıtlar:');
    if (iotRecords.length === 0) {
      console.log('❌ Hiç kayıt bulunamadı!');
    } else {
      iotRecords.forEach(r => {
        console.log(`  ✅ device_id = "${r.device_id}" → ${r.count} kayıt`);
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

checkDeviceIds();
