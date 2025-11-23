const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixMissingDeviceIds() {
  try {
    console.log('🔧 Fixing missing device_ids...\n');
    
    // device_id NULL olan kameraları bul
    const cameras = await sql`
      SELECT id, camera_name, business_user_id, created_at
      FROM business_cameras
      WHERE device_id IS NULL
      ORDER BY created_at DESC
    `;
    
    console.log(`Found ${cameras.length} cameras without device_id\n`);
    
    if (cameras.length === 0) {
      console.log('✅ All cameras already have device_id!');
      return;
    }
    
    // Her kamera için device_id oluştur ve update et
    for (const camera of cameras) {
      const deviceId = `CITYV-CAM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      await sql`
        UPDATE business_cameras
        SET device_id = ${deviceId}
        WHERE id = ${camera.id}
      `;
      
      console.log(`✅ Updated Camera #${camera.id}: ${camera.name}`);
      console.log(`   Device ID: ${deviceId}`);
      console.log(`   Business User: ${camera.business_user_id}`);
      console.log('');
      
      // Rate limiting için kısa bekle
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ All cameras updated successfully!');
    console.log('\nℹ️  Next steps:');
    console.log('1. ESP32 kameralarını yeniden configure edin');
    console.log('2. Her kameraya business dashboard\'dan yeni device_id\'yi atayın');
    console.log('3. ESP32 firmware\'inde device_id\'yi hardcode edin veya WiFi setup\'ta girin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

fixMissingDeviceIds();
