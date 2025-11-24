require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkRecentIoTData() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('📊 ESP32 Camera ID 60 - Son Kayıtlar\n');
    
    // Son 10 dakikadaki tüm kayıtlar
    const recent = await sql`
      SELECT 
        device_id,
        people_count,
        crowd_density,
        current_occupancy,
        entry_count,
        exit_count,
        analysis_timestamp,
        created_at
      FROM iot_crowd_analysis
      WHERE device_id = '60'
        AND analysis_timestamp >= NOW() - INTERVAL '10 minutes'
      ORDER BY analysis_timestamp DESC
      LIMIT 20
    `;
    
    console.log(`✅ Son 10 dakikada ${recent.length} kayıt bulundu:\n`);
    
    if (recent.length === 0) {
      console.log('❌ Hiç kayıt yok! ESP32 veri göndermiyor olabilir.');
      return;
    }
    
    recent.forEach((r, i) => {
      const timestamp = new Date(r.analysis_timestamp);
      const created = new Date(r.created_at);
      const delay = (created - timestamp) / 1000; // saniye
      
      console.log(`${i + 1}. ${timestamp.toLocaleTimeString('tr-TR')}`);
      console.log(`   Kişi: ${r.people_count}, Yoğunluk: ${r.crowd_density}, Kapasite: ${r.current_occupancy}%`);
      console.log(`   Giriş: ${r.entry_count}, Çıkış: ${r.exit_count}`);
      console.log(`   Analiz: ${timestamp.toISOString()}`);
      console.log(`   DB'ye yazıldı: ${created.toISOString()} (${delay.toFixed(1)}s gecikme)`);
      console.log();
    });
    
    // Toplam istatistik
    const stats = await sql`
      SELECT 
        COUNT(*) as total_records,
        MIN(analysis_timestamp) as first_record,
        MAX(analysis_timestamp) as last_record,
        AVG(people_count) as avg_people
      FROM iot_crowd_analysis
      WHERE device_id = '60'
    `;
    
    console.log('📈 Genel İstatistikler:');
    console.log(`  Toplam kayıt: ${stats[0].total_records}`);
    console.log(`  İlk kayıt: ${new Date(stats[0].first_record).toLocaleString('tr-TR')}`);
    console.log(`  Son kayıt: ${new Date(stats[0].last_record).toLocaleString('tr-TR')}`);
    console.log(`  Ortalama kişi: ${Math.round(stats[0].avg_people)}`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

checkRecentIoTData();
