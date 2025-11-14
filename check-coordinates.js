const { sql } = require('@vercel/postgres');

async function checkCoordinates() {
  try {
    const result = await sql`
      SELECT 
        id, 
        user_id, 
        business_name, 
        location_id, 
        latitude, 
        longitude, 
        is_visible_on_map, 
        auto_sync_to_cityv,
        city
      FROM business_profiles 
      WHERE location_id IS NOT NULL
    `;
    
    console.log('📍 Business Profiles Coordinates:');
    console.table(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCoordinates();
