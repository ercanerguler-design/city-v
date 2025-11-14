const { sql } = require('@vercel/postgres');

async function checkBusinessLocations() {
  try {
    console.log('🔍 Checking business locations data...\n');
    
    // Check all business profiles
    const all = await sql`
      SELECT 
        id,
        user_id,
        business_name,
        city,
        location_id,
        latitude,
        longitude,
        is_visible_on_map,
        auto_sync_to_cityv,
        category
      FROM business_profiles
    `;
    
    console.log('📊 All Business Profiles:');
    console.table(all.rows);
    
    // Check visible on map
    const visible = await sql`
      SELECT 
        id,
        business_name,
        city,
        location_id,
        latitude,
        longitude
      FROM business_profiles
      WHERE is_visible_on_map = true
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND auto_sync_to_cityv = true
    `;
    
    console.log('\n🗺️ Visible on Map:');
    console.table(visible.rows);
    
    // Check with Ankara filter
    const ankara = await sql`
      SELECT 
        id,
        business_name,
        city,
        location_id
      FROM business_profiles
      WHERE is_visible_on_map = true
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND auto_sync_to_cityv = true
        AND city = 'Ankara'
    `;
    
    console.log('\n📍 Ankara Filter Result:');
    console.table(ankara.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBusinessLocations();
