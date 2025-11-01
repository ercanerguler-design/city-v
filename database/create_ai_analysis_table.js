const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createAITables() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 AI Analysis tabloları oluşturuluyor...\n');
    
    // 1. AI Analysis tablosu
    console.log('📊 [1/2] iot_ai_analysis tablosu...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS iot_ai_analysis (
        id SERIAL PRIMARY KEY,
        camera_id INTEGER NOT NULL,
        location_zone VARCHAR(100),
        person_count INTEGER DEFAULT 0,
        crowd_density FLOAT DEFAULT 0.0,
        detection_objects JSONB,
        heatmap_url TEXT,
        image_size INTEGER,
        processing_time_ms INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_ai_camera_id ON iot_ai_analysis(camera_id);
      CREATE INDEX IF NOT EXISTS idx_ai_location_zone ON iot_ai_analysis(location_zone);
      CREATE INDEX IF NOT EXISTS idx_ai_created_at ON iot_ai_analysis(created_at);
      CREATE INDEX IF NOT EXISTS idx_ai_person_count ON iot_ai_analysis(person_count);
    `);
    console.log('✅ iot_ai_analysis tablosu oluşturuldu');
    
    // 2. Crowd Alerts tablosu
    console.log('📊 [2/2] iot_crowd_alerts tablosu...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS iot_crowd_alerts (
        id SERIAL PRIMARY KEY,
        camera_id INTEGER NOT NULL,
        location_zone VARCHAR(100),
        alert_type VARCHAR(50),
        person_count INTEGER,
        crowd_density FLOAT,
        alert_message TEXT,
        is_resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_alert_camera ON iot_crowd_alerts(camera_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_alert_unresolved ON iot_crowd_alerts(is_resolved, created_at);
    `);
    console.log('✅ iot_crowd_alerts tablosu oluşturuldu');
    
    // 3. Views oluştur
    console.log('📊 Analitik görünümleri oluşturuluyor...');
    await client.query(`
      CREATE OR REPLACE VIEW v_ai_hourly_stats AS
      SELECT 
        camera_id,
        location_zone,
        DATE_TRUNC('hour', created_at) as hour,
        AVG(person_count)::INTEGER as avg_person_count,
        MAX(person_count) as max_person_count,
        AVG(crowd_density)::FLOAT as avg_crowd_density,
        MAX(crowd_density) as max_crowd_density,
        COUNT(*) as analysis_count
      FROM iot_ai_analysis
      GROUP BY camera_id, location_zone, DATE_TRUNC('hour', created_at)
      ORDER BY hour DESC;
      
      CREATE OR REPLACE VIEW v_ai_realtime_stats AS
      SELECT 
        camera_id,
        location_zone,
        AVG(person_count)::INTEGER as current_person_count,
        AVG(crowd_density)::FLOAT as current_crowd_density,
        MAX(created_at) as last_update
      FROM iot_ai_analysis
      WHERE created_at > NOW() - INTERVAL '5 minutes'
      GROUP BY camera_id, location_zone;
    `);
    console.log('✅ Analitik görünümler oluşturuldu');
    
    // Kontrol
    const result = await client.query(`
      SELECT COUNT(*) as count FROM iot_ai_analysis
    `);
    
    console.log('\n✅ ===== KURULUM TAMAMLANDI =====');
    console.log('📊 Tablolar hazır: iot_ai_analysis, iot_crowd_alerts');
    console.log('📈 Görünümler: v_ai_hourly_stats, v_ai_realtime_stats');
    console.log(`📋 Mevcut analiz kayıtları: ${result.rows[0].count}`);
    console.log('================================\n');
    
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createAITables();
