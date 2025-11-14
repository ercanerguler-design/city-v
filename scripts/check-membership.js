const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkMembership() {
  try {
    console.log('🔍 Checking business user membership...\n');
    
    const result = await sql`
      SELECT 
        id, 
        email, 
        full_name, 
        membership_type, 
        membership_expiry_date, 
        max_cameras 
      FROM business_users 
      WHERE id = 20
    `;
    
    if (result.length > 0) {
      const user = result[0];
      console.log('✅ User found:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.full_name}`);
      console.log(`   Membership: ${user.membership_type || 'NULL'}`);
      console.log(`   Expiry: ${user.membership_expiry_date || 'NULL'}`);
      console.log(`   Max Cameras: ${user.max_cameras}`);
      
      if (!user.membership_type || user.membership_type === 'free') {
        console.log('\n⚠️  Membership type is incorrect!');
        console.log('   Expected: enterprise or premium');
        console.log(`   Current: ${user.membership_type || 'NULL'}`);
      }
    } else {
      console.log('❌ User not found!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMembership();
