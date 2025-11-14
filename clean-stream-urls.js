require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

async function cleanStreamUrls() {
  try {
    console.log('🧹 Stream URL\'leri temizleniyor (username/password kaldırılıyor)...\n');

    // Önce mevcut durumu göster
    const currentResult = await pool.query(
      'SELECT id, camera_name, ip_address, port, username, password, stream_url FROM business_cameras'
    );

    console.log('📋 Mevcut kameralar:');
    currentResult.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.camera_name}`);
      console.log(`    IP: ${row.ip_address}:${row.port}`);
      console.log(`    Username: ${row.username || '(yok)'}`);
      console.log(`    Stream URL: ${row.stream_url}`);
      console.log('');
    });

    // Stream URL'leri temizle - sadece IP:PORT/stream formatında olsun
    const updateResult = await pool.query(`
      UPDATE business_cameras 
      SET stream_url = 'http://' || ip_address || ':' || port || '/stream'
      RETURNING id, camera_name, ip_address, port, stream_url
    `);

    console.log('✅ Güncelleme tamamlandı!\n');
    console.log('📋 Temizlenmiş stream URL\'leri:');
    updateResult.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.camera_name}`);
      console.log(`    Yeni: ${row.stream_url}`);
      console.log(`    (username/password artık stream_url'de değil, ayrı sütunlarda)`);
      console.log('');
    });

    console.log(`\n🎉 Toplam ${updateResult.rowCount} kamera güncellendi!`);
    console.log('\n💡 Not: Username/password bilgileri camera tablosunda ayrı sütunlarda saklanıyor.');
    console.log('   RemoteCameraViewer bu bilgileri kullanırsa AUTH header ile gönderir.');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await pool.end();
  }
}

cleanStreamUrls();
