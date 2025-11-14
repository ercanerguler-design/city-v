require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

async function fixStreamUrls() {
  try {
    console.log('🔧 RTSP URL\'leri HTTP\'ye çeviriliyor...\n');

    // Önce mevcut durumu göster
    const currentResult = await pool.query(
      'SELECT id, camera_name, stream_url FROM business_cameras WHERE stream_url LIKE $1',
      ['rtsp://%']
    );

    console.log('📋 Değiştirilecek kameralar:');
    currentResult.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.camera_name}`);
      console.log(`    Eski: ${row.stream_url}`);
    });
    console.log('');

    // RTSP'yi HTTP'ye çevir
    const updateResult = await pool.query(`
      UPDATE business_cameras 
      SET stream_url = REPLACE(stream_url, 'rtsp://', 'http://')
      WHERE stream_url LIKE 'rtsp://%'
      RETURNING id, camera_name, stream_url
    `);

    console.log('✅ Güncelleme tamamlandı!\n');
    console.log('📋 Güncellenmiş kameralar:');
    updateResult.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.camera_name}`);
      console.log(`    Yeni: ${row.stream_url}`);
    });

    console.log(`\n🎉 Toplam ${updateResult.rowCount} kamera güncellendi!`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await pool.end();
  }
}

fixStreamUrls();
