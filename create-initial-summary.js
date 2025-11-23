const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createInitialSummary(businessUserId) {
  try {
    console.log(`📊 Creating initial daily summary for business ${businessUserId}...\n`);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if summary already exists
    const existing = await sql`
      SELECT id FROM daily_business_summaries
      WHERE business_user_id = ${businessUserId} AND summary_date = ${today}
    `;
    
    if (existing.length > 0) {
      console.log('✅ Summary already exists for today');
      return;
    }
    
    // Create initial summary with zero values
    await sql`
      INSERT INTO daily_business_summaries (
        business_user_id,
        summary_date,
        total_visitors,
        total_entries,
        total_exits,
        current_occupancy,
        avg_occupancy,
        max_occupancy,
        min_occupancy,
        avg_crowd_density,
        max_crowd_density,
        peak_hour,
        peak_hour_visitors,
        busiest_period,
        total_detections,
        active_cameras_count,
        total_analysis_records
      ) VALUES (
        ${businessUserId},
        ${today},
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 'morning',
        0, 0, 0
      )
    `;
    
    console.log(`✅ Initial summary created for ${today}`);
    console.log('\nℹ️  Summary will be updated automatically as IoT data comes in');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run for business ID 25
createInitialSummary(25);
