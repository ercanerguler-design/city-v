// Production database'de business profile'ı güncelle
const { neon } = require('@neondatabase/serverless');

async function updateProductionBusiness() {
  // Production DATABASE_URL kullanılacak
  const sql = neon('postgresql://neondb_owner:npg_Z1HBqLuCNi0w@ep-solitary-wind-ad4zkrm3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

  try {
    console.log('🌐 Production database güncelleniyor...');
    
    // Önce mevcut durumu kontrol et
    const current = await sql`
      SELECT * FROM business_profiles WHERE id = 15
    `;
    
    if (current.length > 0) {
      console.log('📋 Mevcut durum:');
      console.log('  - Koordinatlar:', current[0].latitude, current[0].longitude);
      console.log('  - Görünür:', current[0].is_visible_on_map);
      console.log('  - Auto sync:', current[0].auto_sync_to_cityv);
    }
    
    // Güncelleme yap
    const lat = 39.894;
    const lng = 32.781;
    
    const result = await sql`
      UPDATE business_profiles 
      SET 
        latitude = ${lat},
        longitude = ${lng},
        is_visible_on_map = true,
        category = 'technology'
      WHERE id = 15
      RETURNING *
    `;
    
    console.log('✅ Production business profile güncellendi:');
    console.log('  - ID:', result[0].id);
    console.log('  - İsim:', result[0].business_name);
    console.log('  - Koordinatlar:', result[0].latitude, result[0].longitude);
    console.log('  - Map görünür:', result[0].is_visible_on_map);
    console.log('  - Auto sync:', result[0].auto_sync_to_cityv);
    
    // Locations API query'sini test et
    console.log('\n🔍 Production locations query test...');
    const locationsTest = await sql`
      SELECT 
        bp.location_id as id,
        bp.business_name as name,
        bp.latitude,
        bp.longitude,
        bp.is_visible_on_map,
        bp.auto_sync_to_cityv
       FROM business_profiles bp
       WHERE bp.is_visible_on_map = true
         AND bp.latitude IS NOT NULL
         AND bp.longitude IS NOT NULL
         AND bp.auto_sync_to_cityv = true
    `;
    
    console.log('✅ API için hazır business sayısı:', locationsTest.length);
    if (locationsTest.length > 0) {
      console.log('  - İlk business:', locationsTest[0].name);
    }
    
  } catch (error) {
    console.error('❌ Production update hatası:', error);
  }
}

updateProductionBusiness();