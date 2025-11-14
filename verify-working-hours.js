require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function verifyHours() {
  console.log('🔍 Database working_hours kontrolü...\n');
  
  const result = await sql`
    SELECT 
      user_id,
      business_name,
      working_hours
    FROM business_profiles 
    WHERE user_id = 6
  `;

  if (result.rows.length > 0) {
    const row = result.rows[0];
    console.log('📋 Business Name:', row.business_name);
    console.log('📋 User ID:', row.user_id);
    console.log('\n🕐 Working Hours:');
    console.log(JSON.stringify(row.working_hours, null, 2));
    
    if (row.working_hours && row.working_hours.friday) {
      console.log('\n✅ Friday Details:');
      console.log('  - isOpen:', row.working_hours.friday.isOpen);
      console.log('  - openTime:', row.working_hours.friday.openTime);
      console.log('  - closeTime:', row.working_hours.friday.closeTime);
      
      const now = new Date();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = dayNames[now.getDay()];
      
      console.log(`\n📅 Bugün: ${today} (${now.toLocaleString('tr-TR')})`);
      
      const todayHours = row.working_hours[today];
      if (todayHours) {
        console.log(`🕐 Bugün açılış: ${todayHours.openTime}`);
        console.log(`🕐 Bugün kapanış: ${todayHours.closeTime}`);
        console.log(`✅ Açık mı: ${todayHours.isOpen ? 'EVET' : 'HAYIR'}`);
      }
    }
  } else {
    console.log('❌ Business bulunamadı!');
  }
}

verifyHours().catch(console.error);
