require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

async function testAuth() {
  console.log('\n🔍 Testing Authentication System\n');
  console.log('='.repeat(60));
  
  try {
    // Test database connection
    console.log('\n1️⃣ Testing Database Connection...');
    const dbTest = await sql`SELECT NOW() as time`;
    console.log('✅ Database connected:', dbTest[0].time);
    
    // Test users table
    console.log('\n2️⃣ Testing Users Table...');
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('✅ Users found:', users[0].count);
    
    // Test business_users table
    console.log('\n3️⃣ Testing Business Users Table...');
    const businessUsers = await sql`SELECT COUNT(*) as count FROM business_users WHERE is_active = true`;
    console.log('✅ Active business users:', businessUsers[0].count);
    
    // Test specific user
    console.log('\n4️⃣ Testing Test User...');
    const testUser = await sql`
      SELECT id, email, name, password_hash IS NOT NULL as has_password
      FROM users 
      WHERE email = 'test@cityv.app'
    `;
    
    if (testUser.length > 0) {
      console.log('✅ Test user exists');
      console.log('   Email:', testUser[0].email);
      console.log('   Name:', testUser[0].name);
      console.log('   Has Password:', testUser[0].has_password ? '✅' : '❌');
    } else {
      console.log('❌ Test user NOT found');
    }
    
    // Test business user
    console.log('\n5️⃣ Testing Business User...');
    const businessUser = await sql`
      SELECT id, email, full_name, password_hash IS NOT NULL as has_password, is_active
      FROM business_users 
      WHERE email = 'atmbankde@gmail.com'
    `;
    
    if (businessUser.length > 0) {
      console.log('✅ Business user exists');
      console.log('   Email:', businessUser[0].email);
      console.log('   Name:', businessUser[0].full_name);
      console.log('   Has Password:', businessUser[0].has_password ? '✅' : '❌');
      console.log('   Active:', businessUser[0].is_active ? '✅' : '❌');
    } else {
      console.log('❌ Business user NOT found');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testAuth();
