require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixBusinessCamerasDeviceId() {
  console.log('🔧 business_cameras tablosuna device_id kolonu ekleniyor...\n');

  try {
    // 1. device_id kolonu var mı kontrol et
    const checkCol = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'business_cameras' AND column_name = 'device_id'
    `;

    if (checkCol.length === 0) {
      console.log('➕ device_id kolonu ekleniyor...');
      await sql`ALTER TABLE business_cameras ADD COLUMN device_id TEXT`;
      console.log('✅ device_id kolonu eklendi');
    } else {
      console.log('ℹ️  device_id kolonu zaten var');
    }

    // 2. Var olan kameraların device_id'lerini bul ve ata
    console.log('\n📹 Var olan kameraları kontrol ediyorum...');
    
    const cameras = await sql`
      SELECT id, camera_name, ip_address, device_id, stream_url
      FROM business_cameras 
      WHERE is_active = true
    `;

    console.log(`   ${cameras.length} aktif kamera bulundu`);

    for (const cam of cameras) {
      console.log(`\n   Kamera #${cam.id}: ${cam.camera_name}`);
      console.log(`   IP: ${cam.ip_address}`);
      console.log(`   Stream URL: ${cam.stream_url || 'Yok'}`);
      console.log(`   Mevcut device_id: ${cam.device_id || 'Yok'}`);

      if (!cam.device_id) {
        // IoT crowd analysis'te bu kameraya ait veri var mı bul
        // IP adresinden veya stream URL'den device_id bulmaya çalış
        
        // Örnek: Stream URL içinde device ID olabilir
        let possibleDeviceId = null;
        
        if (cam.stream_url) {
          // ngrok URL'sinden veya IP'den device ID çıkar
          const streamUrl = cam.stream_url;
          if (streamUrl.includes('CityV-AI-')) {
            const match = streamUrl.match(/CityV-AI-\d+/);
            if (match) possibleDeviceId = match[0];
          }
        }

        if (!possibleDeviceId) {
          // Veritabanındaki IoT verilerine bak (en son kullanılan device_id)
          const recentIoT = await sql`
            SELECT DISTINCT device_id 
            FROM iot_crowd_analysis 
            WHERE analysis_timestamp >= NOW() - INTERVAL '1 day'
            LIMIT 1
          `;
          
          if (recentIoT.length > 0) {
            possibleDeviceId = recentIoT[0].device_id;
            console.log(`   ⚠️  IoT verilerinden device_id bulundu: ${possibleDeviceId}`);
          }
        }

        if (possibleDeviceId) {
          await sql`UPDATE business_cameras SET device_id = ${possibleDeviceId} WHERE id = ${cam.id}`;
          console.log(`   ✅ device_id atandı: ${possibleDeviceId}`);
        } else {
          // Geçici olarak camera ID'yi kullan (daha sonra ESP32'den güncellenecek)
          const tempDeviceId = `CAM-${cam.id}`;
          await sql`UPDATE business_cameras SET device_id = ${tempDeviceId} WHERE id = ${cam.id}`;
          console.log(`   ⚠️  Geçici device_id atandı: ${tempDeviceId} (ESP32'den güncellenecek)`);
        }
      } else {
        console.log(`   ✅ device_id zaten var`);
      }
    }

    console.log('\n✅ Tüm kameralar güncellendi!\n');

    // 3. Sonucu göster
    const updated = await sql`
      SELECT id, camera_name, device_id 
      FROM business_cameras 
      WHERE is_active = true
    `;

    console.log('📊 Güncellenmiş kamera listesi:');
    updated.forEach(c => {
      console.log(`   ${c.id}. ${c.camera_name} → ${c.device_id}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

fixBusinessCamerasDeviceId();
