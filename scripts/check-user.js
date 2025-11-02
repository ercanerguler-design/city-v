const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUser() {
  try {
    console.log('🔍 Checking user in database...\n');
    
    // User bilgisi
    const userResult = await pool.query(
      'SELECT id, email, full_name, is_active, added_by_admin FROM business_users WHERE email = $1',
      ['merveerguler93@gmail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found!');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.full_name);
    console.log('   Active:', user.is_active);
    console.log('   Added by admin:', user.added_by_admin);
    console.log('');
    
    // Subscription bilgisi
    const subResult = await pool.query(
      'SELECT plan_type, end_date, camera_count, is_active FROM business_subscriptions WHERE user_id = $1',
      [user.id]
    );
    
    if (subResult.rows.length === 0) {
      console.log('⚠️  No subscription found');
    } else {
      console.log('📋 Subscription:');
      subResult.rows.forEach((sub, i) => {
        console.log(`   [${i + 1}] Plan: ${sub.plan_type}, Cameras: ${sub.camera_count}, Active: ${sub.is_active}, End: ${sub.end_date}`);
      });
    }
    console.log('');
    
    // Profile bilgisi
    const profileResult = await pool.query(
      'SELECT business_name, business_type FROM business_profiles WHERE user_id = $1',
      [user.id]
    );
    
    if (profileResult.rows.length === 0) {
      console.log('⚠️  No profile found');
    } else {
      const profile = profileResult.rows[0];
      console.log('🏢 Profile:');
      console.log('   Business name:', profile.business_name);
      console.log('   Business type:', profile.business_type);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUser();
