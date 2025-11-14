require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addDemoIoTData() {
  try {
    console.log('📊 Adding demo IoT hourly data...');

    // Get SCE INNOVATION camera ID
    const camera = await sql`
      SELECT bc.id as camera_id 
      FROM business_cameras bc
      JOIN business_users bu ON bc.business_user_id = bu.id
      WHERE bu.id = 20 AND bc.camera_name = 'Salon'
      LIMIT 1
    `;

    if (camera.length === 0) {
      console.error('❌ Camera not found!');
      process.exit(1);
    }

    const cameraId = camera[0].camera_id;
    console.log(`✅ Camera ID: ${cameraId}`);

    // Delete old data for today
    await sql`
      DELETE FROM iot_ai_analysis 
      WHERE camera_id = ${cameraId} 
      AND DATE(created_at) = CURRENT_DATE
    `;

    console.log('🗑️ Old data cleared');

    // Insert hourly data for today (8 AM - 11 PM)
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    
    for (const hour of hours) {
      // Realistic crowd patterns
      let personCount;
      if (hour >= 8 && hour < 11) {
        personCount = Math.floor(Math.random() * 15 + 10); // Morning: 10-25
      } else if (hour >= 12 && hour < 14) {
        personCount = Math.floor(Math.random() * 30 + 40); // Lunch peak: 40-70
      } else if (hour >= 14 && hour < 17) {
        personCount = Math.floor(Math.random() * 20 + 25); // Afternoon: 25-45
      } else if (hour >= 18 && hour < 21) {
        personCount = Math.floor(Math.random() * 35 + 50); // Evening peak: 50-85
      } else {
        personCount = Math.floor(Math.random() * 15 + 5); // Night: 5-20
      }

      const crowdDensity = personCount / 100; // 0.0 - 0.85
      const peopleIn = Math.floor(personCount * (Math.random() * 0.5 + 1.2));
      const peopleOut = peopleIn - personCount;

      const timestamp = new Date();
      timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

      await sql`
        INSERT INTO iot_ai_analysis (
          camera_id, 
          person_count, 
          crowd_density,
          detection_objects,
          created_at
        ) VALUES (
          ${cameraId},
          ${personCount},
          ${crowdDensity},
          ${JSON.stringify({
            current_occupancy: personCount,
            people_in: peopleIn,
            people_out: peopleOut,
            zones: ['entrance', 'dining', 'counter']
          })},
          ${timestamp.toISOString()}
        )
      `;

      console.log(`✅ Hour ${hour}:00 - ${personCount} people`);
    }

    console.log('✅ Demo data added successfully!');

    // Summary
    const summary = await sql`
      SELECT 
        COUNT(*) as total_records,
        SUM(person_count) as total_people,
        AVG(person_count) as avg_people,
        MAX(person_count) as max_people
      FROM iot_ai_analysis
      WHERE camera_id = ${cameraId}
      AND DATE(created_at) = CURRENT_DATE
    `;

    console.log('\n📊 Summary:');
    console.log(`Total records: ${summary[0].total_records}`);
    console.log(`Total people: ${summary[0].total_people}`);
    console.log(`Average: ${Math.round(summary[0].avg_people)}`);
    console.log(`Peak: ${summary[0].max_people}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

addDemoIoTData();
