require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function testSidebarQuery() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🧪 Sidebar API Query Test\n');
    
    // Tam olarak sidebar API'nin kullandığı query
    const result = await sql`
      SELECT 
        bp.id as business_id,
        bp.business_name,
        bp.business_type,
        bp.address,
        bu.id as user_id,
        bu.company_name,
        bu.is_active as business_active,
        
        bc.id as camera_id,
        bc.camera_name,
        bc.ip_address,
        bc.is_active as camera_active,
        
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
        WHERE device_id = CAST(bc.id AS VARCHAR)
          AND analysis_timestamp >= NOW() - INTERVAL '5 minutes'
        ORDER BY analysis_timestamp DESC
        LIMIT 1
      ) ca ON true
      
      WHERE bu.is_active = true
        AND bc.id IS NOT NULL
      
      ORDER BY ca.analysis_timestamp DESC NULLS LAST, bc.created_at DESC
    `;
    
    console.log(`📊 Sonuç: ${result.length} business bulundu\n`);
    
    if (result.length === 0) {
      console.log('❌ Hala boş! Kontrol edilmesi gerekenler:');
      console.log('  1. business_users.is_active = true mi?');
      console.log('  2. business_cameras.is_active = true mi?');
      console.log('  3. INNER JOIN business_profiles sorunu var mı?');
    } else {
      result.forEach((row, i) => {
        console.log(`${i + 1}. ${row.business_name} (${row.business_type})`);
        console.log(`   Business ID: ${row.business_id}`);
        console.log(`   User ID: ${row.user_id}`);
        console.log(`   Camera ID: ${row.camera_id} - ${row.camera_name || 'İsimsiz'}`);
        console.log(`   Camera Active: ${row.camera_active}`);
        
        if (row.analysis_timestamp) {
          console.log(`   📊 Son Analiz: ${new Date(row.analysis_timestamp).toLocaleString('tr-TR')}`);
          console.log(`      Kişi: ${row.people_count}, Yoğunluk: ${row.crowd_density}, Kapasite: ${row.current_occupancy}%`);
        } else {
          console.log(`   ⚠️  Son 5 dakikada veri yok`);
        }
        console.log();
      });
      
      console.log('✅ Sidebar API artık çalışmalı!');
    }
    
  } catch (error) {
    console.error('❌ Query hatası:', error.message);
  }
}

testSidebarQuery();
