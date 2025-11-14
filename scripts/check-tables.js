const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');
    
    // Tüm tabloları listele
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 All tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    console.log('');
    
    // business_users tablosu var mı?
    const businessUsersExists = tablesResult.rows.some(row => row.table_name === 'business_users');
    
    if (!businessUsersExists) {
      console.log('❌ business_users table NOT FOUND!');
      console.log('🔧 Business tables need to be created in Vercel database');
    } else {
      console.log('✅ business_users table exists');
      
      // business_users içindeki kayıtları say
      const countResult = await pool.query('SELECT COUNT(*) FROM business_users');
      console.log(`📊 business_users count: ${countResult.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();