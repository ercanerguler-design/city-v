-- ============================================
-- CITY-V: AVM & FOOD ORDERING MODULES
-- Neon Postgres Compatible
-- ============================================

-- ============================================
-- AVM KIRA YÖNETİM SİSTEMİ
-- ============================================

-- 1. AVM'ler (Mall Buildings)
CREATE TABLE IF NOT EXISTS malls (
  id SERIAL PRIMARY KEY,
  business_profile_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  mall_name VARCHAR(255) NOT NULL,
  total_floors INTEGER NOT NULL DEFAULT 3,
  total_shops INTEGER NOT NULL DEFAULT 0,
  total_area_sqm DECIMAL(10,2), -- Toplam metrekare
  address TEXT NOT NULL,
  city VARCHAR(100),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  opening_hours JSONB, -- {"monday": {"open": "10:00", "close": "22:00"}, ...}
  amenities JSONB, -- ["parking", "food_court", "cinema", ...]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. AVM Katları (Mall Floors)
CREATE TABLE IF NOT EXISTS mall_floors (
  id SERIAL PRIMARY KEY,
  mall_id INTEGER REFERENCES malls(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL, -- -2, -1, 0, 1, 2, 3... (basement negatif)
  floor_name VARCHAR(100), -- "Zemin Kat", "1. Kat", "Bodrum"
  total_area_sqm DECIMAL(10,2),
  camera_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. AVM Mağazaları (Mall Shops/Tenants)
CREATE TABLE IF NOT EXISTS mall_shops (
  id SERIAL PRIMARY KEY,
  mall_id INTEGER REFERENCES malls(id) ON DELETE CASCADE,
  floor_id INTEGER REFERENCES mall_floors(id) ON DELETE CASCADE,
  shop_name VARCHAR(255) NOT NULL,
  shop_number VARCHAR(50), -- "A-123"
  category VARCHAR(100), -- "clothing", "food", "electronics", "services"
  brand_name VARCHAR(255),
  area_sqm DECIMAL(10,2) NOT NULL,
  monthly_rent DECIMAL(10,2), -- Aylık kira
  rent_per_sqm DECIMAL(10,2), -- Metrekare başı kira
  contract_start_date DATE,
  contract_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  tenant_contact_name VARCHAR(255),
  tenant_contact_phone VARCHAR(20),
  tenant_contact_email VARCHAR(255),
  location_zone VARCHAR(50), -- "entrance", "corner", "corridor", "central"
  foot_traffic_zone VARCHAR(50), -- "high", "medium", "low" - camera'lardan hesaplanacak
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. AVM Kamera - Kat İlişkisi (Mall Cameras per Floor)
CREATE TABLE IF NOT EXISTS mall_cameras (
  id SERIAL PRIMARY KEY,
  mall_id INTEGER REFERENCES malls(id) ON DELETE CASCADE,
  floor_id INTEGER REFERENCES mall_floors(id) ON DELETE CASCADE,
  camera_id INTEGER REFERENCES business_cameras(id) ON DELETE CASCADE,
  zone_name VARCHAR(255), -- "Ana Koridor", "Giriş", "Yemek Alanı"
  zone_type VARCHAR(50), -- "corridor", "entrance", "food_court", "escalator", "elevator"
  coverage_area JSONB, -- Polygon coordinates: [{"x": 0, "y": 0}, ...]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. AVM Yoğunluk Analizi (Real-time Crowd per Floor/Zone)
CREATE TABLE IF NOT EXISTS mall_crowd_analysis (
  id SERIAL PRIMARY KEY,
  mall_id INTEGER REFERENCES malls(id) ON DELETE CASCADE,
  floor_id INTEGER REFERENCES mall_floors(id) ON DELETE CASCADE,
  camera_id INTEGER REFERENCES business_cameras(id) ON DELETE CASCADE,
  zone_name VARCHAR(255),
  people_count INTEGER NOT NULL DEFAULT 0,
  density_level VARCHAR(50), -- "empty", "low", "medium", "high", "overcrowded"
  average_speed DECIMAL(5,2), -- Ortalama yürüme hızı (m/s) - gelecek için
  dwell_time_seconds INTEGER, -- Ortalama bekleme süresi
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hour_of_day INTEGER, -- 0-23 saat analizi için
  day_of_week INTEGER -- 0-6 (Pazartesi-Pazar) trend analizi için
);

-- 6. AVM Kira Önerileri (AI-Powered Rent Suggestions)
CREATE TABLE IF NOT EXISTS mall_rent_suggestions (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES mall_shops(id) ON DELETE CASCADE,
  suggested_rent DECIMAL(10,2) NOT NULL,
  current_rent DECIMAL(10,2),
  foot_traffic_score DECIMAL(5,2), -- 0-100 puan
  visibility_score DECIMAL(5,2), -- 0-100 puan (köşe, ana koridor vs.)
  floor_popularity DECIMAL(5,2), -- Kat yoğunluk skoru
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  factors JSONB -- {"footTraffic": 85, "visibility": 90, "floorPopularity": 78, ...}
);

-- ============================================
-- YEMEK SİPARİŞ SİSTEMİ (FOOD ORDERING)
-- ============================================

-- 1. Kullanıcı Adresleri (User Delivery Addresses)
CREATE TABLE IF NOT EXISTS user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  address_title VARCHAR(100), -- "Ev", "İş", "Diğer"
  full_address TEXT NOT NULL,
  city VARCHAR(100),
  district VARCHAR(100),
  postal_code VARCHAR(10),
  address_lat DECIMAL(10,8),
  address_lng DECIMAL(11,8),
  building_no VARCHAR(50),
  apartment_no VARCHAR(50),
  floor VARCHAR(20),
  door_no VARCHAR(20),
  delivery_instructions TEXT, -- "Zil çalmasın", "Kapıdan bırak" vs.
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false, -- Adres doğrulandı mı?
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kullanıcı Telefon Doğrulama (Phone Verification)
CREATE TABLE IF NOT EXISTS user_phone_verification (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  verification_code VARCHAR(6),
  code_sent_at TIMESTAMP,
  verified_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sepet (Shopping Cart)
CREATE TABLE IF NOT EXISTS shopping_carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  business_profile_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, business_profile_id) -- Her kullanıcının her işletme için 1 sepeti
);

-- 4. Sepet Öğeleri (Cart Items)
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES shopping_carts(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES business_menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  notes TEXT, -- "Az acılı", "Soğansız" vs.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Siparişler (Orders)
CREATE TABLE IF NOT EXISTS food_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL, -- "ORD-2024-12-0001"
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  business_profile_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  address_id INTEGER REFERENCES user_addresses(id),
  
  -- Sipariş Bilgileri
  items JSONB NOT NULL, -- [{"itemId": 1, "name": "Pizza", "quantity": 2, "price": 45.00}, ...]
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  
  -- İletişim
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,
  
  -- Durum Takibi
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, ready, delivering, delivered, cancelled
  payment_method VARCHAR(50), -- "cash", "card", "online"
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
  
  -- Zaman Takibi
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  preparation_started_at TIMESTAMP,
  ready_at TIMESTAMP,
  delivered_at TIMESTAMP,
  estimated_delivery_time TIMESTAMP,
  
  -- İşletme Notları
  business_notes TEXT,
  cancellation_reason TEXT,
  rating INTEGER, -- 1-5 yıldız
  review_text TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sipariş Durum Geçmişi (Order Status History)
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES food_orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(100), -- "customer", "business", "system"
  notes TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. İşletme Teslimat Ayarları (Business Delivery Settings)
CREATE TABLE IF NOT EXISTS business_delivery_settings (
  id SERIAL PRIMARY KEY,
  business_profile_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE UNIQUE,
  accepts_orders BOOLEAN DEFAULT true,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  delivery_radius_km DECIMAL(5,2) DEFAULT 5.0,
  delivery_fee DECIMAL(10,2) DEFAULT 10.00,
  free_delivery_threshold DECIMAL(10,2), -- Bu tutarın üstü ücretsiz
  estimated_prep_time_minutes INTEGER DEFAULT 30,
  accepts_cash BOOLEAN DEFAULT true,
  accepts_card BOOLEAN DEFAULT false,
  accepts_online_payment BOOLEAN DEFAULT false,
  operating_hours JSONB, -- {"monday": [{"open": "11:00", "close": "23:00"}], ...}
  closed_dates JSONB, -- ["2024-01-01", "2024-12-31"] tatil günleri
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- İNDEXLER (Performance Optimization)
-- ============================================

-- AVM İndexleri
CREATE INDEX IF NOT EXISTS idx_malls_business ON malls(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_mall_floors_mall ON mall_floors(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_shops_mall ON mall_shops(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_shops_floor ON mall_shops(floor_id);
CREATE INDEX IF NOT EXISTS idx_mall_shops_active ON mall_shops(is_active);
CREATE INDEX IF NOT EXISTS idx_mall_cameras_mall ON mall_cameras(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_cameras_floor ON mall_cameras(floor_id);
CREATE INDEX IF NOT EXISTS idx_mall_crowd_timestamp ON mall_crowd_analysis(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mall_crowd_floor ON mall_crowd_analysis(floor_id, timestamp DESC);

-- Food Ordering İndexleri
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_phone_verification_user ON user_phone_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verification_phone ON user_phone_verification(phone_number);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_user ON shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_user ON food_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_business ON food_orders(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_orders_number ON food_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_food_orders_time ON food_orders(order_time DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_status_history(order_id);

-- ============================================
-- ÖRNEK VERİ (Test için)
-- ============================================

-- Örnek AVM
INSERT INTO malls (business_profile_id, mall_name, total_floors, total_shops, total_area_sqm, address, city, location_lat, location_lng)
VALUES 
(1, 'Nata Vega Outlet', 5, 150, 45000.00, 'Yenikent Mahallesi, Ankara', 'Ankara', 39.965305, 32.719734),
(1, 'Gordion AVM', 4, 120, 38000.00, 'Gordion, Ankara', 'Ankara', 39.883210, 32.720943)
ON CONFLICT DO NOTHING;

-- Teslimat ayarları
INSERT INTO business_delivery_settings (business_profile_id, accepts_orders, min_order_amount, delivery_fee, estimated_prep_time_minutes)
VALUES (1, true, 50.00, 15.00, 30)
ON CONFLICT (business_profile_id) DO NOTHING;

-- ============================================
-- VİEWS (Analiz için)
-- ============================================

-- AVM Kat Yoğunluk Özeti
CREATE OR REPLACE VIEW mall_floor_traffic_summary AS
SELECT 
  mf.id AS floor_id,
  mf.mall_id,
  m.mall_name,
  mf.floor_number,
  mf.floor_name,
  COUNT(DISTINCT mc.camera_id) AS camera_count,
  AVG(mca.people_count) AS avg_people_count,
  MAX(mca.people_count) AS peak_people_count,
  COUNT(DISTINCT ms.id) AS shop_count,
  SUM(ms.area_sqm) AS total_shop_area
FROM mall_floors mf
JOIN malls m ON mf.mall_id = m.id
LEFT JOIN mall_cameras mc ON mf.id = mc.floor_id
LEFT JOIN mall_crowd_analysis mca ON mf.id = mca.floor_id 
  AND mca.timestamp > NOW() - INTERVAL '1 hour'
LEFT JOIN mall_shops ms ON mf.id = ms.floor_id AND ms.is_active = true
GROUP BY mf.id, mf.mall_id, m.mall_name, mf.floor_number, mf.floor_name;

-- Aktif Siparişler Özeti
CREATE OR REPLACE VIEW active_orders_summary AS
SELECT 
  fo.id,
  fo.order_number,
  fo.status,
  fo.customer_name,
  fo.customer_phone,
  fo.final_amount,
  fo.order_time,
  bp.business_name,
  bp.id AS business_id,
  EXTRACT(EPOCH FROM (NOW() - fo.order_time))/60 AS elapsed_minutes
FROM food_orders fo
JOIN business_profiles bp ON fo.business_profile_id = bp.id
WHERE fo.status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering')
ORDER BY fo.order_time DESC;

COMMENT ON TABLE malls IS 'AVM Bilgileri - Mall Management System';
COMMENT ON TABLE mall_shops IS 'AVM Mağazaları - Kiracı yönetimi ve kira hesaplamaları';
COMMENT ON TABLE mall_crowd_analysis IS 'AVM Yoğunluk Analizi - Real-time kamera verileri';
COMMENT ON TABLE food_orders IS 'Yemek Siparişleri - Food delivery system';
COMMENT ON TABLE business_delivery_settings IS 'İşletme Teslimat Ayarları';
