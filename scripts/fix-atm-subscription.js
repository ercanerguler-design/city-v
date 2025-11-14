require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAtmSubscriptionTier() {
  try {
    console.log('🔧 Fixing atmbankde@gmail.com subscription_tier...\n');
    
    const result = await pool.query(`
      UPDATE business_users 
      SET subscription_tier = 'enterprise'
      WHERE email = 'atmbankde@gmail.com'
      RETURNING id, email, membership_type, subscription_tier, campaign_credits, license_key
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Subscription tier updated:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixAtmSubscriptionTier();
