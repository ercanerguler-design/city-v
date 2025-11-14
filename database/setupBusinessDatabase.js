const { sql } = require('@vercel/postgres');

async function setupBusinessDatabase() {
  console.log('🚀 Business veritabanı kurulumu başlatılıyor...\n');

  try {
    // 1. Business Users
    console.log('📝 Business users tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255)
      )
    `;
    console.log('✅ business_users tablosu hazır\n');

    // 2. Business Profiles
    console.log('📝 Business profiles tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100),
        logo_url TEXT,
        description TEXT,
        address TEXT,
        city VARCHAR(100),
        phone VARCHAR(50),
        email VARCHAR(255),
        working_hours JSONB,
        photos TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ business_profiles tablosu hazır\n');

    // 3. Business Campaigns
    console.log('📝 Business campaigns tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_campaigns (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount_percent INTEGER,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        target_audience VARCHAR(50),
        notification_sent BOOLEAN DEFAULT false,
        notification_sent_at TIMESTAMP,
        reach_count INTEGER DEFAULT 0,
        engagement_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ business_campaigns tablosu hazır\n');

    // 4. Business Cameras
    console.log('📝 Business cameras tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_cameras (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
        camera_name VARCHAR(255) NOT NULL,
        camera_ip VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        stream_url TEXT,
        last_seen TIMESTAMP,
        fps INTEGER DEFAULT 0,
        resolution VARCHAR(20),
        ai_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ business_cameras tablosu hazır\n');

    // 5. Camera Analytics
    console.log('📝 Camera analytics tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS camera_analytics (
        id SERIAL PRIMARY KEY,
        camera_id INTEGER REFERENCES business_cameras(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT NOW(),
        people_count INTEGER DEFAULT 0,
        entries_count INTEGER DEFAULT 0,
        exits_count INTEGER DEFAULT 0,
        current_occupancy INTEGER DEFAULT 0,
        density_level VARCHAR(20),
        heatmap_data JSONB,
        average_dwell_time INTEGER,
        zone_data JSONB
      )
    `;
    console.log('✅ camera_analytics tablosu hazır\n');

    // 6. Push Notifications
    console.log('📝 Push notifications tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS push_notifications (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
        campaign_id INTEGER REFERENCES business_campaigns(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        notification_type VARCHAR(50),
        sent_count INTEGER DEFAULT 0,
        read_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        sent_at TIMESTAMP
      )
    `;
    console.log('✅ push_notifications tablosu hazır\n');

    // 7. Demo Data Ekle
    console.log('📝 Demo kullanıcı ve veri oluşturuluyor...');
    
    // Demo user (şifre: demo123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const userResult = await sql`
      INSERT INTO business_users (email, password_hash, full_name, phone)
      VALUES ('demo@cityv.com', ${hashedPassword}, 'Demo Business', '+90 555 123 4567')
      ON CONFLICT (email) DO UPDATE SET full_name = 'Demo Business'
      RETURNING id
    `;
    const userId = userResult.rows[0].id;

    // Demo profile
    const profileResult = await sql`
      INSERT INTO business_profiles (
        user_id, business_name, business_type, address, city, phone, email
      )
      VALUES (
        ${userId}, 'CityV Demo Mağaza', 'retail', 
        'Atatürk Caddesi No:123', 'Ankara', '+90 555 123 4567', 'demo@cityv.com'
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `;

    if (profileResult.rows.length > 0) {
      const businessId = profileResult.rows[0].id;

      // Demo camera
      await sql`
        INSERT INTO business_cameras (
          business_id, camera_name, camera_ip, location, is_active, ai_enabled
        )
        VALUES (
          ${businessId}, 'Ana Giriş Kamerası', '192.168.1.2', 'Giriş', true, true
        )
        ON CONFLICT DO NOTHING
      `;
    }

    console.log('✅ Demo veri eklendi\n');

    // 8. İndeksler
    console.log('📝 İndeksler oluşturuluyor...');
    await sql`CREATE INDEX IF NOT EXISTS idx_business_users_email ON business_users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_camera_analytics_camera_id ON camera_analytics(camera_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_camera_analytics_timestamp ON camera_analytics(timestamp)`;
    console.log('✅ İndeksler hazır\n');

    console.log('🎉 Veritabanı kurulumu tamamlandı!\n');
    console.log('📌 Demo Kullanıcı:');
    console.log('   Email: demo@cityv.com');
    console.log('   Şifre: demo123\n');

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  }
}

setupBusinessDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
