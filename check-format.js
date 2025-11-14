require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkFormat() {
  try {
    const result = await sql`
      SELECT 
        user_id, 
        business_name, 
        working_hours->'monday' as monday_hours 
      FROM business_profiles 
      WHERE user_id IN (6, 20)
    `;
    
    console.log('📋 Working Hours Format Check:\n');
    
    result.rows.forEach(row => {
      console.log(`Business: ${row.business_name}`);
      console.log(`User ID: ${row.user_id}`);
      console.log(`Monday:`, JSON.stringify(row.monday_hours, null, 2));
      console.log('---\n');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFormat();
