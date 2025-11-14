require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkBusinessUsers() {
  try {
    console.log('🔍 Checking business_users...\n');
    
    const result = await pool.query(`
      SELECT id, email, full_name, is_active, added_by_admin, created_at
      FROM business_users 
      ORDER BY id
    `);
    
    console.log('📋 All business users:');
    result.rows.forEach(user => {
      console.log(`   ID: ${user.id} | Email: ${user.email} | Name: ${user.full_name} | Active: ${user.is_active} | Added: ${user.added_by_admin}`);
    });
    
    console.log('');
    
    // merveerguler93@gmail.com özel kontrol
    const merveResult = await pool.query(
      'SELECT * FROM business_users WHERE email = $1',
      ['merveerguler93@gmail.com']
    );
    
    if (merveResult.rows.length > 0) {
      console.log('✅ merveerguler93@gmail.com found:', merveResult.rows[0]);
    } else {
      console.log('❌ merveerguler93@gmail.com NOT FOUND');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkBusinessUsers();