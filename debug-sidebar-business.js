require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBusinessSidebarData() {
  console.log('🔍 LiveCrowdSidebar için business verilerini kontrol ediyorum...\n');

  try {
    // Business profiller ve kameraları kontrol
    const businessProfiles = await sql`
      SELECT 
        bp.id as profile_id,
        bp.business_name,
        bp.business_type,
        bp.address,
        bp.latitude,
        bp.longitude,
        bu.id as user_id,
        bu.email,
        bu.is_active
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      WHERE bu.is_active = true
      ORDER BY bp.id
    `;

    console.log(`📊 Toplam ${businessProfiles.length} aktif business profili bulundu:\n`);
    
    for (const bp of businessProfiles) {
      console.log(`${bp.profile_id}. ${bp.business_name}`);
      console.log(`   User ID: ${bp.user_id} (${bp.email})`);
      console.log(`   Tip: ${bp.business_type}`);
      console.log(`   Konum: ${bp.latitude}, ${bp.longitude}`);
      console.log(`   Adres: ${bp.address}`);
      
      // Bu business'a ait kameraları kontrol
      const cameras = await sql`
        SELECT 
          id, 
          camera_name, 
          is_active,
          ip_address,
          stream_url,
          ai_enabled
        FROM business_cameras 
        WHERE business_id = ${bp.profile_id}
      `;
      
      console.log(`   Kameralar: ${cameras.length} adet`);
      cameras.forEach(cam => {
        console.log(`     - ${cam.camera_name} (${cam.is_active ? '✅ Aktif' : '❌ Pasif'}) - AI: ${cam.ai_enabled ? '✅' : '❌'}`);
        console.log(`       IP: ${cam.ip_address || 'Yok'}, Stream: ${cam.stream_url ? '✅' : '❌'}`);
      });
      
      // IoT crowd analysis verisi var mı?
      const iotData = await sql`
        SELECT 
          ca.id,
          ca.person_count,
          ca.crowd_level,
          ca.analysis_timestamp,
          bc.camera_name
        FROM iot_crowd_analysis ca
        INNER JOIN business_cameras bc ON ca.camera_id = bc.id
        WHERE bc.business_id = ${bp.profile_id}
          AND ca.analysis_timestamp >= NOW() - INTERVAL '5 minutes'
        ORDER BY ca.analysis_timestamp DESC
        LIMIT 5
      `;
      
      console.log(`   IoT Verileri (son 5 dk): ${iotData.length} kayıt`);
      if (iotData.length > 0) {
        iotData.forEach(data => {
          console.log(`     - ${data.camera_name}: ${data.person_count} kişi, ${data.crowd_level}, ${new Date(data.analysis_timestamp).toLocaleString('tr-TR')}`);
        });
      }
      
      console.log('');
    }

    // API response simulation
    console.log('\n📡 /api/business/live-iot-data API sonucu simülasyonu:\n');
    
    const apiResult = await sql`
      SELECT 
        bp.id as business_id,
        bp.business_name,
        bp.business_type,
        bp.address,
        bp.latitude,
        bp.longitude,
        bc.id as camera_id,
        bc.camera_name,
        bc.is_active as camera_active,
        ca.person_count,
        ca.crowd_level,
        ca.analysis_timestamp
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      LEFT JOIN business_cameras bc ON bp.id = bc.business_id AND bc.is_active = true
      LEFT JOIN LATERAL (
        SELECT person_count, crowd_level, analysis_timestamp
        FROM iot_crowd_analysis
        WHERE camera_id = bc.id
          AND analysis_timestamp >= NOW() - INTERVAL '5 minutes'
        ORDER BY analysis_timestamp DESC
        LIMIT 1
      ) ca ON true
      WHERE bu.is_active = true
        AND bc.id IS NOT NULL
      ORDER BY ca.analysis_timestamp DESC NULLS LAST
    `;

    console.log(`✅ API ${apiResult.length} kayıt döndürecek`);
    
    if (apiResult.length === 0) {
      console.log('\n❌ HİÇBİR KAYIT YOK! Muhtemel sebepler:');
      console.log('   1. business_cameras tablosunda aktif kamera yok');
      console.log('   2. business_users.is_active = false');
      console.log('   3. business_cameras.is_active = false');
    } else {
      console.log('\n✅ API döndürecek kayıtlar:');
      apiResult.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.business_name} - Kamera: ${row.camera_name}`);
        console.log(`      Veri: ${row.person_count !== null ? `${row.person_count} kişi, ${row.crowd_level}` : 'Veri yok'}`);
      });
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkBusinessSidebarData();
