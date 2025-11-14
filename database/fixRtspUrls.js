/**
 * RTSP URL'lerini HTTP MJPEG formatına çevir
 * 
 * ESP32-CAM browser'da RTSP stream'i oynatamaz, HTTP MJPEG kullanması gerekir
 * 
 * RTSP: rtsp://user:pass@192.168.1.2:80/stream
 * HTTP:  http://192.168.1.2:80/stream
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function fixRtspUrls() {
  try {
    console.log('🔄 RTSP URL\'leri HTTP\'ye çeviriliyor...\n');

    // Tüm RTSP kameraları bul (hem stream_url hem rtsp_url kontrol et)
    const result = await sql`
      SELECT id, device_name, stream_url, rtsp_url, ip_address
      FROM iot_devices
      WHERE stream_url LIKE 'rtsp://%' OR rtsp_url LIKE 'rtsp://%'
    `;

    if (result.rows.length === 0) {
      console.log('✅ Tüm kameralar zaten HTTP formatında!');
      return;
    }

    console.log(`📋 ${result.rows.length} RTSP kamera bulundu:\n`);

    // Her kamera için URL'i düzelt
    for (const camera of result.rows) {
      const oldUrl = camera.stream_url || camera.rtsp_url;
      if (!oldUrl) continue;
      
      // RTSP URL'ini parse et: rtsp://user:pass@ip:port/path
      const match = oldUrl.match(/rtsp:\/\/(?:[^:]+:[^@]+@)?([^:]+):?(\d+)?(\/.*)?/);
      
      if (match) {
        const [, ip, port, path] = match;
        const newUrl = `http://${ip}:${port || '80'}${path || '/stream'}`;
        
        console.log(`  📷 ${camera.device_name || 'İsimsiz Kamera'}`);
        console.log(`     Eski: ${oldUrl}`);
        console.log(`     Yeni: ${newUrl}`);
        
        // URL'i güncelle (hem stream_url hem rtsp_url'i güncelle)
        await sql`
          UPDATE iot_devices
          SET stream_url = ${newUrl},
              rtsp_url = ${newUrl}
          WHERE id = ${camera.id}
        `;
        
        console.log(`     ✅ Güncellendi\n`);
      } else {
        console.log(`  ⚠️  ${camera.device_name || 'İsimsiz'}: URL parse edilemedi: ${oldUrl}\n`);
      }
    }

    console.log('\n✅ Tüm RTSP URL\'leri HTTP\'ye çevrildi!');
    console.log('\n💡 Not: ESP32-CAM\'inizde stream endpoint\'i açık olmalı:');
    console.log('   - Web arayüzünde "Start Stream" butonuna basın');
    console.log('   - Veya ESP32 kodunda httpd_start() çağrısı olsun\n');

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  }
}

fixRtspUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
