/**
 * Neon Database Tablo Kontrolü ve Setup
 * Tüm tabloları kontrol edip eksik olanları oluşturur
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkAndSetupDatabase() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Neon PostgreSQL bağlantısı başarılı\n');

    // Mevcut tabloları kontrol et
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Mevcut tablolar:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log('');

    // Gerekli tablolar listesi
    const requiredTables = [
      'users',
      'business_users', 
      'business_profiles',
      'business_campaigns',
      'business_notifications',
      'iot_devices',
      'iot_crowd_analysis',
      'reviews',
      'transport_stops'
    ];

    const existingTables = result.rows.map(r => r.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length === 0) {
      console.log('✅ Tüm tablolar mevcut!\n');
      
      // Her tablodaki kayıt sayısını göster
      console.log('📊 Tablo içerikleri:');
      for (const table of requiredTables) {
        if (existingTables.includes(table)) {
          const count = await client.query(`SELECT COUNT(*) FROM ${table}`);
          console.log(`  - ${table}: ${count.rows[0].count} kayıt`);
        }
      }
    } else {
      console.log('⚠️ Eksik tablolar:', missingTables.join(', '));
      console.log('\n🔧 Eksik tablolar oluşturuluyor...\n');

      // Eksik tabloları oluştur
      if (missingTables.includes('iot_crowd_analysis')) {
        console.log('📋 iot_crowd_analysis tablosu oluşturuluyor...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS iot_crowd_analysis (
            id SERIAL PRIMARY KEY,
            device_id VARCHAR(100) NOT NULL,
            location VARCHAR(255),
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            crowd_level VARCHAR(50),
            people_count INTEGER,
            density_percentage DECIMAL(5,2),
            confidence DECIMAL(5,2),
            timestamp TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_iot_crowd_timestamp ON iot_crowd_analysis(timestamp DESC);
          CREATE INDEX IF NOT EXISTS idx_iot_crowd_location ON iot_crowd_analysis(latitude, longitude);
        `);
        console.log('✅ iot_crowd_analysis tablosu oluşturuldu\n');
      }

      if (missingTables.includes('transport_stops')) {
        console.log('📋 transport_stops tablosu oluşturuluyor...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS transport_stops (
            id SERIAL PRIMARY KEY,
            stop_id VARCHAR(100) UNIQUE NOT NULL,
            stop_name VARCHAR(255) NOT NULL,
            stop_type VARCHAR(50),
            latitude DECIMAL(10,8) NOT NULL,
            longitude DECIMAL(11,8) NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
        console.log('✅ transport_stops tablosu oluşturuldu\n');
      }

      if (missingTables.includes('reviews')) {
        console.log('📋 reviews tablosu oluşturuluyor...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
            user_name VARCHAR(255),
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            sentiment VARCHAR(50),
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_user_id, created_at DESC);
        `);
        console.log('✅ reviews tablosu oluşturuldu\n');
      }
    }

    await client.end();
    console.log('\n🎉 Database kontrol tamamlandı!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAndSetupDatabase();
