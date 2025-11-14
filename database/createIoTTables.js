const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function createIoTTables() {
  try {
    console.log('🔌 IoT sistemleri tabloları oluşturuluyor...');

    // 1. ESP32-CAM Cihazları
    console.log('📷 ESP32-CAM cihazları tablosu...');
    await sql`
      CREATE TABLE IF NOT EXISTS esp32_devices (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) UNIQUE NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        device_type VARCHAR(50) DEFAULT 'ESP32-CAM',
        stop_id INTEGER REFERENCES transport_stops(id),
        line_id INTEGER REFERENCES transport_lines(id),
        city_id INTEGER REFERENCES turkey_cities(id),
        location_type VARCHAR(50) NOT NULL, -- 'bus_stop', 'vehicle', 'station'
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        ip_address INET,
        mac_address VARCHAR(17),
        firmware_version VARCHAR(20),
        battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
        signal_strength INTEGER,
        is_online BOOLEAN DEFAULT FALSE,
        last_heartbeat TIMESTAMP,
        installed_date TIMESTAMP DEFAULT NOW(),
        config JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. Yoğunluk Analizi Verileri
    console.log('👥 Crowd analysis tablosu...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_crowd_analysis (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) REFERENCES esp32_devices(device_id),
        analysis_type VARCHAR(50) NOT NULL, -- 'people_count', 'vehicle_occupancy', 'queue_length'
        location_type VARCHAR(50) NOT NULL, -- 'bus_stop', 'vehicle_interior', 'platform'
        people_count INTEGER DEFAULT 0,
        crowd_density VARCHAR(20), -- 'empty', 'low', 'medium', 'high', 'overcrowded'
        confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
        detection_objects JSONB, -- AI detection details
        image_url VARCHAR(500),
        analysis_timestamp TIMESTAMP DEFAULT NOW(),
        processing_time_ms INTEGER,
        weather_condition VARCHAR(50),
        temperature DECIMAL(5,2),
        humidity INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 3. Araç Gelişi Takibi
    console.log('🚌 Vehicle arrival tracking tablosu...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_vehicle_arrivals (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) REFERENCES esp32_devices(device_id),
        line_id INTEGER REFERENCES transport_lines(id),
        stop_id INTEGER REFERENCES transport_stops(id),
        vehicle_number VARCHAR(100),
        vehicle_type VARCHAR(50), -- 'bus', 'metro', 'tram'
        arrival_status VARCHAR(50) NOT NULL, -- 'approaching', 'arrived', 'departed'
        distance_meters INTEGER,
        estimated_arrival_seconds INTEGER,
        actual_arrival_time TIMESTAMP,
        departure_time TIMESTAMP,
        passenger_boarding INTEGER DEFAULT 0,
        passenger_alighting INTEGER DEFAULT 0,
        vehicle_occupancy_percent INTEGER CHECK (vehicle_occupancy_percent >= 0 AND vehicle_occupancy_percent <= 100),
        detection_confidence DECIMAL(5,2),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 4. Durak Yoğunluk İstatistikleri
    console.log('📊 Stop analytics tablosu...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_stop_analytics (
        id SERIAL PRIMARY KEY,
        stop_id INTEGER REFERENCES transport_stops(id),
        device_id VARCHAR(100) REFERENCES esp32_devices(device_id),
        analysis_date DATE DEFAULT CURRENT_DATE,
        hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
        avg_waiting_people DECIMAL(5,2),
        max_waiting_people INTEGER,
        total_arrivals INTEGER DEFAULT 0,
        avg_waiting_time_minutes DECIMAL(5,2),
        peak_crowd_time TIME,
        weather_impact JSONB,
        occupancy_patterns JSONB,
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `;

    // 5. IoT Device Commands
    console.log('🎛️ Device commands tablosu...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_device_commands (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) REFERENCES esp32_devices(device_id),
        command_type VARCHAR(50) NOT NULL, -- 'capture_image', 'start_analysis', 'update_config', 'restart'
        command_data JSONB,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'executed', 'failed'
        sent_at TIMESTAMP DEFAULT NOW(),
        executed_at TIMESTAMP,
        response_data JSONB,
        retry_count INTEGER DEFAULT 0,
        created_by VARCHAR(100),
        expires_at TIMESTAMP
      )
    `;

    // 6. Real-time Updates
    console.log('⚡ Realtime updates tablosu...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_realtime_updates (
        id SERIAL PRIMARY KEY,
        update_type VARCHAR(50) NOT NULL, -- 'crowd_change', 'vehicle_arrival', 'device_status'
        source_device_id VARCHAR(100) REFERENCES esp32_devices(device_id),
        stop_id INTEGER REFERENCES transport_stops(id),
        line_id INTEGER REFERENCES transport_lines(id),
        update_data JSONB NOT NULL,
        priority_level INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=critical
        broadcast_to JSONB, -- which clients to notify
        is_processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP
      )
    `;

    // Index'ler
    console.log('🔍 IoT index\'ler oluşturuluyor...');
    await sql`CREATE INDEX IF NOT EXISTS idx_esp32_device_id ON esp32_devices(device_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_esp32_location ON esp32_devices(location_type, is_online)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_device ON iot_crowd_analysis(device_id, analysis_timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crowd_analysis_time ON iot_crowd_analysis(analysis_timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_vehicle_arrivals_stop ON iot_vehicle_arrivals(stop_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_vehicle_arrivals_status ON iot_vehicle_arrivals(arrival_status, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stop_analytics_date ON iot_stop_analytics(stop_id, analysis_date, hour_of_day)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_realtime_updates_type ON iot_realtime_updates(update_type, is_processed, created_at DESC)`;

    console.log('✅ IoT tabloları oluşturuldu!');

    // Demo ESP32 cihazları ekle
    console.log('🎭 Demo ESP32 cihazları ekleniyor...');
    
    const demoDevices = [
      {
        device_id: 'ESP32-CAM-KZL-001',
        name: 'Kızılay Durağı Kamera 1',
        location: 'bus_stop',
        lat: 39.9208,
        lng: 32.8541,
        stop_name: 'Kızılay Metro İstasyonu'
      },
      {
        device_id: 'ESP32-CAM-BTK-002', 
        name: 'Batıkent Durağı Kamera 1',
        location: 'bus_stop',
        lat: 39.9697,
        lng: 32.7347,
        stop_name: 'Batıkent Metro İstasyonu'
      },
      {
        device_id: 'ESP32-CAM-M1-003',
        name: 'M1 Metro Araç İçi',
        location: 'vehicle',
        lat: 39.9400,
        lng: 32.8000,
        stop_name: null
      },
      {
        device_id: 'ESP32-CAM-405-004',
        name: '405 Otobüs Araç İçi',
        location: 'vehicle', 
        lat: 39.9300,
        lng: 32.8200,
        stop_name: null
      }
    ];

    for (const device of demoDevices) {
      const stopId = device.stop_name ? 
        await sql`SELECT id FROM transport_stops WHERE stop_name LIKE '%' || ${device.stop_name.split(' ')[0]} || '%' LIMIT 1` : 
        null;
      
      const lineId = device.location === 'vehicle' ? 
        await sql`SELECT id FROM transport_lines WHERE line_code = ${device.device_id.includes('M1') ? 'M1' : '405'} LIMIT 1` :
        null;

      await sql`
        INSERT INTO esp32_devices (
          device_id, device_name, location_type, stop_id, line_id,
          latitude, longitude, is_online, battery_level, signal_strength,
          firmware_version, last_heartbeat, config
        ) VALUES (
          ${device.device_id}, ${device.name}, ${device.location},
          ${stopId?.rows[0]?.id || null}, ${lineId?.rows[0]?.id || null},
          ${device.lat}, ${device.lng}, true, ${85 + Math.floor(Math.random() * 15)},
          ${-40 - Math.floor(Math.random() * 20)}, 'v2.1.0', NOW(),
          '{"detection_sensitivity": 0.7, "capture_interval": 30, "ai_model": "yolo_v5"}'
        ) ON CONFLICT (device_id) DO NOTHING
      `;
      
      console.log(`✅ ${device.name} eklendi`);
    }

    // Demo analiz verileri
    console.log('📊 Demo analiz verileri ekleniyor...');
    
    const devices = await sql`SELECT device_id, location_type FROM esp32_devices`;
    
    for (const device of devices.rows) {
      // Son 24 saat için her 30 dakikada bir veri
      for (let i = 0; i < 48; i++) {
        const timestamp = new Date();
        timestamp.setMinutes(timestamp.getMinutes() - (i * 30));
        
        const peopleCount = device.location_type === 'bus_stop' ? 
          Math.floor(Math.random() * 25) : // Durak: 0-25 kişi
          Math.floor(Math.random() * 80);   // Araç: 0-80 kişi
          
        const densityLevels = ['empty', 'low', 'medium', 'high', 'overcrowded'];
        const density = densityLevels[Math.floor(peopleCount / 20) || 0];
        
        await sql`
          INSERT INTO iot_crowd_analysis (
            device_id, analysis_type, location_type, people_count, crowd_density,
            confidence_score, analysis_timestamp, processing_time_ms,
            weather_condition, temperature, humidity
          ) VALUES (
            ${device.device_id}, 
            ${device.location_type === 'bus_stop' ? 'people_count' : 'vehicle_occupancy'},
            ${device.location_type}, ${peopleCount}, ${density},
            ${85 + Math.random() * 10}, ${timestamp.toISOString()},
            ${200 + Math.floor(Math.random() * 300)},
            ${['Güneşli', 'Bulutlu', 'Yağmurlu'][Math.floor(Math.random() * 3)]},
            ${15 + Math.random() * 10}, ${45 + Math.floor(Math.random() * 30)}
          )
        `;
      }
    }

    // Demo araç gelişleri
    console.log('🚌 Demo araç gelişleri ekleniyor...');
    
    const stopDevices = await sql`
      SELECT e.device_id, e.stop_id, ts.stop_name 
      FROM esp32_devices e 
      JOIN transport_stops ts ON e.stop_id = ts.id 
      WHERE e.location_type = 'bus_stop'
    `;
    
    for (const device of stopDevices.rows) {
      // Son 2 saat için araç gelişleri
      for (let i = 0; i < 12; i++) {
        const timestamp = new Date();
        timestamp.setMinutes(timestamp.getMinutes() - (i * 10));
        
        await sql`
          INSERT INTO iot_vehicle_arrivals (
            device_id, stop_id, vehicle_number, vehicle_type, arrival_status,
            actual_arrival_time, passenger_boarding, passenger_alighting,
            vehicle_occupancy_percent, detection_confidence
          ) VALUES (
            ${device.device_id}, ${device.stop_id}, 
            ${'34-' + String(Math.floor(Math.random() * 999)).padStart(3, '0')},
            ${['bus', 'metro'][Math.floor(Math.random() * 2)]}, 'departed',
            ${timestamp.toISOString()}, ${Math.floor(Math.random() * 15)},
            ${Math.floor(Math.random() * 12)}, ${30 + Math.floor(Math.random() * 50)},
            ${90 + Math.random() * 10}
          )
        `;
      }
    }

    // İstatistikler
    const deviceCount = await sql`SELECT COUNT(*) as total FROM esp32_devices`;
    const analysisCount = await sql`SELECT COUNT(*) as total FROM iot_crowd_analysis`;
    const arrivalCount = await sql`SELECT COUNT(*) as total FROM iot_vehicle_arrivals`;

    console.log('\n🎉 IoT SİSTEMİ HAZIR!');
    console.log(`📷 ESP32 Cihazları: ${deviceCount.rows[0].total}`);
    console.log(`📊 Analiz Verileri: ${analysisCount.rows[0].total}`);
    console.log(`🚌 Araç Gelişleri: ${arrivalCount.rows[0].total}`);

  } catch (error) {
    console.error('❌ IoT tabloları oluşturma hatası:', error);
    process.exit(1);
  }
}

createIoTTables();