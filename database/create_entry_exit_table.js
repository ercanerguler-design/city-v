const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createEntryExitTables() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Entry/Exit ve Zone tracking tabloları oluşturuluyor...\n');
    
    // 1. Entry/Exit Logs
    console.log('📊 [1/2] iot_entry_exit_logs tablosu...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS iot_entry_exit_logs (
        id SERIAL PRIMARY KEY,
        camera_id INTEGER NOT NULL,
        business_id INTEGER,
        location_zone VARCHAR(100),
        entry_count INTEGER DEFAULT 0,
        exit_count INTEGER DEFAULT 0,
        current_occupancy INTEGER DEFAULT 0,
        analysis_id INTEGER REFERENCES iot_ai_analysis(id),
        timestamp TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_entry_camera ON iot_entry_exit_logs(camera_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_entry_business ON iot_entry_exit_logs(business_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_entry_zone ON iot_entry_exit_logs(location_zone, timestamp);
    `);
    console.log('✅ iot_entry_exit_logs tablosu oluşturuldu');
    
    // 2. Zone Occupancy
    console.log('📊 [2/2] iot_zone_occupancy tablosu...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS iot_zone_occupancy (
        id SERIAL PRIMARY KEY,
        camera_id INTEGER NOT NULL,
        business_id INTEGER,
        zone_name VARCHAR(100),
        person_count INTEGER DEFAULT 0,
        crowd_density FLOAT DEFAULT 0.0,
        density_level VARCHAR(20),
        heatmap_url TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_zone_camera ON iot_zone_occupancy(camera_id, zone_name, timestamp);
      CREATE INDEX IF NOT EXISTS idx_zone_business ON iot_zone_occupancy(business_id, timestamp);
    `);
    console.log('✅ iot_zone_occupancy tablosu oluşturuldu');
    
    // 3. Views
    console.log('📊 Analitik görünümler oluşturuluyor...');
    
    await client.query(`
      CREATE OR REPLACE VIEW v_current_occupancy AS
      SELECT 
        eel.camera_id,
        eel.business_id,
        eel.location_zone,
        eel.current_occupancy,
        eel.entry_count as total_entries_today,
        eel.exit_count as total_exits_today,
        eel.timestamp as last_update
      FROM iot_entry_exit_logs eel
      WHERE eel.id IN (
        SELECT MAX(id) 
        FROM iot_entry_exit_logs 
        GROUP BY camera_id, location_zone
      );
    `);
    
    await client.query(`
      CREATE OR REPLACE VIEW v_hourly_traffic AS
      SELECT 
        business_id,
        location_zone,
        DATE_TRUNC('hour', timestamp) as hour,
        SUM(entry_count) as total_entries,
        SUM(exit_count) as total_exits,
        AVG(current_occupancy)::INTEGER as avg_occupancy,
        MAX(current_occupancy) as peak_occupancy
      FROM iot_entry_exit_logs
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY business_id, location_zone, DATE_TRUNC('hour', timestamp)
      ORDER BY hour DESC;
    `);
    
    await client.query(`
      CREATE OR REPLACE VIEW v_zone_density_realtime AS
      SELECT 
        zo.business_id,
        zo.zone_name,
        zo.person_count,
        zo.crowd_density,
        zo.density_level,
        zo.heatmap_url,
        zo.timestamp as last_update
      FROM iot_zone_occupancy zo
      WHERE zo.id IN (
        SELECT MAX(id) 
        FROM iot_zone_occupancy 
        WHERE timestamp > NOW() - INTERVAL '5 minutes'
        GROUP BY camera_id, zone_name
      );
    `);
    
    console.log('✅ Tüm görünümler oluşturuldu');
    
    // Kontrol
    const result = await client.query(`SELECT COUNT(*) as count FROM iot_entry_exit_logs`);
    
    console.log('\n✅ ===== KURULUM TAMAMLANDI =====');
    console.log('📊 Tablolar:');
    console.log('   - iot_entry_exit_logs (Giriş/Çıkış)');
    console.log('   - iot_zone_occupancy (Bölgesel Yoğunluk)');
    console.log('📈 Views:');
    console.log('   - v_current_occupancy (Anlık Doluluk)');
    console.log('   - v_hourly_traffic (Saatlik Trafik)');
    console.log('   - v_zone_density_realtime (Bölge Yoğunluğu)');
    console.log(`📋 Mevcut kayıtlar: ${result.rows[0].count}`);
    console.log('================================\n');
    
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createEntryExitTables();
