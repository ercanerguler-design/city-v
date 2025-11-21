const { neon } = require('@neondatabase/serverless');

async function testLocationsAPI() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🗺️ Locations API Test - Business Profiles');
    
    // locations API'deki query'yi test edelim
    const result = await sql`
      SELECT 
        bp.location_id as id,
        bp.business_name as name,
        COALESCE(bp.category, 'other') as category,
        bp.latitude,
        bp.longitude,
        bp.address,
        COALESCE(bp.current_crowd_level, 'moderate') as "currentCrowdLevel",
        COALESCE(bp.average_wait_time, 0) as "averageWaitTime",
        NOW() as "lastUpdated",
        bp.description,
        bp.working_hours as "workingHours",
        bp.rating,
        bp.review_count as "reviewCount",
        bp.phone,
        bp.website,
        bp.photos,
        bp.business_type as "businessType",
        bp.user_id as "businessUserId",
        bp.id as "businessProfileId"
       FROM business_profiles bp
       WHERE bp.is_visible_on_map = true
         AND bp.latitude IS NOT NULL
         AND bp.longitude IS NOT NULL
         AND bp.auto_sync_to_cityv = true
       ORDER BY bp.created_at DESC
    `;

    console.log('✅ Query başarılı:');
    console.log('  - Toplam business location:', result.length);
    
    if (result.length > 0) {
      console.log('  - İlk business:');
      console.log('    -', result[0].name);
      console.log('    - ID:', result[0].id);
      console.log('    - Koordinatlar:', result[0].latitude, result[0].longitude);
      console.log('    - Kategori:', result[0].category);
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

testLocationsAPI();