const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

/**
 * IoT Crowd Analysis tablosunu Business için güncelle
 * Eksik kolonları ekle
 */
async function updateIoTCrowdAnalysis() {
  try {
    console.log('🔧 iot_crowd_analysis tablosu güncelleniyor...');

    // Mevcut kolonları kontrol et
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'iot_crowd_analysis'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Mevcut kolonlar:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    const existingColumns = columns.rows.map(c => c.column_name);

    // Eksik kolonları ekle
    console.log('\n➕ Eksik kolonlar ekleniyor...');

    if (!existingColumns.includes('device_id')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS device_id VARCHAR(100)`;
      console.log('  ✅ device_id eklendi');
    }

    if (!existingColumns.includes('business_id')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE`;
      console.log('  ✅ business_id eklendi');
    }

    if (!existingColumns.includes('analysis_type')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS analysis_type VARCHAR(50) DEFAULT 'people_count'`;
      console.log('  ✅ analysis_type eklendi');
    }

    if (!existingColumns.includes('location_name')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS location_name VARCHAR(255)`;
      console.log('  ✅ location_name eklendi');
    }

    if (!existingColumns.includes('total_entries')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS total_entries INTEGER DEFAULT 0`;
      console.log('  ✅ total_entries eklendi');
    }

    if (!existingColumns.includes('total_exits')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS total_exits INTEGER DEFAULT 0`;
      console.log('  ✅ total_exits eklendi');
    }

    if (!existingColumns.includes('current_occupancy')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0`;
      console.log('  ✅ current_occupancy eklendi');
    }

    if (!existingColumns.includes('max_capacity')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 100`;
      console.log('  ✅ max_capacity eklendi');
    }

    if (!existingColumns.includes('occupancy_percent')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS occupancy_percent DECIMAL(5,2) DEFAULT 0`;
      console.log('  ✅ occupancy_percent eklendi');
    }

    if (!existingColumns.includes('crowd_level')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS crowd_level VARCHAR(20) DEFAULT 'low'`;
      console.log('  ✅ crowd_level eklendi');
    }

    if (!existingColumns.includes('timestamp')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT NOW()`;
      console.log('  ✅ timestamp eklendi');
    }

    if (!existingColumns.includes('heatmap_data')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS heatmap_data JSONB`;
      console.log('  ✅ heatmap_data eklendi');
    }

    if (!existingColumns.includes('dwell_time_avg_minutes')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS dwell_time_avg_minutes DECIMAL(5,2)`;
      console.log('  ✅ dwell_time_avg_minutes eklendi');
    }

    if (!existingColumns.includes('peak_hour')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS peak_hour INTEGER`;
      console.log('  ✅ peak_hour eklendi');
    }

    if (!existingColumns.includes('confidence_score')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2) DEFAULT 0`;
      console.log('  ✅ confidence_score eklendi');
    }

    if (!existingColumns.includes('processing_time_ms')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER`;
      console.log('  ✅ processing_time_ms eklendi');
    }

    if (!existingColumns.includes('temperature')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS temperature DECIMAL(5,2)`;
      console.log('  ✅ temperature eklendi');
    }

    if (!existingColumns.includes('humidity')) {
      await sql`ALTER TABLE iot_crowd_analysis ADD COLUMN IF NOT EXISTS humidity INTEGER`;
      console.log('  ✅ humidity eklendi');
    }

    // Index'leri ekle
    console.log('\n🔍 Index\'ler ekleniyor...');
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_device_new ON iot_crowd_analysis(device_id, timestamp DESC)`;
      console.log('  ✅ idx_crowd_analysis_device_new');
    } catch (e) {
      console.log('  ⚠️  idx_crowd_analysis_device_new zaten var');
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_business_new ON iot_crowd_analysis(business_id, timestamp DESC)`;
      console.log('  ✅ idx_crowd_analysis_business_new');
    } catch (e) {
      console.log('  ⚠️  idx_crowd_analysis_business_new zaten var');
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_timestamp_new ON iot_crowd_analysis(timestamp DESC)`;
      console.log('  ✅ idx_crowd_analysis_timestamp_new');
    } catch (e) {
      console.log('  ⚠️  idx_crowd_analysis_timestamp_new zaten var');
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_level_new ON iot_crowd_analysis(crowd_level, timestamp DESC)`;
      console.log('  ✅ idx_crowd_analysis_level_new');
    } catch (e) {
      console.log('  ⚠️  idx_crowd_analysis_level_new zaten var');
    }

    // Güncellenmiş kolonları göster
    const updatedColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'iot_crowd_analysis'
      ORDER BY ordinal_position
    `;

    console.log('\n✅ Güncellenmiş tablo yapısı:');
    updatedColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n🎉 iot_crowd_analysis tablosu güncellendi!');

  } catch (error) {
    console.error('❌ Hata:', error);
    console.error('Detay:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  updateIoTCrowdAnalysis()
    .then(() => {
      console.log('\n✅ İşlem tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { updateIoTCrowdAnalysis };
