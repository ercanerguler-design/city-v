require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBusiness() {
  console.log('🔍 Business User ID 23 kontrolü başlıyor...\n');
  
  // Business user bilgileri
  const businessUser = await sql`
    SELECT 
      bu.id as user_id,
      bu.email,
      bu.company_name,
      bu.is_active,
      bp.id as profile_id,
      bp.business_name,
      bp.business_type,
      bp.address
    FROM business_users bu
    LEFT JOIN business_profiles bp ON bu.id = bp.user_id
    WHERE bu.id = 23
  `;
  
  if (businessUser.length > 0) {
    console.log('✅ Business User bulundu:');
    console.log(businessUser[0]);
    console.log('');
    
    // Bu business'ın kameralarını listele
    const cameras = await sql`
      SELECT id, camera_name, is_active, ip_address
      FROM business_cameras
      WHERE business_user_id = 23
      ORDER BY id
    `;
    
    console.log(`📷 ${businessUser[0].business_name} - Kameralar (${cameras.length} adet):`);
    cameras.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: ${c.camera_name}, IP: ${c.ip_address || 'N/A'}, Active: ${c.is_active}`);
    });
    
    // Son IoT verileri
    console.log('\n📊 Son IoT Verileri (Camera ID 60):');
    const iotData = await sql`
      SELECT 
        device_id,
        people_count,
        crowd_density,
        entry_count,
        exit_count,
        current_occupancy,
        analysis_timestamp
      FROM iot_crowd_analysis
      WHERE device_id = '60'
      ORDER BY analysis_timestamp DESC
      LIMIT 5
    `;
    
    iotData.forEach(d => {
      const timestamp = new Date(d.analysis_timestamp).toLocaleTimeString('tr-TR');
      console.log(`  - ${timestamp}: ${d.people_count} kişi, Density: ${d.crowd_density}, Giriş: ${d.entry_count}, Çıkış: ${d.exit_count}, Doluluk: ${d.current_occupancy}`);
    });
    
  } else {
    console.log('❌ Business User ID 23 bulunamadı!');
  }
}

checkBusiness().catch(console.error);
