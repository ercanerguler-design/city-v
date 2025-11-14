const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function debugWorkingHours() {
  try {
    console.log('🔍 Debugging working hours...\n');

    // 1. Database'den business location'ları çek
    const businessResult = await sql`
      SELECT 
        bp.location_id as id,
        bp.business_name as name,
        bp.working_hours as "workingHours",
        bp.category
      FROM business_profiles bp
      WHERE bp.user_id = 6
    `;

    console.log('📊 Business from DB:');
    businessResult.rows.forEach(b => {
      console.log(`   ${b.name} (${b.id})`);
      console.log('   Working Hours:', b.workingHours);
      console.log('   Category:', b.category);
    });

    // 2. API'den locations çek
    console.log('\n🌐 Fetching from API...');
    const apiUrl = 'http://localhost:3002/api/locations?city=Ankara&includeBusiness=true';
    console.log(`   URL: ${apiUrl}`);
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log('\n📍 API Response:');
      console.log(`   Total locations: ${data.locations?.length || 0}`);
      
      const businessLocs = data.locations?.filter((l: any) => l.source === 'business');
      console.log(`   Business locations: ${businessLocs?.length || 0}`);
      
      if (businessLocs && businessLocs.length > 0) {
        businessLocs.forEach((loc: any) => {
          console.log(`\n   📍 ${loc.name} (${loc.id})`);
          console.log(`      Source: ${loc.source}`);
          console.log(`      Category: ${loc.category}`);
          console.log(`      Working Hours:`, loc.workingHours);
          console.log(`      Has workingHours prop: ${!!loc.workingHours}`);
          console.log(`      Type: ${typeof loc.workingHours}`);
        });
      }
    } catch (apiError) {
      console.error('❌ API Error:', apiError.message);
      console.log('   Make sure dev server is running on port 3002');
    }

    // 3. Test isLocationOpen fonksiyonu
    console.log('\n🧪 Testing isLocationOpen function...');
    const testLocation = {
      id: '16',
      name: 'SCE INNOVATION',
      category: 'technology',
      workingHours: businessResult.rows[0]?.workingHours
    };

    console.log('   Test Location:', testLocation);

    // isLocationOpen fonksiyonunu manuel test et
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`   Current: ${currentTime} (${currentDay})`);
    
    if (testLocation.workingHours && typeof testLocation.workingHours === 'object') {
      const todayHours = testLocation.workingHours[currentDay];
      console.log(`   Today's hours:`, todayHours);
      
      if (todayHours && todayHours.isOpen) {
        const [openH, openM] = todayHours.openTime.split(':').map(Number);
        const [closeH, closeM] = todayHours.closeTime.split(':').map(Number);
        const [nowH, nowM] = [now.getHours(), now.getMinutes()];
        
        const openTime = openH * 60 + openM;
        const closeTime = closeH * 60 + closeM;
        const nowTime = nowH * 60 + nowM;
        
        const isOpen = nowTime >= openTime && nowTime <= closeTime;
        console.log(`   Expected Result: ${isOpen ? '🟢 AÇIK' : '🔴 KAPALI'}`);
        console.log(`   Open: ${todayHours.openTime} (${openTime} min), Close: ${todayHours.closeTime} (${closeTime} min), Now: ${currentTime} (${nowTime} min)`);
      }
    } else {
      console.log('   ⚠️ No working hours found!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugWorkingHours();
