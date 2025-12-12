require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBusiness() {
  try {
    console.log('🔍 Checking business 6 category...');
    
    const profile = await sql`
      SELECT id, user_id, business_name, business_category 
      FROM business_profiles 
      WHERE user_id = 6
    `;
    
    console.log('Business Profile:', JSON.stringify(profile, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBusiness();
