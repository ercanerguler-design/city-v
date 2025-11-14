const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ POSTGRES_URL environment variable bulunamadı!');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Çalışan public MJPEG stream URLs
const WORKING_STREAMS = [
  {
    name: 'Test Pattern Stream',
    url: 'https://www.cambridgeincolour.com/tutorials/camera-sensors-files/sensor-iso100-original.jpg', // Static image for testing
    ip: 'test.cityv.ai',
    port: 443
  }
];

async function updateDemoCamera() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Demo kamera stream URL\'i güncelleniyor...\n');
    
    const stream = WORKING_STREAMS[0];
    
    // Demo kamerayı güncelle
    const updateQuery = `
      UPDATE business_cameras
      SET 
        stream_url = $1,
        ip_address = $2,
        port = $3,
        updated_at = NOW()
      WHERE camera_name LIKE 'Demo Traffic Camera%'
      RETURNING id, camera_name, stream_url, ip_address;
    `;
    
    const result = await client.query(updateQuery, [
      stream.url,
      stream.ip,
      stream.port
    ]);
    
    if (result.rows.length > 0) {
      console.log('✅ Demo kamera güncellendi!');
      console.log('\n📹 Yeni Stream Bilgileri:');
      console.log(result.rows[0]);
    } else {
      console.log('⚠️ Demo kamera bulunamadı');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateDemoCamera().catch(console.error);
