require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkDatabaseSchema() {
  console.log('🔍 Veritabanı şeması kontrol ediliyor...\n');

  try {
    // Business cameras tablosunun yapısını kontrol
    console.log('📋 business_cameras tablosu kolonları:');
    const cameraColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'business_cameras'
      ORDER BY ordinal_position
    `;
    
    console.log(cameraColumns);
    console.log('');

    // Business cameras tablosundaki kayıtlar
    console.log('📊 business_cameras tablosundaki kayıtlar:');
    const cameras = await sql`SELECT * FROM business_cameras LIMIT 5`;
    console.log(`Toplam ${cameras.length} kayıt gösteriliyor:`);
    cameras.forEach(cam => {
      console.log(`  ID: ${cam.id}, İsim: ${cam.camera_name}`);
      console.log(`  Kolonlar:`, Object.keys(cam).join(', '));
    });
    console.log('');

    // iot_crowd_analysis tablosu var mı?
    console.log('🔍 iot_crowd_analysis tablosu kontrolü:');
    try {
      const iotColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'iot_crowd_analysis'
        ORDER BY ordinal_position
      `;
      
      if (iotColumns.length > 0) {
        console.log('✅ Tablo var!');
        console.log('Kolonlar:', iotColumns.map(c => c.column_name).join(', '));
        
        const iotData = await sql`SELECT * FROM iot_crowd_analysis LIMIT 3`;
        console.log(`\n${iotData.length} örnek kayıt:`);
        iotData.forEach(d => {
          console.log(`  ID: ${d.id}, Camera: ${d.camera_id}, Person Count: ${d.person_count}, Time: ${d.analysis_timestamp}`);
        });
      }
    } catch (e) {
      console.log('❌ Tablo bulunamadı!');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkDatabaseSchema();
