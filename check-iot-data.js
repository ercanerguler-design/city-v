// Check if there's any AI analysis data
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL || '', {
  ssl: 'require'
});

async function checkData() {
  try {
    console.log('🔍 Checking IoT AI Analysis Data...\n');

    // 1. Business users
    const users = await sql`
      SELECT id, full_name, email
      FROM business_users
      ORDER BY id
    `;
    console.log(`👥 Business Users: ${users.length}`);

    // 2. Business cameras
    const cameras = await sql`
      SELECT 
        bc.id,
        bc.business_user_id,
        bc.camera_name,
        bu.full_name as owner
      FROM business_cameras bc
      JOIN business_users bu ON bc.business_user_id = bu.id
      ORDER BY bc.business_user_id
    `;
    console.log(`📹 Business Cameras: ${cameras.length}`);
    cameras.forEach(c => {
      console.log(`   Camera ${c.id}: ${c.camera_name} (Owner: ${c.owner})`);
    });

    // 3. AI Analysis records (total)
    const totalAnalysis = await sql`
      SELECT COUNT(*)::INTEGER as count
      FROM iot_ai_analysis
    `;
    console.log(`\n📊 Total AI Analysis Records: ${totalAnalysis[0].count}`);

    // 4. Recent analysis (last 5 minutes)
    const recentAnalysis = await sql`
      SELECT 
        ia.camera_id,
        ia.person_count,
        ia.crowd_density,
        ia.created_at,
        bc.camera_name,
        bu.full_name as owner
      FROM iot_ai_analysis ia
      JOIN business_cameras bc ON ia.camera_id = bc.id
      JOIN business_users bu ON bc.business_user_id = bu.id
      WHERE ia.created_at >= NOW() - INTERVAL '5 minutes'
      ORDER BY ia.created_at DESC
      LIMIT 10
    `;
    console.log(`\n🕐 Recent Analysis (Last 5 minutes): ${recentAnalysis.length} records`);
    recentAnalysis.forEach(a => {
      console.log(`   ${a.camera_name}: ${a.person_count} people, density ${(a.crowd_density * 100).toFixed(1)}%, ${new Date(a.created_at).toLocaleTimeString('tr-TR')}`);
    });

    // 5. People count per business user (last 5 minutes)
    console.log(`\n👤 People Count per Business (Last 5 minutes):`);
    for (const user of users) {
      const peopleCount = await sql`
        SELECT 
          COALESCE(SUM(ia.person_count), 0)::INTEGER as total_people
        FROM iot_ai_analysis ia
        JOIN business_cameras bc ON ia.camera_id = bc.id
        WHERE bc.business_user_id = ${user.id}
          AND ia.created_at >= NOW() - INTERVAL '5 minutes'
      `;
      console.log(`   ${user.full_name}: ${peopleCount[0].total_people} people`);
    }

    // 6. Test the exact query used in /api/locations
    console.log(`\n🗺️ Testing /api/locations Query:`);
    const locationQuery = await sql`
      SELECT 
        bp.location_id,
        bp.business_name,
        bp.user_id as business_user_id,
        COALESCE((
          SELECT SUM(ia.person_count)
          FROM iot_ai_analysis ia
          JOIN business_cameras bc ON ia.camera_id = bc.id
          WHERE bc.business_user_id = bp.user_id
            AND ia.created_at >= NOW() - INTERVAL '5 minutes'
        ), 0)::INTEGER as current_people_count
      FROM business_profiles bp
      WHERE bp.is_visible_on_map = true
        AND bp.latitude IS NOT NULL
        AND bp.longitude IS NOT NULL
        AND bp.auto_sync_to_cityv = true
        AND bp.city = 'Ankara'
    `;
    
    console.log(`   Found ${locationQuery.length} locations on map:`);
    locationQuery.forEach(loc => {
      console.log(`   - ${loc.business_name}: ${loc.current_people_count} people`);
    });

    console.log('\n✅ Data check complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
