-- ============================================
-- BUSINESS MEMBERSHIP SYSTEM - FULL SETUP
-- Admin tarafından manuel üye ekleme sistemi için tüm tablolar
-- ============================================

-- 1. Business kullanıcıları
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
  verification_token VARCHAR(255),
  
  -- Admin ekleme için ek alanlar
  company_name VARCHAR(255),
  company_type VARCHAR(100),
  company_address TEXT,
  company_city VARCHAR(100),
  company_district VARCHAR(100),
  tax_number VARCHAR(50),
  tax_office VARCHAR(100),
  authorized_person VARCHAR(255),
  added_by_admin BOOLEAN DEFAULT false,
  admin_notes TEXT
);

-- 2. Business profilleri
CREATE TABLE IF NOT EXISTS business_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  logo_url TEXT,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  working_hours JSONB,
  social_media JSONB,
  photos TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Business abonelik planları
CREATE TABLE IF NOT EXISTS business_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  monthly_price DECIMAL(10, 2),
  features JSONB,
  
  -- Admin ekleme için ek alanlar
  added_by_admin_id INTEGER,
  license_key VARCHAR(255) UNIQUE,
  max_users INTEGER DEFAULT 1,
  is_trial BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Kampanyalar
CREATE TABLE IF NOT EXISTS business_campaigns (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percent INTEGER,
  discount_amount DECIMAL(10, 2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  target_audience VARCHAR(50),
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP,
  reach_count INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. IoT Kameralar
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
  ai_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Index'ler (Performans için)
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_user_id ON business_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_dates ON business_subscriptions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_active ON business_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_business_users_company ON business_users(company_name);
CREATE INDEX IF NOT EXISTS idx_business_users_email ON business_users(email);

-- 7. Açıklamalar
COMMENT ON TABLE business_users IS 'Business kullanıcıları - Admin tarafından manuel eklenebilir';
COMMENT ON COLUMN business_users.added_by_admin IS 'Admin tarafından eklenen üye mi?';
COMMENT ON COLUMN business_subscriptions.license_key IS 'Benzersiz lisans anahtarı (CITYV-XXXX-XXXX-XXXX-XXXX)';
COMMENT ON COLUMN business_subscriptions.max_users IS 'Aynı lisans ile kaç kullanıcı giriş yapabilir';

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ Business Membership System tabloları başarıyla oluşturuldu!';
  RAISE NOTICE '📋 Oluşturulan tablolar:';
  RAISE NOTICE '   - business_users (kullanıcılar + firma bilgileri)';
  RAISE NOTICE '   - business_profiles (profil detayları)';
  RAISE NOTICE '   - business_subscriptions (abonelikler + lisans)';
  RAISE NOTICE '   - business_campaigns (kampanyalar)';
  RAISE NOTICE '   - business_cameras (IoT kameralar)';
END $$;
