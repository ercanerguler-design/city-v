const { neon } = require('@neondatabase/serverless');

async function checkBusinessProfiles() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔍 Business Profiles Analizi...');
    
    // Tüm business profiles
    const allProfiles = await sql`SELECT * FROM business_profiles`;
    console.log('📊 Toplam business profiles:', allProfiles.length);
    
    if (allProfiles.length > 0) {
      console.log('\n📋 Tüm business profilelar:');
      allProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.business_name} (ID: ${profile.id})`);
        console.log(`   - User ID: ${profile.user_id}`);
        console.log(`   - Koordinatlar: ${profile.latitude}, ${profile.longitude}`);
        console.log(`   - Mapde gorunsun: ${profile.is_visible_on_map}`);
        console.log(`   - Auto sync: ${profile.auto_sync_to_cityv}`);
        console.log(`   - Location ID: ${profile.location_id}`);
        console.log('');
      });
    }
    
    // Map'de görünür olanlar
    const visibleProfiles = await sql`
      SELECT * FROM business_profiles 
      WHERE is_visible_on_map = true
    `;
    console.log('👁️ Mapde gorunur olanlar:', visibleProfiles.length);
    
    // Koordinatları olanlar
    const withCoords = await sql`
      SELECT * FROM business_profiles 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `;
    console.log('📍 Koordinatlari olanlar:', withCoords.length);
    
    // Auto sync açık olanlar
    const autoSync = await sql`
      SELECT * FROM business_profiles 
      WHERE auto_sync_to_cityv = true
    `;
    console.log('🔄 Auto sync acik olanlar:', autoSync.length);
    
    // Tüm şartları sağlayanlar (API query'si)
    const readyForAPI = await sql`
      SELECT * FROM business_profiles 
      WHERE is_visible_on_map = true 
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL 
        AND auto_sync_to_cityv = true
    `;
    console.log('✅ API icin hazir olanlar:', readyForAPI.length);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkBusinessProfiles();