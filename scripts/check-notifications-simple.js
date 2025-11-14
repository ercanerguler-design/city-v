require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n=== NOTIFICATION SYSTEM CHECK ===\n');
  
  // Table structure
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'business_notifications'
    ORDER BY ordinal_position
  `;
  
  console.log('✅ Table columns:');
  cols.forEach(c => console.log(`   ${c.column_name}: ${c.data_type}`));
  
  // Existing notifications
  const notifs = await sql`
    SELECT * FROM business_notifications 
    WHERE business_user_id = 20 
    ORDER BY created_at DESC 
    LIMIT 5
  `;
  
  console.log(`\n📬 Notifications: ${notifs.length} found\n`);
  notifs.forEach(n => {
    console.log(`   [${n.type}] ${n.message}`);
    console.log(`   Created: ${n.created_at}\n`);
  });
  
  console.log('🎯 TEST STEPS:');
  console.log('1. Go to http://localhost:3000');
  console.log('2. Click SCE INNOVATION');
  console.log('3. Add review (5 stars + happy sentiment)');
  console.log('4. Click heart to add to favorites');
  console.log('5. Run: node scripts/check-notifications-simple.js\n');
}

check().catch(console.error);
