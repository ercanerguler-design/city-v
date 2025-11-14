const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Vercel Postgres connection string
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ POSTGRES_URL environment variable bulunamadı!');
  console.log('💡 .env.local dosyasında POSTGRES_URL tanımlı olmalı');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addDemoCamera() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Demo kamera ekleniyor...\n');
    
    // SQL dosyasını oku
    const sqlPath = path.join(__dirname, 'add-demo-camera.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // SQL'i çalıştır
    const result = await client.query(sql);
    
    console.log('✅ Demo kamera başarıyla eklendi!');
    console.log('\n📊 Sonuç:', result[result.length - 1].rows);
    
    // Kontrol - eklenen kamerayı göster
    const checkQuery = `
      SELECT 
        id,
        camera_name,
        ip_address,
        stream_url,
        status
      FROM business_cameras 
      WHERE camera_name LIKE 'Demo Traffic Camera%'
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    const check = await client.query(checkQuery);
    if (check.rows.length > 0) {
      console.log('\n📹 Eklenen Kamera:');
      console.log(check.rows[0]);
    } else {
      console.log('\n⚠️ Demo kamera bulunamadı (zaten eklenmiş olabilir)');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addDemoCamera().catch(console.error);
