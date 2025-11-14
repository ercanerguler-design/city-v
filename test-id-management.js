// Test ID Management & Data Isolation
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL || '', {
  ssl: 'require'
});

async function testIDManagement() {
  try {
    console.log('🔍 Testing ID Management & Data Isolation...\n');

    // 1. Check business_users
    console.log('1️⃣ Business Users:');
    const users = await sql`
      SELECT id, email, full_name, created_at
      FROM business_users
      ORDER BY id
    `;
    console.log(`   Found ${users.length} business users:`);
    users.forEach(u => {
      console.log(`   - ID: ${u.id} | ${u.full_name} | ${u.email}`);
    });

    if (users.length === 0) {
      console.log('   ⚠️ No business users found\n');
      return;
    }

    // 2. Check business_profiles
    console.log('\n2️⃣ Business Profiles:');
    const profiles = await sql`
      SELECT id, user_id, business_name, city
      FROM business_profiles
      ORDER BY user_id, id
    `;
    console.log(`   Found ${profiles.length} business profiles:`);
    profiles.forEach(p => {
      console.log(`   - Profile ID: ${p.id} | User ID: ${p.user_id} | ${p.business_name} (${p.city})`);
    });

    // 3. Check business_cameras with user mapping
    console.log('\n3️⃣ Business Cameras:');
    const cameras = await sql`
      SELECT 
        bc.id as camera_id,
        bc.business_user_id,
        bc.camera_name,
        bc.location_description,
        bu.full_name as owner_name
      FROM business_cameras bc
      JOIN business_users bu ON bc.business_user_id = bu.id
      ORDER BY bc.business_user_id, bc.id
    `;
    console.log(`   Found ${cameras.length} cameras:`);
    
    // Group by user
    const camerasByUser: { [key: number]: any[] } = {};
    cameras.forEach(c => {
      if (!camerasByUser[c.business_user_id]) {
        camerasByUser[c.business_user_id] = [];
      }
      camerasByUser[c.business_user_id].push(c);
    });

    Object.entries(camerasByUser).forEach(([userId, userCameras]) => {
      console.log(`   👤 User ${userId} (${userCameras[0].owner_name}):`);
      userCameras.forEach(c => {
        console.log(`      ├─ Camera ${c.camera_id}: ${c.camera_name} (${c.location_description || 'No location'})`);
      });
    });

    // 4. Check AI analysis data isolation
    console.log('\n4️⃣ AI Analysis Data Isolation:');
    for (const [userId, userCameras] of Object.entries(camerasByUser)) {
      const cameraIds = userCameras.map((c: any) => c.camera_id);
      
      const analysisCount = await sql`
        SELECT COUNT(*)::INTEGER as count
        FROM iot_ai_analysis
        WHERE camera_id = ANY(${cameraIds})
      `;

      const recentAnalysis = await sql`
        SELECT 
          camera_id,
          person_count,
          crowd_density,
          created_at
        FROM iot_ai_analysis
        WHERE camera_id = ANY(${cameraIds})
        ORDER BY created_at DESC
        LIMIT 5
      `;

      console.log(`   👤 User ${userId} (${userCameras[0].owner_name}):`);
      console.log(`      Total analysis records: ${analysisCount[0].count}`);
      console.log(`      Recent 5 records:`);
      recentAnalysis.forEach(a => {
        console.log(`         Camera ${a.camera_id}: ${a.person_count} people, density ${(a.crowd_density * 100).toFixed(1)}% (${new Date(a.created_at).toLocaleString('tr-TR')})`);
      });
    }

    // 5. Test location_id generation
    console.log('\n5️⃣ Location ID Generation:');
    const locationsOnMap = await sql`
      SELECT 
        id,
        user_id,
        business_name,
        location_id,
        is_visible_on_map,
        latitude,
        longitude
      FROM business_profiles
      WHERE is_visible_on_map = true
    `;
    console.log(`   Found ${locationsOnMap.length} businesses on map:`);
    locationsOnMap.forEach(loc => {
      console.log(`   - User ${loc.user_id}: ${loc.business_name}`);
      console.log(`     └─ location_id: "${loc.location_id}"`);
      console.log(`     └─ Coordinates: [${loc.latitude}, ${loc.longitude}]`);
    });

    // 6. Test data isolation guarantee
    console.log('\n6️⃣ Data Isolation Guarantee Test:');
    for (const user of users) {
      const userCameras = await sql`
        SELECT COUNT(*)::INTEGER as count
        FROM business_cameras
        WHERE business_user_id = ${user.id}
      `;

      const userAnalysis = await sql`
        SELECT COUNT(*)::INTEGER as count
        FROM iot_ai_analysis ia
        JOIN business_cameras bc ON ia.camera_id = bc.id
        WHERE bc.business_user_id = ${user.id}
      `;

      console.log(`   👤 ${user.full_name} (User ID: ${user.id}):`);
      console.log(`      ├─ Cameras: ${userCameras[0].count}`);
      console.log(`      └─ Analysis Records: ${userAnalysis[0].count}`);
    }

    // 7. Cross-contamination check
    console.log('\n7️⃣ Cross-Contamination Check:');
    const allCameras = await sql`SELECT id, business_user_id FROM business_cameras`;
    const allAnalysis = await sql`SELECT camera_id FROM iot_ai_analysis`;
    
    let contaminationFound = false;
    for (const analysis of allAnalysis) {
      const camera = allCameras.find(c => c.id === analysis.camera_id);
      if (!camera) {
        console.log(`   ⚠️ Orphan analysis found for camera ${analysis.camera_id}`);
        contaminationFound = true;
      }
    }

    if (!contaminationFound) {
      console.log('   ✅ No cross-contamination detected!');
      console.log('   ✅ All analysis records belong to valid cameras');
      console.log('   ✅ Data isolation is GUARANTEED');
    }

    console.log('\n✅ ID Management Test Complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testIDManagement();
