require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkUser() {
  try {
    const result = await sql`
      SELECT 
        id, 
        email, 
        membership_type, 
        membership_expiry_date, 
        campaign_credits, 
        license_key,
        subscription_tier
      FROM business_users 
      WHERE email = 'merveerguler93@gmail.com'
    `;
    
    console.log('✅ User Data:');
    console.log(JSON.stringify(result[0], null, 2));
    
    console.log('\n📅 Expiry Date:', result[0].membership_expiry_date ? 
      new Date(result[0].membership_expiry_date).toLocaleDateString('tr-TR') : 'NULL');
      
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUser();
