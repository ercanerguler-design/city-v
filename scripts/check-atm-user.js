require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkAtmUser() {
  try {
    const result = await sql`
      SELECT 
        id, 
        email, 
        full_name,
        membership_type, 
        membership_expiry_date, 
        campaign_credits, 
        license_key,
        subscription_tier,
        max_cameras,
        is_active,
        added_by_admin
      FROM business_users 
      WHERE email = 'atmbankde@gmail.com'
    `;
    
    if (result.length === 0) {
      console.log('❌ Kullanıcı bulunamadı!');
      return;
    }
    
    console.log('✅ ATM Bank User Data:');
    console.log(JSON.stringify(result[0], null, 2));
    
    console.log('\n📅 Expiry Date:', result[0].membership_expiry_date ? 
      new Date(result[0].membership_expiry_date).toLocaleDateString('tr-TR') : 'NULL');
      
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAtmUser();
