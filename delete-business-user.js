const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function deleteBusinessUser() {
  try {
    const email = 'merveerguler93@gmail.com';
    
    console.log(`🗑️ Deleting business user: ${email}\n`);
    
    // 1. User ID'yi bul
    const users = await sql`
      SELECT id, email, full_name FROM business_users 
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      console.log('❌ Kullanıcı bulunamadı');
      return;
    }
    
    const userId = users[0].id;
    console.log(`📋 Found user ID: ${userId}`);
    
    // 2. İlişkili kayıtları kontrol et
    const profiles = await sql`SELECT id FROM business_profiles WHERE user_id = ${userId}`;
    console.log(`📋 Business profiles: ${profiles.length}`);
    
    // 3. Transaction ile sil
    console.log('\n🗑️ Starting deletion...\n');
    
    if (profiles.length > 0) {
      const profileIds = profiles.map(p => p.id);
      
      // Campaigns (try-catch çünkü tablo olmayabilir)
      try {
        const campaigns = await sql`DELETE FROM business_campaigns WHERE profile_id = ANY(${profileIds}) RETURNING id`;
        console.log(`✅ Deleted ${campaigns.length} campaigns`);
      } catch (e) {
        console.log(`ℹ️ No campaigns found or table doesn't exist`);
      }
    }
    
    // Cameras (business_user_id ile)
    try {
      const cameras = await sql`DELETE FROM business_cameras WHERE business_user_id = ${userId} RETURNING id`;
      console.log(`✅ Deleted ${cameras.length} cameras`);
    } catch (e) {
      console.log(`ℹ️ No cameras found or table doesn't exist`);
    }
    
    // Subscriptions
    const subs = await sql`DELETE FROM business_subscriptions WHERE user_id = ${userId} RETURNING id`;
    console.log(`✅ Deleted ${subs.length} subscriptions`);
    
    // Profiles
    const profs = await sql`DELETE FROM business_profiles WHERE user_id = ${userId} RETURNING id`;
    console.log(`✅ Deleted ${profs.length} profiles`);
    
    // User
    const user = await sql`DELETE FROM business_users WHERE id = ${userId} RETURNING email`;
    console.log(`✅ Deleted user: ${user[0].email}`);
    
    console.log('\n✅ User and all related records deleted successfully!');
    
    // Verify
    const verify = await sql`SELECT email FROM business_users WHERE email = ${email}`;
    console.log(`\n🔍 Verification: ${verify.length === 0 ? '✅ User not found (deleted)' : '❌ User still exists!'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteBusinessUser();
