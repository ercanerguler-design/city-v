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
-- TOPLU TAŞIMA MODÜLÜ TABLOLARI
-- ============================================

-- 5. ŞEHİRLER VE BÖLGELER
CREATE TABLE IF NOT EXISTS turkey_cities (
  id SERIAL PRIMARY KEY,
  city_name VARCHAR(100) NOT NULL,
  city_code VARCHAR(10) UNIQUE, -- 'ANK', 'IST', 'IZM'
  region VARCHAR(50), -- 'İç Anadolu', 'Marmara', 'Ege'
  population INTEGER,
  transport_tier VARCHAR(20), -- 'metropol', 'major', 'medium', 'small'
  has_metro BOOLEAN DEFAULT FALSE,
  has_bus BOOLEAN DEFAULT TRUE,
  has_tram BOOLEAN DEFAULT FALSE,
  has_ferry BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. ULAŞIM KURUMLARI
CREATE TABLE IF NOT EXISTS transport_agencies (
  id SERIAL PRIMARY KEY,
  agency_name VARCHAR(255) NOT NULL, -- 'EGO', 'IETT', 'ESHOT'
  agency_code VARCHAR(20) UNIQUE, -- 'EGO', 'IETT', 'ESHOT'
  city_id INTEGER REFERENCES turkey_cities(id),
  agency_type VARCHAR(50), -- 'municipal', 'private', 'national'
  website VARCHAR(255),
  api_endpoint VARCHAR(255), -- Eğer API varsa
  contact_info JSONB,
  logo_url VARCHAR(255),
  primary_color VARCHAR(10), -- #FF5733
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. ULAŞIM HATLARI
CREATE TABLE IF NOT EXISTS transport_lines (
  id SERIAL PRIMARY KEY,
  line_code VARCHAR(100) NOT NULL, -- '405', 'M1', 'BU-1'
  line_name VARCHAR(500) NOT NULL, -- 'Kızılay-Batıkent'
  line_type VARCHAR(50) NOT NULL, -- 'metro', 'bus', 'tram', 'ferry', 'dolmus'
  city_id INTEGER REFERENCES turkey_cities(id),
  agency_id INTEGER REFERENCES transport_agencies(id),
  route_description TEXT, -- Güzergah açıklaması
  fare_price DECIMAL(5,2), -- Bilet ücreti
  operating_hours JSONB, -- {"start": "05:00", "end": "24:00"}
  frequency_minutes INTEGER, -- Ortalama sefer aralığı
  is_accessible BOOLEAN DEFAULT FALSE, -- Engelli erişimi
  is_airconditioned BOOLEAN DEFAULT FALSE,
  vehicle_capacity INTEGER,
  color_code VARCHAR(10), -- Hat rengi (#FF5733)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. DURAKLAR
CREATE TABLE IF NOT EXISTS transport_stops (
  id SERIAL PRIMARY KEY,
  stop_code VARCHAR(100), -- Durak kodu
  stop_name VARCHAR(500) NOT NULL,
  stop_type VARCHAR(50) NOT NULL, -- 'bus_stop', 'metro_station', 'tram_stop'
  city_id INTEGER REFERENCES turkey_cities(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  district VARCHAR(100), -- 'Çankaya', 'Keçiören'
  neighborhood VARCHAR(100), -- 'Kızılay', 'Bahçelievler'
  
  -- Durak Özellikleri
  facilities JSONB, -- {"shelter": true, "bench": true, "wifi": true}
  accessibility JSONB, -- {"wheelchair": true, "audio": true}
  safety_features JSONB, -- {"lighting": true, "camera": true}
  
  -- Çevre Bilgileri
  nearby_pois JSONB, -- {"hospital": "Hacettepe", "mall": "Armada"}
  weather_protection BOOLEAN DEFAULT FALSE,
  parking_available BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. HAT-DURAK İLİŞKİLERİ
CREATE TABLE IF NOT EXISTS line_stop_connections (
  id SERIAL PRIMARY KEY,
  line_id INTEGER REFERENCES transport_lines(id) ON DELETE CASCADE,
  stop_id INTEGER REFERENCES transport_stops(id) ON DELETE CASCADE,
  stop_sequence INTEGER NOT NULL, -- Durak sırası
  direction VARCHAR(50) NOT NULL, -- 'inbound', 'outbound'
  travel_time_to_next INTEGER, -- Sonraki durağa dakika
  distance_to_next INTEGER, -- Metre cinsinden
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(line_id, stop_id, direction)
);

-- 10. CANLI YOĞUNLUK RAPORLARI
CREATE TABLE IF NOT EXISTS transport_crowding_reports (
  id SERIAL PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL, -- 'vehicle', 'stop'
  
  -- Referanslar
  line_id INTEGER REFERENCES transport_lines(id),
  stop_id INTEGER REFERENCES transport_stops(id),
  vehicle_id VARCHAR(100), -- Araç plaka/kimlik
  
  -- Yoğunluk Bilgileri
  crowding_level VARCHAR(20) NOT NULL, -- 'empty', 'low', 'medium', 'high', 'full'
  crowding_percentage INTEGER CHECK (crowding_percentage >= 0 AND crowding_percentage <= 100),
  estimated_passengers INTEGER,
  
  -- Konum & Zaman
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  
  -- Raporlama
  reported_by INTEGER REFERENCES users(id),
  reporting_method VARCHAR(50) DEFAULT 'manual', -- 'manual', 'gps', 'sensor'
  
  -- Doğrulama
  verification_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Ek Bilgiler
  weather_condition VARCHAR(50),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. ULAŞIM İSTATİSTİKLERİ
CREATE TABLE IF NOT EXISTS transport_stats (
  id SERIAL PRIMARY KEY,
  stat_type VARCHAR(50) NOT NULL, -- 'hourly', 'daily', 'weekly'
  
  -- Referans
  city_id INTEGER REFERENCES turkey_cities(id),
  line_id INTEGER REFERENCES transport_lines(id),
  stop_id INTEGER REFERENCES transport_stops(id),
  
  -- Zaman
  hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_weekend BOOLEAN DEFAULT FALSE,
  
  -- İstatistikler
  avg_crowding_level DECIMAL(3,2),
  total_reports INTEGER DEFAULT 0,
  avg_wait_time INTEGER, -- dakika
  
  last_calculated TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TOPLU TAŞIMA INDEXES
-- ============================================

-- Cities indexes
CREATE INDEX IF NOT EXISTS idx_cities_code ON turkey_cities(city_code);
CREATE INDEX IF NOT EXISTS idx_cities_active ON turkey_cities(is_active);

-- Agencies indexes
CREATE INDEX IF NOT EXISTS idx_agencies_city ON transport_agencies(city_id);
CREATE INDEX IF NOT EXISTS idx_agencies_code ON transport_agencies(agency_code);

-- Lines indexes
CREATE INDEX IF NOT EXISTS idx_lines_city ON transport_lines(city_id);
CREATE INDEX IF NOT EXISTS idx_lines_agency ON transport_lines(agency_id);
CREATE INDEX IF NOT EXISTS idx_lines_type ON transport_lines(line_type);
CREATE INDEX IF NOT EXISTS idx_lines_code ON transport_lines(line_code);

-- Stops indexes
CREATE INDEX IF NOT EXISTS idx_stops_city ON transport_stops(city_id);
CREATE INDEX IF NOT EXISTS idx_stops_location ON transport_stops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_stops_type ON transport_stops(stop_type);

-- Line-Stop connections indexes
CREATE INDEX IF NOT EXISTS idx_connections_line ON line_stop_connections(line_id);
CREATE INDEX IF NOT EXISTS idx_connections_stop ON line_stop_connections(stop_id);

-- Crowding reports indexes
CREATE INDEX IF NOT EXISTS idx_crowding_line ON transport_crowding_reports(line_id);
CREATE INDEX IF NOT EXISTS idx_crowding_stop ON transport_crowding_reports(stop_id);
CREATE INDEX IF NOT EXISTS idx_crowding_time ON transport_crowding_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowding_verified ON transport_crowding_reports(is_verified);

-- Stats indexes
CREATE INDEX IF NOT EXISTS idx_stats_city ON transport_stats(city_id);
CREATE INDEX IF NOT EXISTS idx_stats_line ON transport_stats(line_id);
CREATE INDEX IF NOT EXISTS idx_stats_time ON transport_stats(hour_of_day, day_of_week);

-- ============================================
-- DEMO VERİLERİ - ANKARA
-- ============================================

-- Ankara şehri
INSERT INTO turkey_cities (city_name, city_code, region, population, transport_tier, has_metro, has_bus, latitude, longitude) 
VALUES ('Ankara', 'ANK', 'İç Anadolu', 5663322, 'metropol', TRUE, TRUE, 39.9334, 32.8597)
ON CONFLICT (city_code) DO NOTHING;

-- EGO kurumu
INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
VALUES ('EGO Genel Müdürlüğü', 'EGO', 
  (SELECT id FROM turkey_cities WHERE city_code = 'ANK'), 
  'municipal', 'https://ego.gov.tr', '#FF5733')
ON CONFLICT (agency_code) DO NOTHING;

-- Ana hatlar
INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) VALUES
('405', 'Kızılay - Batıkent', 'bus', 
  (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
  (SELECT id FROM transport_agencies WHERE agency_code = 'EGO'),
  4.50, 8, 90, '#FF5733'),
('M1', 'Kızılay - Batıkent Metro', 'metro', 
  (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
  (SELECT id FROM transport_agencies WHERE agency_code = 'EGO'),
  4.50, 5, 300, '#0066CC'),
('M2', 'Kızılay - Çayyolu Metro', 'metro', 
  (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
  (SELECT id FROM transport_agencies WHERE agency_code = 'EGO'),
  4.50, 6, 300, '#00AA44'),
('411', 'Kızılay - Keçiören', 'bus', 
  (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
  (SELECT id FROM transport_agencies WHERE agency_code = 'EGO'),
  4.50, 10, 90, '#FF8800')
ON CONFLICT DO NOTHING;

-- Ana duraklar
INSERT INTO transport_stops (stop_name, stop_type, city_id, latitude, longitude, district, neighborhood, facilities) VALUES
('Kızılay Metro İstasyonu', 'metro_station', 
  (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
  39.9208, 32.8541, 'Çankaya', 'Kızılay', 
  '{"shelter": true, "bench": true, "wifi": true, "charging": true}'),
('Batıkent Metro İstasyonu', 'metro_station',
  (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
  39.9697, 32.7347, 'Yenimahalle', 'Batıkent',
  '{"shelter": true, "bench": true, "wifi": true}'),
('Ulus Meydanı', 'bus_stop',
  (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
  39.9458, 32.8597, 'Altındağ', 'Ulus',
  '{"shelter": true, "bench": true}'),
('Çankaya Belediyesi', 'bus_stop',
  (SELECT id FROM turkey_cities WHERE city_code = 'ANK'),
  39.9180, 32.8623, 'Çankaya', 'Çankaya',
  '{"shelter": true, "bench": false}')
ON CONFLICT DO NOTHING;

-- ============================================
-- BAŞARILI! TOPLU TAŞIMA MODÜLÜ HAZIR
-- ============================================
-- ============================================
