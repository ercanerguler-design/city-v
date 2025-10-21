-- ============================================
-- CITY-V DATABASE SETUP
-- Vercel Postgres için Tablo Oluşturma Scripti
-- ============================================

-- 1. USERS TABLOSU (Kullanıcı Bilgileri)
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

-- 2. BETA APPLICATIONS TABLOSU (Beta Başvuruları)
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

-- 3. ADMIN LOGS TABLOSU (Admin İşlem Kayıtları)
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

-- 4. USER ACTIVITIES TABLOSU (Kullanıcı Aktiviteleri)
CREATE TABLE IF NOT EXISTS user_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  location_id VARCHAR(255),
  location_name VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES (Performans İçin)
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership_tier);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Beta Applications indexes
CREATE INDEX IF NOT EXISTS idx_beta_status ON beta_applications(status);
CREATE INDEX IF NOT EXISTS idx_beta_email ON beta_applications(email);
CREATE INDEX IF NOT EXISTS idx_beta_created ON beta_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_application_id ON beta_applications(application_id);

-- Admin Logs indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);

-- User Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON user_activities(created_at DESC);

-- ============================================
-- DEMO DATA (Test İçin - İsteğe Bağlı)
-- ============================================

-- Demo kullanıcı
INSERT INTO users (email, name, membership_tier, ai_credits) 
VALUES ('demo@cityv.app', 'Demo User', 'free', 100)
ON CONFLICT (email) DO NOTHING;

-- Demo beta başvurusu
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
) ON CONFLICT (application_id) DO NOTHING;

-- ============================================
-- BAŞARILI!
-- ============================================
-- Tablolar oluşturuldu! ✅
-- Şimdi bu SQL'i Vercel Dashboard'da çalıştır:
-- 1. https://vercel.com/dashboard'a git
-- 2. Storage > Postgres > Query Editor'e tıkla
-- 3. Bu SQL'i yapıştır ve "Run" butonuna bas
-- ============================================
