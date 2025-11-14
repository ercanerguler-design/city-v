const { sql } = require('@vercel/postgres');

async function enableBusinessesOnMap() {
  try {
    console.log('🗺️ Enabling all businesses on map...');
    
    // 1. Update all businesses to be visible on map if they have coordinates
    const updateVisible = await sql`
      UPDATE business_profiles
      SET 
        is_visible_on_map = true,
        auto_sync_to_cityv = true
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND (is_visible_on_map = false OR is_visible_on_map IS NULL)
    `;
    
    console.log(`✅ Updated ${updateVisible.rowCount} businesses to visible on map`);
    
    // 2. Generate location_id for businesses that don't have one
    const businessesWithoutLocationId = await sql`
      SELECT id, user_id, business_name, city
      FROM business_profiles
      WHERE location_id IS NULL
        AND business_name IS NOT NULL
    `;
    
    console.log(`📝 Found ${businessesWithoutLocationId.rowCount} businesses without location_id`);
    
    for (const business of businessesWithoutLocationId.rows) {
      const slug = business.business_name
        .toLowerCase()
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/ı/g, 'i')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const citySlug = business.city ? business.city.toLowerCase().substring(0, 5) : 'unkwn';
      const locationId = `${slug}-${citySlug}`;
      
      await sql`
        UPDATE business_profiles
        SET location_id = ${locationId}
        WHERE id = ${business.id}
      `;
      
      console.log(`  ✓ ${business.business_name} → ${locationId}`);
    }
    
    // 3. Show final stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_visible_on_map = true THEN 1 END) as visible,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coords,
        COUNT(CASE WHEN location_id IS NOT NULL THEN 1 END) as with_location_id
      FROM business_profiles
    `;
    
    console.log('\n📊 Final Stats:');
    console.table(stats.rows[0]);
    
    // 4. Show businesses that will appear on map
    const visibleBusinesses = await sql`
      SELECT 
        id,
        business_name,
        location_id,
        city,
        latitude,
        longitude,
        is_visible_on_map
      FROM business_profiles
      WHERE is_visible_on_map = true
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
      ORDER BY created_at DESC
    `;
    
    console.log('\n🗺️ Businesses visible on map:');
    console.table(visibleBusinesses.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

enableBusinessesOnMap();
