const { sql } = require('@vercel/postgres');

async function resetBusinessData() {
  try {
    console.log('🗑️  Resetting business data for user 23...\n');

    // 1. Delete all IoT AI analysis data
    const iotResult = await sql`
      DELETE FROM iot_ai_analysis 
      WHERE camera_id IN (
        SELECT id FROM business_cameras WHERE business_user_id = 23
      )
    `;
    console.log('✅ IoT analysis data deleted:', iotResult.rowCount);

    // 2. Delete daily summaries
    const summaryResult = await sql`
      DELETE FROM daily_business_summaries 
      WHERE business_user_id = 23
    `;
    console.log('✅ Daily summaries deleted:', summaryResult.rowCount);

    // 3. Verify deletion
    const checkIoT = await sql`
      SELECT COUNT(*) as count 
      FROM iot_ai_analysis ia
      JOIN business_cameras bc ON ia.camera_id = bc.id
      WHERE bc.business_user_id = 23
    `;
    console.log('📊 Remaining IoT records:', checkIoT.rows[0].count);

    const checkSummary = await sql`
      SELECT COUNT(*) as count 
      FROM daily_business_summaries 
      WHERE business_user_id = 23
    `;
    console.log('📊 Remaining summaries:', checkSummary.rows[0].count);

    console.log('\n🎉 All business data reset successfully!');
    console.log('✨ New data will start accumulating when cameras send data.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetBusinessData();
