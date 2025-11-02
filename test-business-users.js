const { sql } = require('@vercel/postgres');

async function testBusinessUser() {
  try {
    console.log('🔍 Testing business users...');
    
    const result = await sql`
      SELECT email, is_active, added_by_admin, full_name
      FROM business_users 
      WHERE is_active = true
      LIMIT 5
    `;
    
    console.log('✅ Active business users:');
    console.table(result.rows);
    
    if (result.rows.length === 0) {
      console.log('❌ No active business users found!');
      console.log('💡 Create a test user first!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBusinessUser();
