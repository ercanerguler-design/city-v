-- Business üyelik sistemi için Vercel Postgres tabloları

-- Business kullanıcıları
CREATE TABLE IF NOT EXISTS business_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'business_user', -- 'business_user', 'business_admin'
  added_by_admin BOOLEAN DEFAULT true, -- Admin tarafından mı eklendi?
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255)
);

-- Business profilleri (mağaza bilgileri)
CREATE TABLE IF NOT EXISTS business_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100), -- 'restaurant', 'retail', 'cafe', 'hotel', etc.
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
  working_hours JSONB, -- {"monday": {"open": "09:00", "close": "18:00"}, ...}
  social_media JSONB, -- {"instagram": "...", "facebook": "...", ...}
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business abonelik planları
CREATE TABLE IF NOT EXISTS business_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- 'premium' (249 TL, 10 kamera), 'enterprise' (499 TL, 50 kamera)
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  monthly_price DECIMAL(10, 2) NOT NULL, -- 249.00 veya 499.00
  max_cameras INTEGER NOT NULL, -- 10 veya 50
  license_key VARCHAR(255) UNIQUE, -- Lisans anahtarı
  added_by_admin INTEGER, -- Hangi admin ekledi
  features JSONB, -- {"ai_analytics": true, "push_notifications": true, "advanced_reports": true}
  notes TEXT, -- Admin notları
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Kampanyalar
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
  target_audience VARCHAR(50), -- 'all', 'new', 'vip'
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP,
  reach_count INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- IoT Kameralar
CREATE TABLE IF NOT EXISTS business_cameras (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  camera_name VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  port INTEGER DEFAULT 80,
  location_description VARCHAR(255), -- "Giriş", "Kasa", "Raf 1", etc.
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'offline', 'maintenance'
  is_active BOOLEAN DEFAULT true,
  stream_url TEXT,
  last_seen TIMESTAMP,
  fps INTEGER DEFAULT 0,
  resolution VARCHAR(20) DEFAULT '640x480',
  ai_enabled BOOLEAN DEFAULT true,
  zones JSONB, -- Kullanıcı tanımlı bölgeler {"kasa": {"x": 10, "y": 20, "w": 100, "h": 100}, ...}
  calibration_line JSONB, -- Giriş-çıkış kalibrasyon çizgisi {"x1": 0, "y1": 240, "x2": 640, "y2": 240}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Kalabalık Analizi (Gerçek zamanlı AI analiz verileri)
CREATE TABLE IF NOT EXISTS crowd_analysis (
  id SERIAL PRIMARY KEY,
  camera_id INTEGER REFERENCES business_cameras(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  people_count INTEGER DEFAULT 0,
  entry_count INTEGER DEFAULT 0, -- Giriş sayısı
  exit_count INTEGER DEFAULT 0, -- Çıkış sayısı
  current_occupancy INTEGER DEFAULT 0, -- İçerideki kişi sayısı
  crowd_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  heatmap_data JSONB, -- Heatmap koordinatları
  average_dwell_time INTEGER, -- Ortalama kalış süresi (saniye)
  zone_data JSONB, -- Bölge bazlı yoğunluk {"kasa": 5, "raf1": 3, ...}
  detected_objects JSONB -- AI tespit edilen nesneler
);

-- Push Notifications
CREATE TABLE IF NOT EXISTS push_notifications (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  campaign_id INTEGER REFERENCES business_campaigns(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50), -- 'campaign', 'system', 'alert'
  target_users TEXT[], -- Array of user IDs (NULL = tüm kullanıcılar)
  sent_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

-- Personel yönetimi
CREATE TABLE IF NOT EXISTS business_staff (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(100), -- "Müdür", "Satış", "Kasa", "Teknik"
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'on_leave', 'inactive'
  shift VARCHAR(50), -- "08:00-16:00", "16:00-00:00"
  hire_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Menü/Fiyat Listeleri
CREATE TABLE IF NOT EXISTS business_menus (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  menu_name VARCHAR(255) NOT NULL, -- "Ana Menü", "İçecekler", "Tatlılar"
  menu_type VARCHAR(50), -- 'food', 'beverage', 'product', 'service'
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menü Ürünleri
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER REFERENCES business_menus(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'TRY',
  image_url TEXT,
  category VARCHAR(100), -- "Kahvaltı", "Ana Yemek", "Tatlı"
  is_available BOOLEAN DEFAULT true,
  allergens TEXT[], -- ["Süt", "Yumurta", "Gluten"]
  calories INTEGER,
  preparation_time INTEGER, -- dakika
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- İndeksler (Performance için)
CREATE INDEX IF NOT EXISTS idx_business_users_email ON business_users(email);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_location ON business_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_business_campaigns_business_id ON business_campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_business_campaigns_active ON business_campaigns(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_business_cameras_business_id ON business_cameras(business_id);
CREATE INDEX IF NOT EXISTS idx_business_cameras_active ON business_cameras(is_active);
CREATE INDEX IF NOT EXISTS idx_crowd_analysis_camera_id ON crowd_analysis(camera_id);
CREATE INDEX IF NOT EXISTS idx_crowd_analysis_timestamp ON crowd_analysis(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_business_staff_business_id ON business_staff(business_id);
CREATE INDEX IF NOT EXISTS idx_business_menus_business_id ON business_menus(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id);
