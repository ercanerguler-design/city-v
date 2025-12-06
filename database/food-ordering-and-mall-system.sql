-- ============================================
-- FOOD ORDERING SYSTEM - COMPLETE SCHEMA
-- ============================================

-- Food Orders Tablosu (siparişler)
CREATE TABLE IF NOT EXISTS food_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  business_profile_id INTEGER REFERENCES business_profiles(id),
  
  -- Sipariş detayları
  items JSONB NOT NULL, -- [{menuItemId, name, price, quantity, options}]
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Müşteri bilgileri
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  delivery_address TEXT,
  delivery_notes TEXT,
  
  -- Durum
  status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, delivered, cancelled
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  payment_method VARCHAR(20), -- online, cash
  payment_token VARCHAR(255),
  
  -- Zaman bilgileri
  order_time TIMESTAMP DEFAULT NOW(),
  estimated_delivery_time TIMESTAMP,
  delivered_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_food_orders_user ON food_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_business ON food_orders(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_orders_time ON food_orders(order_time DESC);

-- ============================================
-- MALL MANAGEMENT SYSTEM
-- ============================================

-- Malls (AVM'ler)
CREATE TABLE IF NOT EXISTS malls (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  total_floors INTEGER DEFAULT 0,
  description TEXT,
  opening_hours JSONB, -- {monday: {open: "09:00", close: "22:00"}, ...}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mall Floors (AVM Katları)
CREATE TABLE IF NOT EXISTS mall_floors (
  id SERIAL PRIMARY KEY,
  mall_id INTEGER REFERENCES malls(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL, -- -2, -1, 0, 1, 2 (bodrum, zemin, 1.kat...)
  name VARCHAR(255) NOT NULL, -- "Zemin Kat", "1. Kat"
  total_shops INTEGER DEFAULT 0,
  
  -- Koridorlar (Crowd Analysis için kritik!)
  corridors JSONB, -- [{name: "A Koridoru", zoneType: "main_corridor", capacity: 100}, ...]
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(mall_id, floor_number)
);

-- Mall Shops (AVM Mağazaları)
CREATE TABLE IF NOT EXISTS mall_shops (
  id SERIAL PRIMARY KEY,
  mall_id INTEGER REFERENCES malls(id) ON DELETE CASCADE,
  floor_id INTEGER REFERENCES mall_floors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- "Giyim", "Elektronik", "Yemek"
  corridor VARCHAR(100), -- "A Koridoru", "Food Court"
  shop_number VARCHAR(20),
  
  -- Business profili bağlantısı (opsiyonel)
  business_profile_id INTEGER REFERENCES business_profiles(id),
  
  -- Kamera bağlantısı
  has_camera BOOLEAN DEFAULT FALSE,
  camera_id INTEGER REFERENCES business_cameras(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mall Crowd Analysis (AVM Yoğunluk Analizi)
CREATE TABLE IF NOT EXISTS mall_crowd_analysis (
  id SERIAL PRIMARY KEY,
  mall_id INTEGER REFERENCES malls(id) ON DELETE CASCADE,
  floor_id INTEGER REFERENCES mall_floors(id) ON DELETE CASCADE,
  corridor_name VARCHAR(100), -- Hangi koridor
  
  -- Crowd verisi
  people_count INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER, -- Koridorun kapasitesi
  density_level VARCHAR(20), -- empty, low, medium, high, overcrowded
  
  -- Zaman
  analysis_time TIMESTAMP DEFAULT NOW(),
  hour_of_day INTEGER, -- 0-23 (saat bazlı analiz için)
  day_of_week INTEGER, -- 0-6 (gün bazlı analiz için)
  
  -- IoT Integration
  device_id VARCHAR(255),
  confidence FLOAT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mall_analysis_mall ON mall_crowd_analysis(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_analysis_floor ON mall_crowd_analysis(floor_id);
CREATE INDEX IF NOT EXISTS idx_mall_analysis_time ON mall_crowd_analysis(analysis_time DESC);
CREATE INDEX IF NOT EXISTS idx_mall_analysis_corridor ON mall_crowd_analysis(corridor_name);

-- ============================================
-- TEST DATA
-- ============================================

-- Test AVM ekle
INSERT INTO malls (name, location, total_floors, description) VALUES
('Ankara AVM', 'Çankaya, Ankara', 5, 'Test alışveriş merkezi')
ON CONFLICT DO NOTHING;

-- Test Kat ekle
INSERT INTO mall_floors (mall_id, floor_number, name, total_shops, corridors) VALUES
(1, 0, 'Zemin Kat', 20, 
 '[
   {"name": "A Koridoru", "zoneType": "main_corridor", "capacity": 100},
   {"name": "B Koridoru", "zoneType": "main_corridor", "capacity": 80},
   {"name": "Food Court", "zoneType": "food_court", "capacity": 150}
 ]'::jsonb
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE food_orders IS 'Food ordering system - siparişler';
COMMENT ON TABLE malls IS 'Mall management - AVM yönetimi';
COMMENT ON TABLE mall_floors IS 'Mall floors with corridors for crowd analysis';
COMMENT ON TABLE mall_crowd_analysis IS 'Real-time crowd analysis per corridor';
