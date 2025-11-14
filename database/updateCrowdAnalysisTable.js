const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function updateCrowdAnalysisTable() {
  try {
    console.log('📊 iot_crowd_analysis tablosu güncelleniyor...\n');

    // Yeni sütunları ekle
    console.log('1️⃣ entry_count sütunu ekleniyor...');
    await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS entry_count INTEGER DEFAULT 0`;
    
    console.log('2️⃣ exit_count sütunu ekleniyor...');
    await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS exit_count INTEGER DEFAULT 0`;
    
    console.log('3️⃣ current_occupancy sütunu ekleniyor...');
    await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0`;
    
    console.log('4️⃣ trend_direction sütunu ekleniyor...');
    await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS trend_direction VARCHAR(20) DEFAULT 'stable'`;
    
    console.log('5️⃣ movement_detected sütunu ekleniyor...');
    await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS movement_detected INTEGER DEFAULT 0`;
    
    console.log('6️⃣ detection_method sütunu ekleniyor...');
    await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS detection_method VARCHAR(50) DEFAULT 'ai_detection'`;
    
    console.log('\n✅ Tablo başarıyla güncellendi!');
    console.log('\nYeni sütunlar:');
    console.log('  - entry_count (giriş sayısı)');
    console.log('  - exit_count (çıkış sayısı)');
    console.log('  - current_occupancy (mevcut doluluk)');
    console.log('  - trend_direction (trend: increasing/decreasing/stable)');
    console.log('  - movement_detected (hareket oranı %)');
    console.log('  - detection_method (tespit yöntemi)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

updateCrowdAnalysisTable();
