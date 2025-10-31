const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

/**
 * Business IoT Devices ve Crowd Analysis Tabloları
 * Business dashboard için ESP32-CAM ve crowd analysis verileri
 */
async function createBusinessIoTTables() {
  try {
    console.log('🏢 Business IoT tabloları oluşturuluyor...');

    // 1. IoT Devices (Business Cameras)
    console.log('📷 iot_devices tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_devices (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
        device_id VARCHAR(100) UNIQUE NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        device_type VARCHAR(50) DEFAULT 'ESP32-CAM',
        location_name VARCHAR(255), -- 'Giriş', 'Çıkış', 'Kasa', vb.
        stream_url VARCHAR(500),
        rtsp_url VARCHAR(500),
        username VARCHAR(100),
        password_encrypted VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        ip_address INET,
        mac_address VARCHAR(17),
        firmware_version VARCHAR(20),
        resolution VARCHAR(20) DEFAULT '1280x720',
        fps INTEGER DEFAULT 15,
        is_online BOOLEAN DEFAULT FALSE,
        last_heartbeat TIMESTAMP,
        installed_date TIMESTAMP DEFAULT NOW(),
        config JSONB DEFAULT '{
          "detection_sensitivity": 0.7,
          "capture_interval": 30,
          "ai_model": "yolo_v8",
          "detection_zones": [],
          "alert_thresholds": {
            "overcrowded": 50,
            "high": 35,
            "medium": 20
          }
        }'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. IoT Crowd Analysis (Business Analytics Data)
    console.log('👥 iot_crowd_analysis tablosu güncelleniyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_crowd_analysis (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) NOT NULL,
        business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
        analysis_type VARCHAR(50) NOT NULL DEFAULT 'people_count',
        location_name VARCHAR(255),
        total_entries INTEGER DEFAULT 0,
        total_exits INTEGER DEFAULT 0,
        current_occupancy INTEGER DEFAULT 0,
        max_capacity INTEGER DEFAULT 100,
        occupancy_percent DECIMAL(5,2) DEFAULT 0,
        crowd_level VARCHAR(20) DEFAULT 'low', -- 'empty', 'low', 'medium', 'high', 'overcrowded'
        confidence_score DECIMAL(5,2) DEFAULT 0,
        detection_objects JSONB DEFAULT '[]'::jsonb,
        heatmap_data JSONB,
        dwell_time_avg_minutes DECIMAL(5,2),
        peak_hour INTEGER,
        image_url VARCHAR(500),
        timestamp TIMESTAMP DEFAULT NOW(),
        processing_time_ms INTEGER,
        weather_condition VARCHAR(50),
        temperature DECIMAL(5,2),
        humidity INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 3. IoT Device Analytics (Daily/Hourly Stats)
    console.log('📊 iot_device_analytics tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_device_analytics (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) REFERENCES iot_devices(device_id) ON DELETE CASCADE,
        business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
        analysis_date DATE DEFAULT CURRENT_DATE,
        hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
        total_visitors INTEGER DEFAULT 0,
        avg_occupancy DECIMAL(5,2) DEFAULT 0,
        peak_occupancy INTEGER DEFAULT 0,
        avg_dwell_time_minutes DECIMAL(5,2),
        entry_rate_per_hour DECIMAL(5,2),
        exit_rate_per_hour DECIMAL(5,2),
        conversion_rate DECIMAL(5,2), -- For retail: visitors to customers
        busy_periods JSONB, -- Array of time ranges
        weather_impact JSONB,
        last_updated TIMESTAMP DEFAULT NOW(),
        UNIQUE(device_id, analysis_date, hour_of_day)
      )
    `;

    // 4. IoT Device Commands
    console.log('🎛️ iot_device_commands tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_device_commands (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) REFERENCES iot_devices(device_id) ON DELETE CASCADE,
        business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
        command_type VARCHAR(50) NOT NULL, -- 'capture_image', 'start_analysis', 'update_config', 'restart', 'calibrate'
        command_data JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'executing', 'completed', 'failed'
        sent_at TIMESTAMP DEFAULT NOW(),
        executed_at TIMESTAMP,
        completed_at TIMESTAMP,
        response_data JSONB,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        created_by VARCHAR(100),
        expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour')
      )
    `;

    // 5. IoT Alerts/Notifications
    console.log('🚨 iot_alerts tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_alerts (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) REFERENCES iot_devices(device_id) ON DELETE CASCADE,
        business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL, -- 'overcrowded', 'device_offline', 'high_occupancy', 'low_confidence'
        severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        alert_data JSONB DEFAULT '{}'::jsonb,
        is_read BOOLEAN DEFAULT FALSE,
        is_resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP,
        resolved_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Indexes
    console.log('🔍 Index\'ler oluşturuluyor...');
    
    // iot_devices indexes
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_iot_devices_business ON iot_devices(business_id, is_active)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_iot_devices_device_id ON iot_devices(device_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_iot_devices_online ON iot_devices(is_online, last_heartbeat DESC)`;
      console.log('  ✅ iot_devices indexes');
    } catch (e) {
      console.log('  ⚠️  iot_devices indexes - bazı index\'ler zaten var');
    }
    
    // iot_crowd_analysis indexes - timestamp varsa kullan
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_device ON iot_crowd_analysis(device_id, timestamp DESC)`;
      console.log('  ✅ idx_crowd_analysis_device');
    } catch (e) {
      console.log('  ⚠️  idx_crowd_analysis_device atlandı');
    }
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_business ON iot_crowd_analysis(business_id, timestamp DESC)`;
      console.log('  ✅ idx_crowd_analysis_business');
    } catch (e) {
      console.log('  ⚠️  idx_crowd_analysis_business atlandı');
    }
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_timestamp ON iot_crowd_analysis(timestamp DESC)`;
      console.log('  ✅ idx_crowd_analysis_timestamp');
    } catch (e) {
      console.log('  ⚠️  idx_crowd_analysis_timestamp atlandı');
    }
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_level ON iot_crowd_analysis(crowd_level, timestamp DESC)`;
      console.log('  ✅ idx_crowd_analysis_level');
    } catch (e) {
      console.log('  ⚠️  idx_crowd_analysis_level atlandı');
    }
    
    // iot_device_analytics indexes
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_device_analytics_date ON iot_device_analytics(device_id, analysis_date DESC, hour_of_day)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_device_analytics_business ON iot_device_analytics(business_id, analysis_date DESC)`;
      console.log('  ✅ iot_device_analytics indexes');
    } catch (e) {
      console.log('  ⚠️  iot_device_analytics indexes atlandı');
    }
    
    // iot_device_commands indexes
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_device_commands_status ON iot_device_commands(device_id, status, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_device_commands_pending ON iot_device_commands(status, expires_at) WHERE status = 'pending'`;
      console.log('  ✅ iot_device_commands indexes');
    } catch (e) {
      console.log('  ⚠️  iot_device_commands indexes atlandı');
    }
    
    // iot_alerts indexes
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_alerts_business ON iot_alerts(business_id, is_read, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_alerts_unread ON iot_alerts(business_id, is_read) WHERE is_read = FALSE`;
      await sql`CREATE INDEX IF NOT EXISTS idx_alerts_severity ON iot_alerts(severity, created_at DESC)`;
      console.log('  ✅ iot_alerts indexes');
    } catch (e) {
      console.log('  ⚠️  iot_alerts indexes atlandı');
    }

    console.log('✅ Business IoT tabloları oluşturuldu!');
    console.log('\n📋 Oluşturulan tablolar:');
    console.log('  ✓ iot_devices - IoT cihaz yönetimi');
    console.log('  ✓ iot_crowd_analysis - Kalabalık analiz verileri');
    console.log('  ✓ iot_device_analytics - İstatistiksel veriler');
    console.log('  ✓ iot_device_commands - Cihaz komutları');
    console.log('  ✓ iot_alerts - Bildirimler ve uyarılar');

    // Tablo bilgilerini getir
    const devicesCount = await sql`SELECT COUNT(*) as total FROM iot_devices`;
    const analysisCount = await sql`SELECT COUNT(*) as total FROM iot_crowd_analysis`;
    
    console.log('\n📊 Mevcut veriler:');
    console.log(`  📷 IoT Cihazları: ${devicesCount.rows[0].total}`);
    console.log(`  👥 Analiz Kayıtları: ${analysisCount.rows[0].total}`);

    console.log('\n🎯 Sonraki adım: Demo verileri eklemek için setupBusinessIoT.js çalıştırın');

  } catch (error) {
    console.error('❌ Hata:', error);
    console.error('Detay:', error.message);
    process.exit(1);
  }
}

// Script direkt çalıştırılırsa
if (require.main === module) {
  createBusinessIoTTables()
    .then(() => {
      console.log('\n✅ İşlem tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { createBusinessIoTTables };
