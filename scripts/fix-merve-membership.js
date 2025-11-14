require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixMerveMembership() {
  try {
    console.log('🔧 Fixing merveerguler93@gmail.com membership...\n');
    
    // Üyelik bitiş tarihi: 1 yıl sonra
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    const result = await pool.query(`
      UPDATE business_users 
      SET 
        membership_type = 'enterprise',
        membership_expiry_date = $1,
        max_cameras = 50,
        campaign_credits = 75,
        subscription_tier = 'enterprise'
      WHERE email = 'merveerguler93@gmail.com'
      RETURNING id, email, membership_type, membership_expiry_date, max_cameras, campaign_credits
    `, [expiryDate]);
    
    if (result.rows.length > 0) {
      console.log('✅ Membership updated:', result.rows[0]);
      console.log('\n📅 Expiry Date:', new Date(result.rows[0].membership_expiry_date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixMerveMembership();
