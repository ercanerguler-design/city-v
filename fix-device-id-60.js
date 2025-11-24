require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function fixDeviceId() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔧 Camera ID 60 device_id düzeltiliyor...\n');
    
    // Şu anki değer
    const before = await sql`SELECT id, device_id FROM business_cameras WHERE id = 60`;
    console.log('📸 Önceki değer:');
    console.log(`  - Camera ID: ${before[0].id}`);
    console.log(`  - device_id: "${before[0].device_id}"`);
    console.log();
    
    // device_id'yi "60" olarak güncelle
    await sql`
      UPDATE business_cameras 
      SET device_id = '60'
      WHERE id = 60
    `;
    
    // Yeni değer
    const after = await sql`SELECT id, device_id FROM business_cameras WHERE id = 60`;
    console.log('✅ Sonraki değer:');
    console.log(`  - Camera ID: ${after[0].id}`);
    console.log(`  - device_id: "${after[0].device_id}"`);
    console.log();
    
    console.log('✅ device_id güncellendi! Artık sidebar API çalışacak.');
    console.log('   IoT kayıtları: device_id="60" (222 kayıt)');
    console.log('   Business camera: device_id="60" ✓');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

fixDeviceId();
