// Add test IoT crowd analysis data for business cameras
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addTestCrowdData() {
  try {
    await client.connect();
    console.log('🔌 Database connected');

    // Get active business cameras
    const cameras = await client.query(`
      SELECT bc.id, bc.camera_name, bc.business_user_id, bp.business_name
      FROM business_cameras bc
      JOIN business_profiles bp ON bc.business_user_id = (
        SELECT user_id FROM business_profiles WHERE id = bp.id LIMIT 1
      )
      WHERE bc.is_active = true
      LIMIT 5
    `);

    console.log(`📹 Found ${cameras.rows.length} active cameras`);

    if (cameras.rows.length === 0) {
      console.log('⚠️  No active cameras found!');
      return;
    }

    // Generate test data for each camera (last 24 hours)
    const now = new Date();
    let insertCount = 0;

    for (const camera of cameras.rows) {
      console.log(`\n📊 Generating data for: ${camera.camera_name} (${camera.business_name})`);
      
      // Generate data points every 10 minutes for last 2 hours
      for (let i = 0; i < 12; i++) {
        const timestamp = new Date(now.getTime() - (i * 10 * 60 * 1000));
        const hour = timestamp.getHours();
        
        // Realistic person count based on time of day
        let personCount = 0;
        if (hour >= 7 && hour <= 9) { // Morning rush
          personCount = Math.floor(Math.random() * 8) + 2;
        } else if (hour >= 12 && hour <= 14) { // Lunch
          personCount = Math.floor(Math.random() * 10) + 3;
        } else if (hour >= 17 && hour <= 19) { // Evening
          personCount = Math.floor(Math.random() * 12) + 4;
        } else if (hour >= 10 && hour <= 16) { // Day
          personCount = Math.floor(Math.random() * 6) + 1;
        } else { // Night
          personCount = Math.floor(Math.random() * 2);
        }

        // Determine crowd density
        let crowdDensity = 'empty';
        if (personCount === 0) crowdDensity = 'empty';
        else if (personCount <= 3) crowdDensity = 'low';
        else if (personCount <= 6) crowdDensity = 'medium';
        else if (personCount <= 10) crowdDensity = 'high';
        else crowdDensity = 'overcrowded';

        const confidence = 0.75 + Math.random() * 0.2; // 75-95%

        try {
          await client.query(`
            INSERT INTO crowd_analysis (
              camera_id, people_count, crowd_level, timestamp, current_occupancy
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            camera.id,
            personCount,
            crowdDensity,
            timestamp,
            personCount
          ]);

          insertCount++;
        } catch (err) {
          console.error(`❌ Insert error for camera ${camera.id}:`, err.message);
        }
      }
    }

    console.log(`\n✅ Added ${insertCount} crowd analysis records`);

    // Show summary
    const summary = await client.query(`
      SELECT 
        COUNT(*) as total_records,
        AVG(people_count) as avg_people,
        MAX(people_count) as max_people,
        MIN(timestamp) as oldest,
        MAX(timestamp) as newest
      FROM crowd_analysis
      WHERE camera_id IN (${cameras.rows.map(c => c.id).join(',')})
    `);

    console.log('\n📈 Summary:', summary.rows[0]);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

addTestCrowdData();
