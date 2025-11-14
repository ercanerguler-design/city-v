const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkBusinessUserData() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('\n🔍 Checking business user data for atmbankde@gmail.com...\n');
  
  try {
    // Get user data
    const user = await sql`
      SELECT 
        id,
        email,
        full_name,
        membership_type,
        subscription_tier,
        campaign_credits,
        license_key,
        membership_expiry_date,
        max_cameras,
        is_active
      FROM business_users
      WHERE email = 'atmbankde@gmail.com'
    `;
    
    if (user.length === 0) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user[0].id);
    console.log('   Email:', user[0].email);
    console.log('   Full Name:', user[0].full_name);
    console.log('   Membership Type:', user[0].membership_type);
    console.log('   Subscription Tier:', user[0].subscription_tier);
    console.log('   Campaign Credits:', user[0].campaign_credits);
    console.log('   License Key:', user[0].license_key);
    console.log('   Membership Expiry:', user[0].membership_expiry_date);
    console.log('   Max Cameras:', user[0].max_cameras);
    console.log('   Is Active:', user[0].is_active);
    
    // Check what API would return
    console.log('\n📋 API Response would be:');
    console.log(JSON.stringify({
      id: user[0].id,
      email: user[0].email,
      fullName: user[0].full_name,
      membership_type: user[0].membership_type || 'free',
      subscription_tier: user[0].subscription_tier,
      campaign_credits: user[0].campaign_credits || 0,
      license_key: user[0].license_key,
      membership_expiry_date: user[0].membership_expiry_date,
      max_cameras: user[0].max_cameras || 1
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBusinessUserData();
