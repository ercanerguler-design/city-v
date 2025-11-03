/**
 * ID 29 kamerayı güncelle - Giriş Kapısı HD settings
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function updateCamera() {
  console.log('📹 Kamera güncelleniyor: ID 29 (192.168.1.3)...');
  
  try {
    // Eski bilgileri göster
    const old = await sql`SELECT * FROM business_cameras WHERE id = 29`;
    console.log('🔍 Eski ayarlar:', old.rows[0]);

    // HD ayarlarla güncelle
    const result = await sql`
      UPDATE business_cameras 
      SET 
        camera_name = 'ESP32-CAM HD - Giriş Kapısı',
        ip_address = '192.168.1.3',
        port = 80,
        stream_url = 'http://192.168.1.3:80/stream',
        location_description = 'Giriş Kapısı - Ana Salon',
        status = 'active',
        resolution = '1600x1200',
        ai_enabled = true,
        updated_at = NOW()
      WHERE id = 29
      RETURNING id, camera_name, ip_address, port, resolution, ai_enabled
    `;

    console.log('✅ Kamera güncellendi!');
    console.log('📹 Yeni ayarlar:', result.rows[0]);
    console.log('📺 Test URL: http://192.168.1.3:80/stream');
    console.log('🎯 Çözünürlük: 1600x1200 (UXGA Ultra HD)');
    console.log('🤖 AI Detection: Aktif');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    process.exit(0);
  }
}

updateCamera();
