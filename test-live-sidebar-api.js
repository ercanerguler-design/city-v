require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testLiveSidebarAPI() {
  console.log('🔍 LiveCrowdSidebar API Test (Düzeltilmiş Sorgu)\n');

  try {
    // API'nin kullandığı sorguyu test et
    const result = await sql`
      SELECT 
        bp.id as business_id,
        bp.business_name,
        bp.business_type,
        bp.address,
        bp.city,
        bp.district,
        bp.latitude,
        bp.longitude,
        bp.phone,
        bu.id as user_id,
        bu.company_name,
        bu.is_active as business_active,
        bu.added_by_admin,
        
        -- Kamera bilgileri (business_cameras.business_user_id = business_users.id)
        bc.id as camera_id,
        bc.camera_name,
        bc.ip_address,
        bc.stream_url,
        bc.location_description,
        bc.is_active as camera_active,
        bc.ai_enabled,
        bc.created_at as camera_created_at,
        
        -- Crowd analysis bilgileri (son 5 dakika)
        ca.people_count,
        ca.crowd_density,
        ca.current_occupancy,
        ca.analysis_timestamp
        
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      LEFT JOIN business_cameras bc ON bu.id = bc.business_user_id AND bc.is_active = true
      LEFT JOIN LATERAL (
        SELECT people_count, crowd_density, current_occupancy, analysis_timestamp
        FROM iot_crowd_analysis
        WHERE device_id = bc.device_id
          AND analysis_timestamp >= NOW() - INTERVAL '5 minutes'
        ORDER BY analysis_timestamp DESC
        LIMIT 1
      ) ca ON true
      
      WHERE bu.is_active = true
        AND bc.id IS NOT NULL
      
      ORDER BY ca.analysis_timestamp DESC NULLS LAST, bc.created_at DESC
    `;

    console.log(`✅ Sorgu başarılı! ${result.length} kayıt bulundu\n`);

    if (result.length === 0) {
      console.log('⚠️ Hiçbir kayıt dönmedi. Olası sebepler:');
      console.log('   - business_users.is_active = false');
      console.log('   - business_cameras.is_active = false');
      console.log('   - business_cameras tablosunda kayıt yok');
      
      // Debug için kontrol
      const userCount = await sql`SELECT COUNT(*) FROM business_users WHERE is_active = true`;
      const cameraCount = await sql`SELECT COUNT(*) FROM business_cameras WHERE is_active = true`;
      const profileCount = await sql`SELECT COUNT(*) FROM business_profiles`;
      
      console.log(`\n📊 Debug:`)
      console.log(`   - Aktif business users: ${userCount[0].count}`);
      console.log(`   - Aktif kameralar: ${cameraCount[0].count}`);
      console.log(`   - Business profiles: ${profileCount[0].count}`);
      
      // Hangi business_user_id'lerin kamerası var kontrol et
      const camerasPerUser = await sql`
        SELECT bu.id, bu.email, bu.company_name, COUNT(bc.id) as camera_count
        FROM business_users bu
        LEFT JOIN business_cameras bc ON bu.id = bc.business_user_id
        WHERE bu.is_active = true
        GROUP BY bu.id, bu.email, bu.company_name
      `;
      console.log('\n📹 Kullanıcı başına kamera sayısı:');
      camerasPerUser.forEach(u => {
        console.log(`   ${u.email} (${u.company_name}): ${u.camera_count} kamera`);
      });
      
    } else {
      console.log('📋 Dönen kayıtlar:\n');
      result.forEach((row, i) => {
        console.log(`${i + 1}. ${row.business_name}`);
        console.log(`   User ID: ${row.user_id}, Profile ID: ${row.business_id}`);
        console.log(`   Kamera: ${row.camera_name} (ID: ${row.camera_id})`);
        console.log(`   IoT Verisi: ${row.people_count !== null ? 
          `${row.people_count} kişi, ${row.crowd_density}, ${row.current_occupancy}% doluluk` : 
          'Veri yok'}`);
        console.log(`   Stream URL: ${row.stream_url ? 'Var' : 'Yok'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLiveSidebarAPI();
