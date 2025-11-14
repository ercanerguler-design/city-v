const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixBusinessData() {
  try {
    console.log('🔧 Fixing business data...\n');
    
    const userId = 20;
    
    // 1. Check current state
    const user = await sql`
      SELECT 
        id, 
        email, 
        membership_type, 
        max_cameras,
        campaign_credits
      FROM business_users 
      WHERE id = ${userId}
    `;
    
    console.log('📊 Current State:');
    console.log(`   Membership: ${user[0].membership_type}`);
    console.log(`   Max Cameras: ${user[0].max_cameras}`);
    console.log(`   Campaign Credits: ${user[0].campaign_credits || 0}`);
    
    // 2. Fix credits if needed
    if (!user[0].campaign_credits || user[0].campaign_credits < 50) {
      console.log('\n🔧 Fixing campaign credits...');
      
      const creditAmount = user[0].membership_type === 'enterprise' ? 100 : 
                           user[0].membership_type === 'premium' ? 50 : 10;
      
      await sql`
        UPDATE business_users 
        SET campaign_credits = ${creditAmount}
        WHERE id = ${userId}
      `;
      
      console.log(`✅ Campaign credits updated to ${creditAmount}`);
    }
    
    // 3. Verify final state
    const finalUser = await sql`
      SELECT 
        id, 
        email, 
        full_name,
        membership_type, 
        max_cameras,
        campaign_credits,
        membership_expiry_date
      FROM business_users 
      WHERE id = ${userId}
    `;
    
    console.log('\n✅ Final State:');
    console.log(`   Name: ${finalUser[0].full_name}`);
    console.log(`   Email: ${finalUser[0].email}`);
    console.log(`   Membership: ${finalUser[0].membership_type}`);
    console.log(`   Max Cameras: ${finalUser[0].max_cameras}`);
    console.log(`   Campaign Credits: ${finalUser[0].campaign_credits}`);
    console.log(`   Expiry: ${finalUser[0].membership_expiry_date}`);
    
    console.log('\n🎉 All data is now correct!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixBusinessData();
