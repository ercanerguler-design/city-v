require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function addWorkingHours() {
  try {
    console.log('🕐 Adding working hours to business profiles...\n');

    // Örnek çalışma saatleri: Hafta içi 09:00-18:00, Cumartesi 10:00-16:00, Pazar kapalı
    const workingHours = {
      isOpen24Hours: false,
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '16:00' },
      sunday: { isOpen: false, openTime: '', closeTime: '' }
    };

    const result = await sql`
      UPDATE business_profiles
      SET working_hours = ${JSON.stringify(workingHours)}::jsonb
      WHERE user_id IN (6, 8)
      RETURNING id, user_id, business_name, working_hours
    `;

    console.log('✅ Updated profiles:', result.rows.length);
    result.rows.forEach(p => {
      console.log(`\n📍 ${p.business_name} (user_id: ${p.user_id})`);
      console.log('   Working Hours:', p.working_hours);
    });

    // Şu anki durumu test et
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`\n⏰ Current: ${currentTime} (${currentDay})`);
    
    const todayHours = workingHours[currentDay];
    if (todayHours && todayHours.isOpen) {
      const [openH, openM] = todayHours.openTime.split(':').map(Number);
      const [closeH, closeM] = todayHours.closeTime.split(':').map(Number);
      const [nowH, nowM] = [now.getHours(), now.getMinutes()];
      
      const openTime = openH * 60 + openM;
      const closeTime = closeH * 60 + closeM;
      const nowTime = nowH * 60 + nowM;
      
      const isOpen = nowTime >= openTime && nowTime <= closeTime;
      console.log(`\n✅ Business Status: ${isOpen ? '🟢 AÇIK' : '🔴 KAPALI'}`);
      console.log(`   Open: ${todayHours.openTime}, Close: ${todayHours.closeTime}, Now: ${currentTime}`);
    } else {
      console.log('\n🔴 Bugün kapalı (${currentDay})');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addWorkingHours();
