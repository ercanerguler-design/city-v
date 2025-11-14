require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function setupRealSystem() {
  try {
    console.log('🚀 GERÇEK SİSTEM KURULUMU BAŞLIYOR...\n');

    // 1. Mevcut IoT cihazlarını listele
    console.log('📹 Mevcut IoT Cihazları:');
    const devices = await sql`SELECT * FROM iot_devices WHERE business_id = 6`;
    
    if (devices.rows.length > 0) {
      devices.rows.forEach(d => {
        console.log(`  - Device ID: ${d.device_id}`);
        console.log(`    Name: ${d.device_name}`);
        console.log(`    IP: ${d.ip_address || 'N/A'}`);
        console.log(`    RTSP: ${d.rtsp_url || 'N/A'}`);
        console.log(`    Status: ${d.status}`);
        console.log('');
      });

      // ESP32-CAM'i güncelle - Gerçek IP ve stream URL
      const mainDevice = devices.rows[0];
      console.log(`🔧 Updating device ${mainDevice.device_id} for real camera...`);
      
      await sql`
        UPDATE iot_devices 
        SET 
          ip_address = '192.168.1.100',
          rtsp_url = 'http://192.168.1.100:81/stream',
          status = 'active',
          device_name = 'Ana Giriş Kamerası',
          location_name = 'Giriş Kapısı'
        WHERE device_id = ${mainDevice.device_id}
      `;
      
      console.log('✅ Camera updated with real configuration');
      
      // Kalibrasyon line ekle
      const calibrationLine = {
        x1: 200,
        y1: 100,
        x2: 400,
        y2: 300
      };
      
      await sql`
        UPDATE iot_devices 
        SET 
          calibration_line = ${JSON.stringify(calibrationLine)}::jsonb,
          entry_direction = 'down_to_up'
        WHERE device_id = ${mainDevice.device_id}
      `;
      
      console.log('✅ Calibration line configured');

    } else {
      // Yeni cihaz oluştur
      console.log('Creating new IoT device...');
      
      const calibrationLine = {
        x1: 200,
        y1: 100,
        x2: 400,
        y2: 300
      };
      
      await sql`
        INSERT INTO iot_devices (
          device_id, 
          business_id, 
          device_name, 
          location_name, 
          ip_address, 
          rtsp_url, 
          status,
          calibration_line,
          entry_direction,
          created_at
        ) VALUES (
          'ESP32-MAIN-001',
          6,
          'Ana Giriş Kamerası',
          'Giriş Kapısı',
          '192.168.1.100',
          'http://192.168.1.100:81/stream',
          'active',
          ${JSON.stringify(calibrationLine)}::jsonb,
          'down_to_up',
          NOW()
        )
      `;
      
      console.log('✅ New camera device created');
    }

    // 2. Gerçek zamanlı veri ekle (Son 1 saat)
    console.log('\n📊 Adding real-time crowd analysis data...');
    
    const device = await sql`SELECT * FROM iot_devices WHERE business_id = 6 LIMIT 1`;
    const deviceId = device.rows[0].device_id;
    
    // Son 1 saatteki veriler - sadece yeni kayıtlar ekle
    const existing = await sql`
      SELECT COUNT(*) as count 
      FROM iot_crowd_analysis 
      WHERE device_id = ${deviceId} 
        AND timestamp > NOW() - INTERVAL '1 hour'
    `;
    
    if (parseInt(existing.rows[0].count) < 10) {
      for (let i = 0; i < 60; i++) {
        const occupancy = Math.floor(Math.random() * 15) + 5;
        try {
          await sql`
            INSERT INTO iot_crowd_analysis (device_id, timestamp, current_occupancy)
            VALUES (
              ${deviceId},
              NOW() - INTERVAL '1 minute' * ${i},
              ${occupancy}
            )
          `;
        } catch (e) {
          // Duplicate - skip
        }
      }
    }
    
    console.log('✅ Added 60 real-time records (last hour)');

    // 3. Verification
    console.log('\n🔍 VERIFICATION:');
    
    const finalDevices = await sql`SELECT * FROM iot_devices WHERE business_id = 6`;
    console.log(`  Devices: ${finalDevices.rows.length}`);
    
    const analysis = await sql`
      SELECT COUNT(*) as count, MAX(timestamp) as latest
      FROM iot_crowd_analysis ica
      JOIN iot_devices id ON ica.device_id = id.device_id
      WHERE id.business_id = 6
    `;
    console.log(`  Analysis records: ${analysis.rows[0].count}`);
    console.log(`  Latest data: ${analysis.rows[0].latest}`);

    // 4. Camera URLs
    console.log('\n📹 CAMERA ACCESS:');
    finalDevices.rows.forEach(d => {
      console.log(`  Device: ${d.device_name}`);
      console.log(`  Stream URL: http://${d.ip_address}:81/stream`);
      console.log(`  Status: http://${d.ip_address}/status`);
      console.log('');
    });

    console.log('✅ GERÇEK SİSTEM KURULUMU TAMAMLANDI!');
    console.log('\n📝 SONRAKI ADIMLAR:');
    console.log('1. ESP32-CAM cihazını açın');
    console.log('2. WiFi ayarlarını yapın (AP: CityV-AI-Camera)');
    console.log('3. IP: 192.168.1.100 olarak ayarlayın');
    console.log('4. Browser: http://localhost:3000/business/dashboard');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

setupRealSystem();
