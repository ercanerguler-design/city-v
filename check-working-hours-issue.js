require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkWorkingHours() {
  try {
    // Business user 23'ün working_hours'ını kontrol et
    const result = await pool.query(`
      SELECT 
        user_id,
        business_name,
        working_hours
      FROM business_profiles
      WHERE user_id = 23
    `);
    
    if (result.rowCount === 0) {
      console.log('❌ Business profile bulunamadı (user_id=23)');
    } else {
      console.log('📋 Working Hours Data:');
      console.log('Business:', result.rows[0].business_name);
      console.log('\nWorking Hours (Raw):');
      console.log(JSON.stringify(result.rows[0].working_hours, null, 2));
      
      // Monday'i detaylı göster
      if (result.rows[0].working_hours && result.rows[0].working_hours.monday) {
        console.log('\n📅 Pazartesi Detay:');
        console.log(result.rows[0].working_hours.monday);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkWorkingHours();
