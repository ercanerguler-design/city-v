// Add test IoT data for camera
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL || '', {
  ssl: 'require'
});

async function addTestData() {
  try {
    console.log('📊 Adding test IoT data...\n');

    // Get camera
    const cameras = await sql`
      SELECT id, camera_name, business_user_id
      FROM business_cameras
      LIMIT 1
    `;

    if (cameras.length === 0) {
      console.log('❌ No cameras found');
      process.exit(1);
    }

    const camera = cameras[0];
    console.log(`📹 Using camera: ${camera.camera_name} (ID: ${camera.id})`);

    // Add 10 recent analysis records (last 5 minutes)
    console.log('\n📝 Inserting test data...');
    
    const testData = [
      { people: 15, density: 0.45, minutes: 1 },
      { people: 18, density: 0.52, minutes: 2 },
      { people: 12, density: 0.38, minutes: 2.5 },
      { people: 20, density: 0.61, minutes: 3 },
      { people: 17, density: 0.49, minutes: 3.5 },
      { people: 22, density: 0.67, minutes: 4 },
      { people: 16, density: 0.46, minutes: 4.2 },
      { people: 19, density: 0.55, minutes: 4.5 },
      { people: 14, density: 0.42, minutes: 4.7 },
      { people: 21, density: 0.63, minutes: 4.9 }
    ];

    for (const data of testData) {
      const timestamp = new Date(Date.now() - data.minutes * 60 * 1000);
      await sql`
        INSERT INTO iot_ai_analysis (
          camera_id,
          person_count,
          crowd_density,
          detection_objects,
          created_at
        ) VALUES (
          ${camera.id},
          ${data.people},
          ${data.density},
          ${JSON.stringify({
            people_in: Math.floor(data.people * 1.2),
            people_out: Math.floor(data.people * 0.8),
            current_occupancy: data.people,
            total_objects: data.people + Math.floor(Math.random() * 5),
            source: 'test_data'
          })},
          ${timestamp}
        )
      `;
      console.log(`   ✅ Added: ${data.people} people, ${(data.density * 100).toFixed(1)}% density, ${data.minutes} min ago`);
    }

    // Verify
    console.log('\n🔍 Verifying...');
    const recent = await sql`
      SELECT 
        person_count,
        crowd_density,
        created_at
      FROM iot_ai_analysis
      WHERE camera_id = ${camera.id}
        AND created_at >= NOW() - INTERVAL '5 minutes'
      ORDER BY created_at DESC
    `;

    console.log(`✅ Found ${recent.length} recent records`);
    
    const avgPeople = Math.round(recent.reduce((sum, r) => sum + r.person_count, 0) / recent.length);
    console.log(`📊 Average people count: ${avgPeople}`);

    console.log('\n✅ Test data added successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestData();
