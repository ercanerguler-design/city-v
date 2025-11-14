require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function setupBusiness6() {
  try {
    console.log('🔧 Setting up Business ID 6 (Merve User)...\n');

    // 1. Business user kontrol et
    const user = await sql`SELECT * FROM business_users WHERE id = 6`;
    
    if (user.rows.length === 0) {
      console.log('❌ Business user ID 6 bulunamadı!');
      console.log('Creating business user...');
      
      await sql`
        INSERT INTO business_users (id, email, password_hash, full_name, company_name, membership_type, max_cameras, created_at)
        VALUES (6, 'merveerguler93@gmail.com', 'dummy_hash', 'DERİN SU ERGÜLER', 'SCE INNOVATION', 'premium', 10, NOW())
        ON CONFLICT (id) DO NOTHING
      `;
      console.log('✅ Business user created');
    } else {
      console.log('✅ Business user exists:', user.rows[0].email);
    }

    // 2. Business profile kontrol et
    const profile = await sql`SELECT * FROM business_profiles WHERE user_id = 6`;
    
    if (profile.rows.length === 0) {
      console.log('Creating business profile...');
      
      await sql`
        INSERT INTO business_profiles (user_id, business_name, business_type, address, city, phone, created_at)
        VALUES (6, 'SCE INNOVATION', 'Teknoloji', 'Ankara', 'Ankara', '+905555555555', NOW())
      `;
      console.log('✅ Business profile created');
    } else {
      console.log('✅ Business profile exists:', profile.rows[0].business_name);
    }

    // 3. IoT devices ekle (192.168.1.3)
    const device = await sql`SELECT * FROM iot_devices WHERE business_id = 6`;
    
    if (device.rows.length === 0) {
      console.log('Creating IoT device...');
      
      await sql`
        INSERT INTO iot_devices (device_id, business_id, device_name, location_name, ip_address, rtsp_url, status, created_at)
        VALUES ('ESP32-001', 6, 'Giriş Kamerası', 'Ana Giriş', '192.168.1.3', 'http://192.168.1.3:80/stream', 'active', NOW())
      `;
      console.log('✅ IoT device created');
    } else {
      console.log('✅ IoT device exists:', device.rows[0].device_name);
    }

    // 4. Test crowd analysis verisi ekle
    console.log('\nAdding test crowd analysis data...');
    
    // Mevcut cihazın device_id'sini al
    const existingDevice = await sql`SELECT device_id FROM iot_devices WHERE business_id = 6 LIMIT 1`;
    
    if (existingDevice.rows.length > 0) {
      const deviceId = existingDevice.rows[0].device_id;
      console.log(`Using device ID: ${deviceId}`);
      
      // Bugün için veriler
      for (let i = 0; i < 10; i++) {
        const occupancy = Math.floor(Math.random() * 20) + 5;
        const hoursAgo = i;
        await sql`
          INSERT INTO iot_crowd_analysis (device_id, timestamp, current_occupancy)
          VALUES (
            ${deviceId},
            NOW() - INTERVAL '1 hour' * ${hoursAgo},
            ${occupancy}
          )
        `;
      }
      
      console.log('✅ Added 10 test crowd analysis records');
    } else {
      console.log('⚠️ No device found, skipping analysis data');
    }

    // 5. Doğrulama
    console.log('\n🔍 Verification:');
    
    const verifyDevices = await sql`SELECT COUNT(*) FROM iot_devices WHERE business_id = 6`;
    console.log('  Devices:', verifyDevices.rows[0].count);
    
    const verifyAnalysis = await sql`
      SELECT COUNT(*) as count, MAX(timestamp) as latest
      FROM iot_crowd_analysis 
      WHERE device_id = ${existingDevice.rows[0].device_id}
    `;
    console.log('  Analysis records:', verifyAnalysis.rows[0].count);
    console.log('  Latest:', verifyAnalysis.rows[0].latest);

    console.log('\n✅ Setup complete! Business ID 6 is ready.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

setupBusiness6();
