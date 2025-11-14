// Test the /api/business/me endpoint manually
const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

async function testBusinessMeAPI() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('\n🔍 Testing /api/business/me API response...\n');
  
  try {
    // Get user from database
    const userResult = await sql`
      SELECT 
        id, 
        email, 
        full_name, 
        phone,
        membership_type, 
        membership_expiry_date, 
        max_cameras,
        campaign_credits,
        license_key,
        subscription_tier,
        is_active,
        created_at
      FROM business_users
      WHERE email = 'atmbankde@gmail.com'
    `;
    
    if (userResult.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult[0];
    
    console.log('📋 Raw Database Data:');
    console.log(JSON.stringify(user, null, 2));
    
    // Simulate what the API would return
    const apiResponse = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        membership_type: user.membership_type || 'free',
        membership_expiry_date: user.membership_expiry_date,
        max_cameras: user.max_cameras || 1,
        campaign_credits: user.campaign_credits || 0,
        license_key: user.license_key,
        subscription_tier: user.subscription_tier,
        created_at: user.created_at
      }
    };
    
    console.log('\n📤 API Response would be:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n✅ Key Fields:');
    console.log('   membership_type:', apiResponse.user.membership_type);
    console.log('   subscription_tier:', apiResponse.user.subscription_tier);
    console.log('   campaign_credits:', apiResponse.user.campaign_credits);
    console.log('   license_key:', apiResponse.user.license_key);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBusinessMeAPI();
