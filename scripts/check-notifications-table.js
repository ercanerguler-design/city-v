const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkNotifications() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('\n📋 Checking business_notifications table...\n');
  
  try {
    // Check if table exists
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'business_notifications'
      ORDER BY ordinal_position
    `;
    
    if (result.length === 0) {
      console.log('❌ Table business_notifications does NOT exist');
      return false;
    }
    
    console.log('✅ Table business_notifications exists with columns:');
    result.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

checkNotifications();
