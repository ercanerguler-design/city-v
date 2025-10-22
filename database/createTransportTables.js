const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function createTransportTables() {
  try {
    console.log('🚍 Toplu Taşıma tablolarını oluşturuyor...');

    // 1. Şehirler tablosu
    console.log('🏙️ Cities tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS turkey_cities (
        id SERIAL PRIMARY KEY,
        city_name VARCHAR(100) NOT NULL,
        city_code VARCHAR(10) UNIQUE,
        region VARCHAR(50),
        population INTEGER,
        transport_tier VARCHAR(20),
        has_metro BOOLEAN DEFAULT FALSE,
        has_bus BOOLEAN DEFAULT TRUE,
        has_tram BOOLEAN DEFAULT FALSE,
        has_ferry BOOLEAN DEFAULT FALSE,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Cities tablosu oluşturuldu!');

    // 2. Ulaşım kurumları
    console.log('🏛️ Agencies tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS transport_agencies (
        id SERIAL PRIMARY KEY,
        agency_name VARCHAR(255) NOT NULL,
        agency_code VARCHAR(20) UNIQUE,
        city_id INTEGER REFERENCES turkey_cities(id),
        agency_type VARCHAR(50),
        website VARCHAR(255),
        api_endpoint VARCHAR(255),
        contact_info JSONB,
        logo_url VARCHAR(255),
        primary_color VARCHAR(10),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Agencies tablosu oluşturuldu!');

    // 3. Ulaşım hatları
    console.log('🚌 Lines tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS transport_lines (
        id SERIAL PRIMARY KEY,
        line_code VARCHAR(100) NOT NULL,
        line_name VARCHAR(500) NOT NULL,
        line_type VARCHAR(50) NOT NULL,
        city_id INTEGER REFERENCES turkey_cities(id),
        agency_id INTEGER REFERENCES transport_agencies(id),
        route_description TEXT,
        fare_price DECIMAL(5,2),
        operating_hours JSONB,
        frequency_minutes INTEGER,
        is_accessible BOOLEAN DEFAULT FALSE,
        is_airconditioned BOOLEAN DEFAULT FALSE,
        vehicle_capacity INTEGER,
        color_code VARCHAR(10),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Lines tablosu oluşturuldu!');

    // 4. Duraklar
    console.log('📍 Stops tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS transport_stops (
        id SERIAL PRIMARY KEY,
        stop_code VARCHAR(100),
        stop_name VARCHAR(500) NOT NULL,
        stop_type VARCHAR(50) NOT NULL,
        city_id INTEGER REFERENCES turkey_cities(id),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        address TEXT,
        district VARCHAR(100),
        neighborhood VARCHAR(100),
        facilities JSONB,
        accessibility JSONB,
        safety_features JSONB,
        nearby_pois JSONB,
        weather_protection BOOLEAN DEFAULT FALSE,
        parking_available BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Stops tablosu oluşturuldu!');

    // 5. Hat-Durak ilişkileri
    console.log('🔗 Line-Stop connections tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS line_stop_connections (
        id SERIAL PRIMARY KEY,
        line_id INTEGER REFERENCES transport_lines(id) ON DELETE CASCADE,
        stop_id INTEGER REFERENCES transport_stops(id) ON DELETE CASCADE,
        stop_sequence INTEGER NOT NULL,
        direction VARCHAR(50) NOT NULL,
        travel_time_to_next INTEGER,
        distance_to_next INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(line_id, stop_id, direction)
      )
    `;
    console.log('✅ Line-Stop connections tablosu oluşturuldu!');

    // 6. Yoğunluk raporları
    console.log('📊 Crowding reports tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS transport_crowding_reports (
        id SERIAL PRIMARY KEY,
        report_type VARCHAR(50) NOT NULL,
        line_id INTEGER REFERENCES transport_lines(id),
        stop_id INTEGER REFERENCES transport_stops(id),
        vehicle_id VARCHAR(100),
        crowding_level VARCHAR(20) NOT NULL,
        crowding_percentage INTEGER CHECK (crowding_percentage >= 0 AND crowding_percentage <= 100),
        estimated_passengers INTEGER,
        current_latitude DECIMAL(10, 8),
        current_longitude DECIMAL(11, 8),
        reported_by INTEGER REFERENCES users(id),
        reporting_method VARCHAR(50) DEFAULT 'manual',
        verification_count INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        weather_condition VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Crowding reports tablosu oluşturuldu!');

    // 7. İstatistikler
    console.log('📈 Stats tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS transport_stats (
        id SERIAL PRIMARY KEY,
        stat_type VARCHAR(50) NOT NULL,
        city_id INTEGER REFERENCES turkey_cities(id),
        line_id INTEGER REFERENCES transport_lines(id),
        stop_id INTEGER REFERENCES transport_stops(id),
        hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
        day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
        is_weekend BOOLEAN DEFAULT FALSE,
        avg_crowding_level DECIMAL(3,2),
        total_reports INTEGER DEFAULT 0,
        avg_wait_time INTEGER,
        last_calculated TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Stats tablosu oluşturuldu!');

    // 8. Index'leri oluştur
    console.log('📊 Transport index\'leri oluşturuluyor...');
    await sql`CREATE INDEX IF NOT EXISTS idx_cities_code ON turkey_cities(city_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_agencies_city ON transport_agencies(city_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lines_city ON transport_lines(city_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lines_type ON transport_lines(line_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stops_city ON transport_stops(city_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stops_location ON transport_stops(latitude, longitude)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crowding_line ON transport_crowding_reports(line_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crowding_time ON transport_crowding_reports(created_at DESC)`;
    console.log('✅ Transport index\'leri oluşturuldu!');

    // 9. Demo verilerini ekle
    console.log('🎭 Ankara demo verilerini ekliyor...');
    
    // Ankara şehri
    await sql`
      INSERT INTO turkey_cities (city_name, city_code, region, population, transport_tier, has_metro, has_bus, latitude, longitude) 
      VALUES ('Ankara', 'ANK', 'İç Anadolu', 5663322, 'metropol', TRUE, TRUE, 39.9334, 32.8597)
      ON CONFLICT (city_code) DO NOTHING
    `;

    // EGO kurumu
    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('EGO Genel Müdürlüğü', 'EGO', 
        (SELECT id FROM turkey_cities WHERE city_code = 'ANK'), 
        'municipal', 'https://ego.gov.tr', '#FF5733')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    // Ana hatlar
    await sql`
      INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
      SELECT '405', 'Kızılay - Batıkent', 'bus', c.id, a.id, 4.50, 8, 90, '#FF5733'
      FROM turkey_cities c, transport_agencies a 
      WHERE c.city_code = 'ANK' AND a.agency_code = 'EGO'
      ON CONFLICT DO NOTHING
    `;

    await sql`
      INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
      SELECT 'M1', 'Kızılay - Batıkent Metro', 'metro', c.id, a.id, 4.50, 5, 300, '#0066CC'
      FROM turkey_cities c, transport_agencies a 
      WHERE c.city_code = 'ANK' AND a.agency_code = 'EGO'
      ON CONFLICT DO NOTHING
    `;

    await sql`
      INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
      SELECT 'M2', 'Kızılay - Çayyolu Metro', 'metro', c.id, a.id, 4.50, 6, 300, '#00AA44'
      FROM turkey_cities c, transport_agencies a 
      WHERE c.city_code = 'ANK' AND a.agency_code = 'EGO'
      ON CONFLICT DO NOTHING
    `;

    await sql`
      INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
      SELECT '411', 'Kızılay - Keçiören', 'bus', c.id, a.id, 4.50, 10, 90, '#FF8800'
      FROM turkey_cities c, transport_agencies a 
      WHERE c.city_code = 'ANK' AND a.agency_code = 'EGO'
      ON CONFLICT DO NOTHING
    `;

    // Ana duraklar
    await sql`
      INSERT INTO transport_stops (stop_name, stop_type, city_id, latitude, longitude, district, neighborhood, facilities) 
      VALUES ('Kızılay Metro İstasyonu', 'metro_station', 
        (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
        39.9208, 32.8541, 'Çankaya', 'Kızılay', 
        '{"shelter": true, "bench": true, "wifi": true, "charging": true}')
      ON CONFLICT DO NOTHING
    `;

    await sql`
      INSERT INTO transport_stops (stop_name, stop_type, city_id, latitude, longitude, district, neighborhood, facilities) 
      VALUES ('Batıkent Metro İstasyonu', 'metro_station',
        (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
        39.9697, 32.7347, 'Yenimahalle', 'Batıkent',
        '{"shelter": true, "bench": true, "wifi": true}')
      ON CONFLICT DO NOTHING
    `;

    await sql`
      INSERT INTO transport_stops (stop_name, stop_type, city_id, latitude, longitude, district, neighborhood, facilities) 
      VALUES ('Ulus Meydanı', 'bus_stop',
        (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
        39.9458, 32.8597, 'Altındağ', 'Ulus',
        '{"shelter": true, "bench": true}')
      ON CONFLICT DO NOTHING
    `;

    console.log('✅ Demo verileri eklendi!');

    console.log('\n🎉 TOPLU TAŞIMA MODÜLÜ HAZIR! ✅');
    console.log('📊 Oluşturulan tablolar:');
    console.log('   - turkey_cities (şehirler)');
    console.log('   - transport_agencies (ulaşım kurumları)');
    console.log('   - transport_lines (hatlar)');
    console.log('   - transport_stops (duraklar)');
    console.log('   - line_stop_connections (hat-durak ilişkileri)');
    console.log('   - transport_crowding_reports (yoğunluk raporları)');
    console.log('   - transport_stats (istatistikler)');
    console.log('\n✅ Ankara demo verili hazır!');
    console.log('🌐 Test etmek için: https://city-v.com/transport');

  } catch (error) {
    console.error('❌ Toplu taşıma tabloları oluşturma hatası:', error);
    process.exit(1);
  }
}

createTransportTables();