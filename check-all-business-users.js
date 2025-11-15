const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkAllBusinessUsers() {
  try {
    console.log('🔍 Checking all business users (including inactive)...\n');
    
    const users = await sql`
      SELECT 
        id, 
        email, 
        full_name, 
        membership_type,
        is_active,
        created_at
      FROM business_users 
      ORDER BY created_at DESC
    `;

    console.log(`📊 Total records in database: ${users.length}\n`);
    
    const activeUsers = users.filter(u => u.is_active);
    const inactiveUsers = users.filter(u => !u.is_active);
    
    console.log(`✅ Active users: ${activeUsers.length}`);
    activeUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.full_name || 'No name'}) - ${u.membership_type}`);
    });
    
    console.log(`\n❌ Inactive/Deleted users: ${inactiveUsers.length}`);
    inactiveUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.full_name || 'No name'}) - DELETED`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllBusinessUsers();
