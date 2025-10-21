// Database tabloları oluşturma scripti
// Usage: node database/createTables.js

// .env.local dosyasını yükle
require('dotenv').config({ path: '.env.local' });

const { sql } = require('@vercel/postgres');

async function createTables() {
  try {
    console.log('🔌 Neon Postgres\'e bağlanıyor...');
    
    // 1. Users tablosu
    console.log('📋 Users tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        membership_tier VARCHAR(50) DEFAULT 'free',
        membership_expiry TIMESTAMP,
        ai_credits INTEGER DEFAULT 100,
        google_id VARCHAR(255) UNIQUE,
        profile_picture TEXT,
        phone VARCHAR(50),
        join_date TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('✅ Users tablosu oluşturuldu!');

    // 2. Beta Applications tablosu
    console.log('📋 Beta Applications tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS beta_applications (
        id SERIAL PRIMARY KEY,
        application_id VARCHAR(50) UNIQUE NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        location VARCHAR(255) NOT NULL,
        business_type VARCHAR(100) NOT NULL,
        average_daily VARCHAR(100),
        opening_hours VARCHAR(100),
        current_solution VARCHAR(255),
        goals TEXT[],
        heard_from VARCHAR(100),
        website VARCHAR(255),
        additional_info TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        admin_notes TEXT,
        contacted_at TIMESTAMP,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('✅ Beta Applications tablosu oluşturuldu!');

    // 3. Admin Logs tablosu
    console.log('📋 Admin Logs tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_email VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id INTEGER,
        details JSONB,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('✅ Admin Logs tablosu oluşturuldu!');

    // 4. User Activities tablosu
    console.log('📋 User Activities tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(100) NOT NULL,
        location_id VARCHAR(255),
        location_name VARCHAR(255),
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('✅ User Activities tablosu oluşturuldu!');

    // Indexes oluştur
    console.log('📊 Index\'ler oluşturuluyor...');
    
    // Users indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership_tier)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)`;
    
    // Beta Applications indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_beta_status ON beta_applications(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_beta_email ON beta_applications(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_beta_created ON beta_applications(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_beta_application_id ON beta_applications(application_id)`;
    
    // Admin Logs indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC)`;
    
    // User Activities indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_type ON user_activities(activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_created ON user_activities(created_at DESC)`;
    
    console.log('✅ Index\'ler oluşturuldu!');

    // Demo data ekle
    console.log('🎭 Demo data ekleniyor...');
    
    await sql`
      INSERT INTO users (email, name, membership_tier, ai_credits) 
      VALUES ('demo@cityv.app', 'Demo User', 'free', 100)
      ON CONFLICT (email) DO NOTHING
    `;
    
    await sql`
      INSERT INTO beta_applications (
        application_id, business_name, owner_name, email, phone, 
        location, business_type, average_daily, opening_hours, 
        goals, status
      ) VALUES (
        'BETA-DEMO001', 
        'Demo Cafe', 
        'Demo Owner', 
        'demo@cafe.com', 
        '+90 532 123 4567',
        'Kızılay, Ankara', 
        'cafe', 
        '100-150', 
        '08:00 - 22:00',
        ARRAY['Yoğunluk takibi', 'City-V entegrasyonu'],
        'pending'
      ) ON CONFLICT (application_id) DO NOTHING
    `;
    
    console.log('✅ Demo data eklendi!');
    
    console.log('\n🎉 DATABASE SETUP TAMAMLANDI! ✅');
    console.log('📊 Oluşturulan tablolar:');
    console.log('   - users');
    console.log('   - beta_applications');
    console.log('   - admin_logs');
    console.log('   - user_activities');
    console.log('\n✅ Tüm tablolar ve indexler hazır!');
    
  } catch (error) {
    console.error('❌ Database setup hatası:', error);
    throw error;
  }
}

// Scripti çalıştır
createTables()
  .then(() => {
    console.log('\n✅ Script başarıyla tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script başarısız:', error);
    process.exit(1);
  });
