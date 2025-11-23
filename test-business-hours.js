// Test script to check business working hours in database
const { neon } = require('@neondatabase/serverless');

async function testBusinessHours() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔍 Checking business working hours...\n');
  
  const businesses = await sql`
    SELECT 
      id,
      business_name,
      working_hours
    FROM business_profiles
    WHERE id IN (15, 18, 19)
    ORDER BY id
  `;
  
  businesses.forEach(biz => {
    console.log(`\n📍 ${biz.business_name} (ID: ${biz.id})`);
    console.log(`   Working Hours:`, JSON.stringify(biz.working_hours, null, 2));
  });
  
  console.log('\n\n🕐 Current Time:', new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }));
  console.log('📅 Day:', ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][new Date().getDay()]);
}

testBusinessHours().catch(console.error);
