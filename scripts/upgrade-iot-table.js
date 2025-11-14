require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function upgradeIoTDevices() {
  try {
    console.log('🔧 Upgrading iot_devices table...\n');

    // 1. Yeni kolonları ekle
    await sql`
      ALTER TABLE iot_devices 
      ADD COLUMN IF NOT EXISTS location_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50),
      ADD COLUMN IF NOT EXISTS rtsp_url TEXT,
      ADD COLUMN IF NOT EXISTS stream_url TEXT,
      ADD COLUMN IF NOT EXISTS calibration_line JSONB,
      ADD COLUMN IF NOT EXISTS entry_direction VARCHAR(50),
      ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 100,
      ADD COLUMN IF NOT EXISTS device_type VARCHAR(50) DEFAULT 'ESP32-CAM'
    `;
    
    console.log('✅ Columns added');

    // 2. Mevcut cihazı güncelle
    const devices = await sql`SELECT * FROM iot_devices WHERE business_id = 6`;
    
    if (devices.rows.length > 0) {
      const d = devices.rows[0];
      
      const calibrationLine = {
        x1: 200,
        y1: 100,
        x2: 400,
        y2: 300
      };
      
      await sql`
        UPDATE iot_devices 
        SET 
          location_name = 'Ana Giriş',
          ip_address = '192.168.1.100',
          rtsp_url = 'http://192.168.1.100:81/stream',
          stream_url = 'http://192.168.1.100:81/stream',
          calibration_line = ${JSON.stringify(calibrationLine)}::jsonb,
          entry_direction = 'down_to_up',
          max_capacity = 50,
          device_type = 'ESP32-CAM',
          device_name = 'Ana Giriş Kamerası'
        WHERE device_id = ${d.device_id}
      `;
      
      console.log(`✅ Updated device ${d.device_id}`);
    }

    // 3. Verification
    const updated = await sql`SELECT * FROM iot_devices WHERE business_id = 6`;
    console.log('\n📹 Updated Device:');
    updated.rows.forEach(d => {
      console.log(`  Device ID: ${d.device_id}`);
      console.log(`  Name: ${d.device_name}`);
      console.log(`  Location: ${d.location_name}`);
      console.log(`  IP: ${d.ip_address}`);
      console.log(`  Stream: ${d.stream_url}`);
      console.log(`  Calibrated: ${!!d.calibration_line}`);
      console.log(`  Status: ${d.status}`);
    });

    console.log('\n✅ IoT Devices table upgraded!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

upgradeIoTDevices();
