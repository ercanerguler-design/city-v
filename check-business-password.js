const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkBusinessUserPassword() {
  try {
    console.log('🔍 Checking atmbankde@gmail.com user...\n');
    
    const users = await sql`
      SELECT 
        id, email, password_hash, full_name, is_active, 
        membership_type, max_cameras, last_login
      FROM business_users 
      WHERE email = 'atmbankde@gmail.com'
    `;

    if (users.length === 0) {
      console.log('❌ User not found!');
      return;
    }

    const user = users[0];
    console.log('👤 User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.full_name}`);
    console.log(`   Active: ${user.is_active}`);
    console.log(`   Membership: ${user.membership_type}`);
    console.log(`   Max Cameras: ${user.max_cameras}`);
    console.log(`   Last Login: ${user.last_login || 'Never'}`);
    console.log(`   Password Hash: ${user.password_hash ? 'EXISTS' : 'NULL'}`);
    console.log(`   Hash Length: ${user.password_hash?.length || 0}`);
    
    // Test password
    console.log('\n🔑 Testing password "test123"...');
    const testPasswords = ['test123', 'password', '123456', 'cityv123'];
    
    for (const testPass of testPasswords) {
      const isValid = await bcrypt.compare(testPass, user.password_hash);
      console.log(`   "${testPass}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      if (isValid) break;
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBusinessUserPassword();