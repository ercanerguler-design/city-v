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

async function updateDemoCameraToLocalStream() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Demo kamera local test stream\'e yönlendiriliyor...\n');
    
    // Local test stream kullan
    const streamUrl = 'http://localhost:3000/api/test-stream';
    
    const updateQuery = `
      UPDATE business_cameras
      SET 
        stream_url = $1,
        ip_address = 'localhost',
        port = 3000,
        updated_at = NOW()
      WHERE camera_name LIKE 'Demo Traffic Camera%'
      RETURNING id, camera_name, stream_url, ip_address, port;
    `;
    
    const result = await client.query(updateQuery, [streamUrl]);
    
    if (result.rows.length > 0) {
      console.log('✅ Demo kamera güncellendi!');
      console.log('\n📹 Yeni Stream Bilgileri:');
      console.log(result.rows[0]);
      console.log('\n💡 Test için tarayıcıda: http://localhost:3000/api/test-stream');
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

updateDemoCameraToLocalStream().catch(console.error);
