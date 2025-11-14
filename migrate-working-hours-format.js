require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

/**
 * Working Hours Format Migration
 * Database'deki working_hours JSONB format'ını standardize eder
 * 'open'/'close' → 'openTime'/'closeTime'
 */
async function migrateWorkingHours() {
  try {
    console.log('🔄 Working Hours Migration başlatılıyor...\n');
    
    // Tüm business_profiles'ları al
    const result = await sql`
      SELECT user_id, business_name, working_hours 
      FROM business_profiles 
      WHERE working_hours IS NOT NULL
    `;
    
    console.log(`📊 Toplam ${result.rows.length} business bulundu\n`);
    
    for (const business of result.rows) {
      const hours = business.working_hours;
      let needsUpdate = false;
      const updatedHours = { ...hours };
      
      // Her günü kontrol et
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      for (const day of days) {
        if (hours[day]) {
          // Eğer 'open'/'close' formatı varsa 'openTime'/'closeTime'a çevir
          if (hours[day].open !== undefined && hours[day].openTime === undefined) {
            updatedHours[day].openTime = hours[day].open;
            delete updatedHours[day].open;
            needsUpdate = true;
          }
          
          if (hours[day].close !== undefined && hours[day].closeTime === undefined) {
            updatedHours[day].closeTime = hours[day].close;
            delete updatedHours[day].close;
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        console.log(`🔧 Güncelleniyor: ${business.business_name} (User ID: ${business.user_id})`);
        
        await sql`
          UPDATE business_profiles 
          SET working_hours = ${JSON.stringify(updatedHours)}::jsonb,
              updated_at = NOW()
          WHERE user_id = ${business.user_id}
        `;
        
        console.log('   ✅ Güncellendi\n');
      } else {
        console.log(`✓ Zaten doğru formatta: ${business.business_name} (User ID: ${business.user_id})`);
      }
    }
    
    console.log('\n🎉 Migration tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    process.exit(1);
  }
}

migrateWorkingHours();
