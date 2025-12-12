// Vercel Production Test - Neon DB Connection
require('dotenv').config({ path: '.env.local' });

async function testVercelConnection() {
  console.log('\n🔍 Vercel Production Connection Test\n');
  console.log('=' .repeat(60));
  
  try {
    // Neon DB bağlantısını test et
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
    
    console.log('\n1️⃣ Database Connection Test...');
    
    // Basit sorgu
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Database connected successfully!');
    console.log('   Time:', result[0].current_time);
    console.log('   PostgreSQL:', result[0].pg_version.substring(0, 50) + '...');
    
    // Users tablosu test
    console.log('\n2️⃣ Users Table Test...');
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('✅ Users table accessible');
    console.log('   Total users:', users[0].count);
    
    // Business users test
    console.log('\n3️⃣ Business Users Table Test...');
    const businessUsers = await sql`SELECT COUNT(*) as count FROM business_users`;
    console.log('✅ Business users table accessible');
    console.log('   Total business users:', businessUsers[0].count);
    
    // Test user check
    console.log('\n4️⃣ Test User Authentication...');
    const testUser = await sql`
      SELECT id, email, name, password_hash, google_id, membership_tier
      FROM users 
      WHERE email = 'test@cityv.app'
    `;
    
    if (testUser.length > 0) {
      console.log('✅ Test user exists');
      console.log('   ID:', testUser[0].id);
      console.log('   Name:', testUser[0].name);
      console.log('   Has Password:', testUser[0].password_hash ? '✅ Yes' : '❌ No');
      console.log('   Google ID:', testUser[0].google_id || 'None');
      console.log('   Tier:', testUser[0].membership_tier);
    } else {
      console.log('❌ Test user not found!');
    }
    
    // Business user check
    console.log('\n5️⃣ Business User Check...');
    const businessUser = await sql`
      SELECT id, email, full_name, password_hash, is_active, membership_type
      FROM business_users 
      WHERE email = 'atmbankde@gmail.com'
    `;
    
    if (businessUser.length > 0) {
      console.log('✅ Business user exists');
      console.log('   ID:', businessUser[0].id);
      console.log('   Name:', businessUser[0].full_name);
      console.log('   Active:', businessUser[0].is_active ? '✅ Yes' : '❌ No');
      console.log('   Has Password:', businessUser[0].password_hash ? '✅ Yes' : '❌ No');
      console.log('   Type:', businessUser[0].membership_type);
    } else {
      console.log('❌ Business user not found!');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ ALL CHECKS PASSED - Database is working!\n');
    
    console.log('📋 TROUBLESHOOTING STEPS FOR VERCEL:\n');
    console.log('1. Check Vercel Deployment Logs:');
    console.log('   https://vercel.com/dashboard → Your Project → Deployments');
    console.log('');
    console.log('2. Check Environment Variables:');
    console.log('   Settings → Environment Variables');
    console.log('   - DATABASE_URL should be set');
    console.log('   - NEXT_PUBLIC_GOOGLE_CLIENT_ID should be set');
    console.log('');
    console.log('3. Check Google Console:');
    console.log('   https://console.cloud.google.com/apis/credentials');
    console.log('   - Add Vercel domain to Authorized origins');
    console.log('');
    console.log('4. Check Browser Console:');
    console.log('   F12 → Console tab → Look for errors');
    console.log('');
    console.log('5. Test API Endpoints:');
    console.log('   https://your-domain.vercel.app/api/auth/login');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ CONNECTION ERROR:', error.message);
    console.error('\nFull error:', error);
    
    console.log('\n⚠️ POSSIBLE CAUSES:');
    console.log('1. DATABASE_URL not set in .env.local');
    console.log('2. Neon DB credentials expired');
    console.log('3. Network connection issue');
    console.log('4. Database tables not created');
  }
}

testVercelConnection();
