const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkBusinessData() {
  try {
    console.log('🔍 Checking business data consistency...\n');
    
    // Check business_users table
    const user = await sql`
      SELECT 
        id, 
        email, 
        full_name, 
        membership_type, 
        membership_expiry_date, 
        max_cameras,
        campaign_credits
      FROM business_users 
      WHERE id = 20
    `;
    
    console.log('👤 BUSINESS_USERS:');
    console.log(`   ID: ${user[0].id}`);
    console.log(`   Email: ${user[0].email}`);
    console.log(`   Name: ${user[0].full_name}`);
    console.log(`   Membership: ${user[0].membership_type}`);
    console.log(`   Max Cameras: ${user[0].max_cameras}`);
    console.log(`   Campaign Credits: ${user[0].campaign_credits || 0}`);
    
    // Check business_profiles table
    const profile = await sql`
      SELECT 
        id,
        business_name, 
        membership_tier,
        user_id
      FROM business_profiles 
      WHERE user_id = 20
    `;
    
    console.log('\n📊 BUSINESS_PROFILES:');
    if (profile.length > 0) {
      console.log(`   ID: ${profile[0].id}`);
      console.log(`   Business Name: ${profile[0].business_name}`);
      console.log(`   Membership Tier: ${profile[0].membership_tier || 'NULL'}`);
      console.log(`   User ID: ${profile[0].user_id}`);
    } else {
      console.log('   ❌ No profile found');
    }
    
    // Check for inconsistency
    console.log('\n🔍 CONSISTENCY CHECK:');
    if (user[0].membership_type !== profile[0]?.membership_tier) {
      console.log('   ❌ MISMATCH DETECTED!');
      console.log(`   business_users.membership_type: ${user[0].membership_type}`);
      console.log(`   business_profiles.membership_tier: ${profile[0]?.membership_tier || 'NULL'}`);
      console.log('\n   🔧 FIX: Update business_profiles.membership_tier');
    } else {
      console.log('   ✅ Membership data is consistent');
    }
    
    if (!user[0].campaign_credits || user[0].campaign_credits === 0) {
      console.log('\n   ⚠️ Campaign credits is 0 or NULL');
      console.log('   🔧 FIX: Set initial credits based on membership');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBusinessData();
