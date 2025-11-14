const { sql } = require('@vercel/postgres');

async function checkWorkingHours() {
  try {
    console.log('🕐 Checking business working hours...\n');

    const profiles = await sql`
      SELECT id, user_id, business_name, working_hours
      FROM business_profiles 
      WHERE user_id IN (6, 8)
    `;

    console.log('📊 Found profiles:', profiles.rows.length);
    
    profiles.rows.forEach(p => {
      console.log(`\n📍 ${p.business_name} (id: ${p.id}, user_id: ${p.user_id})`);
      console.log(`   24/7: ${p.working_hours?.isOpen24Hours || false}`);
      console.log(`   Working Hours:`, p.working_hours);
      
      if (p.working_hours) {
        console.log('   Days:');
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
          if (p.working_hours[day]) {
            console.log(`      ${day}: ${p.working_hours[day].isOpen ? `${p.working_hours[day].openTime} - ${p.working_hours[day].closeTime}` : 'Kapalı'}`);
          }
        });
      }
    });

    // Şu anki durumu test et
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`\n⏰ Current Time: ${currentTime} (${currentDay})`);
    
    profiles.rows.forEach(p => {
      if (p.working_hours && p.working_hours[currentDay]) {
        const todayHours = p.working_hours[currentDay];
        console.log(`\n${p.business_name}:`);
        console.log(`   Today (${currentDay}): ${todayHours.isOpen ? `${todayHours.openTime} - ${todayHours.closeTime}` : 'Kapalı'}`);
        
        if (todayHours.isOpen) {
          const [openH, openM] = todayHours.openTime.split(':').map(Number);
          const [closeH, closeM] = todayHours.closeTime.split(':').map(Number);
          const [nowH, nowM] = [now.getHours(), now.getMinutes()];
          
          const openTime = openH * 60 + openM;
          const closeTime = closeH * 60 + closeM;
          const nowTime = nowH * 60 + nowM;
          
          const isOpen = nowTime >= openTime && nowTime <= closeTime;
          console.log(`   Status: ${isOpen ? '✅ AÇIK' : '❌ KAPALI'} (Current: ${currentTime}, Open: ${todayHours.openTime}, Close: ${todayHours.closeTime})`);
        } else {
          console.log(`   Status: ❌ KAPALI (Bugün çalışmıyor)`);
        }
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkWorkingHours();
