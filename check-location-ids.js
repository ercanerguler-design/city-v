const { sql } = require('@vercel/postgres');

async function checkLocationIds() {
  try {
    const result = await sql`
      SELECT id, user_id, business_name, location_id, business_type 
      FROM business_profiles 
      WHERE location_id IS NOT NULL 
      LIMIT 10
    `;
    
    console.log('📋 Business Profiles with location_id:');
    console.table(result.rows);
    
    // Check cameras for these businesses
    const cameras = await sql`
      SELECT 
        bc.id,
        bc.business_user_id,
        bc.camera_name,
        bc.status,
        bp.location_id,
        bp.business_name
      FROM business_cameras bc
      JOIN business_profiles bp ON bp.user_id = bc.business_user_id
      WHERE bp.location_id IS NOT NULL
      LIMIT 10
    `;
    
    console.log('\n📹 Business Cameras with location mapping:');
    console.table(cameras.rows);
    
    // Check recent analytics
    const analytics = await sql`
      SELECT 
        ia.id,
        ia.camera_id,
        ia.person_count,
        ia.crowd_density,
        ia.created_at,
        bp.location_id,
        bp.business_name
      FROM iot_ai_analysis ia
      JOIN business_cameras bc ON bc.id = ia.camera_id
      JOIN business_profiles bp ON bp.user_id = bc.business_user_id
      WHERE bp.location_id IS NOT NULL
      ORDER BY ia.created_at DESC
      LIMIT 10
    `;
    
    console.log('\n📊 Recent Analytics with location mapping:');
    console.table(analytics.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkLocationIds();
