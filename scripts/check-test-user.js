const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTestUser() {
  try {
    console.log('🔍 Checking test@business.com in database...\n');
    
    const userResult = await pool.query(
      'SELECT id, email, full_name, is_active, added_by_admin FROM business_users WHERE email = $1',
      ['test@business.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ test@business.com NOT FOUND!');
    } else {
      console.log('✅ test@business.com found:', userResult.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTestUser();