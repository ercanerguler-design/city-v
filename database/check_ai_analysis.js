const { neonConfig } = require('@neondatabase/serverless');
const postgres = require('postgres');

// WebSocket kullanma (Node.js environment)
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = require('ws');
}

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL veya POSTGRES_URL bulunamadı!');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function checkAIAnalysis() {
  console.log('📊 AI Analysis Kayıtları Kontrol Ediliyor...\n');
  
  try {
    // Son 10 kayıt
    const records = await sql`
      SELECT 
        id,
        camera_id,
        location_zone,
        person_count,
        crowd_density,
        processing_time_ms,
        created_at
      FROM iot_ai_analysis
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    if (records.length === 0) {
      console.log('⚠️ Henüz kayıt yok');
      return;
    }
    
    console.log(`✅ Toplam ${records.length} kayıt bulundu:\n`);
    
    records.forEach((record, index) => {
      console.log(`📸 Kayıt #${index + 1}`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Camera: ${record.camera_id}`);
      console.log(`   Zone: ${record.location_zone}`);
      console.log(`   👥 Kişi: ${record.person_count}`);
      console.log(`   🔥 Yoğunluk: ${record.crowd_density}%`);
      console.log(`   ⚡ İşlem Süresi: ${record.processing_time_ms}ms`);
      console.log(`   🕒 Zaman: ${new Date(record.created_at).toLocaleString('tr-TR')}`);
      console.log('');
    });
    
    // İstatistikler
    const stats = await sql`
      SELECT 
        COUNT(*) as total_records,
        SUM(person_count) as total_persons_detected,
        AVG(processing_time_ms) as avg_processing_time,
        MAX(created_at) as last_analysis
      FROM iot_ai_analysis
    `;
    
    const stat = stats[0];
    console.log('📊 İSTATİSTİKLER:');
    console.log(`   Toplam Analiz: ${stat.total_records}`);
    console.log(`   Tespit Edilen Kişi: ${stat.total_persons_detected}`);
    console.log(`   Ortalama İşlem: ${Math.round(stat.avg_processing_time)}ms`);
    console.log(`   Son Analiz: ${new Date(stat.last_analysis).toLocaleString('tr-TR')}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await sql.end();
  }
}

checkAIAnalysis();
