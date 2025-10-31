-- ============================================
-- CITYV BUSINESS PROFESSIONAL SYSTEM
-- Tam özellikli işletme yönetim sistemi
-- ============================================

-- Menü Kategorileri
CREATE TABLE IF NOT EXISTS business_menu_categories (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- "Ana Yemekler", "İçecekler", "Tatlılar" vb.
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  icon VARCHAR(50), -- Emoji veya icon name
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menü Ürünleri
CREATE TABLE IF NOT EXISTS business_menu_items (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES business_menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2), -- İndirimli fiyat için orijinal fiyat
  currency VARCHAR(10) DEFAULT 'TRY',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Öne çıkan ürün
  allergens TEXT[], -- ["gluten", "dairy", "nuts"]
  dietary_info TEXT[], -- ["vegetarian", "vegan", "halal"]
  preparation_time INTEGER, -- Dakika cinsinden
  calories INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Kamera Sistemleri (Güncellenmiş - zones ve calibration)
CREATE TABLE IF NOT EXISTS business_cameras (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
  camera_name VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  port INTEGER DEFAULT 80,
  rtsp_url TEXT, -- RTSP stream URL
  location_description VARCHAR(255), -- "Giriş", "Kasa", "Raf 1", etc.
  status VARCHAR(20) DEFAULT 'offline', -- 'active', 'offline', 'error'
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP,
  fps INTEGER DEFAULT 0,
  resolution VARCHAR(20) DEFAULT '640x480',
  
  -- AI Özellikleri
  ai_enabled BOOLEAN DEFAULT true,
  features JSONB DEFAULT '{"entry_exit": true, "crowd_analysis": true, "zone_monitoring": true}'::jsonb,
  
  -- Kalibrasyon Çizgisi (Giriş-Çıkış)
  calibration_line JSONB, -- {"x1": 0, "y1": 240, "x2": 640, "y2": 240, "direction": "horizontal"}
  entry_direction VARCHAR(20) DEFAULT 'up_to_down', -- 'up_to_down', 'down_to_up', 'left_to_right', 'right_to_left'
  
  -- Bölge Tanımları (Kullanıcı çizecek)
  zones JSONB DEFAULT '[]'::jsonb, -- [{"name": "Kasa", "type": "checkout", "points": [[x1,y1], [x2,y2], ...]}, ...]
  
  -- İstatistikler
  total_entries INTEGER DEFAULT 0,
  total_exits INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 100,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Kamera Zaman Serisi Verileri (Anlık çekimler)
CREATE TABLE IF NOT EXISTS business_camera_snapshots (
  id SERIAL PRIMARY KEY,
  camera_id INTEGER REFERENCES business_cameras(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Giriş-Çıkış
  entries_count INTEGER DEFAULT 0,
  exits_count INTEGER DEFAULT 0,
  current_people INTEGER DEFAULT 0,
  
  -- Bölge bazlı yoğunluk
  zone_data JSONB, -- [{"zone_name": "Kasa", "people_count": 5, "density": 0.8}, ...]
  
  -- Isı haritası
  heatmap_data JSONB, -- Grid bazlı yoğunluk verisi
  
  -- Snapshot image (optional)
  snapshot_url TEXT,
  
  -- Ham AI çıktısı
  raw_data JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON business_menu_categories(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_business ON business_menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON business_menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_cameras_business ON business_cameras(business_id);
CREATE INDEX IF NOT EXISTS idx_camera_snapshots_camera ON business_camera_snapshots(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_snapshots_timestamp ON business_camera_snapshots(timestamp DESC);

-- Demo veriler için örnek insert (opsiyonel)
COMMENT ON TABLE business_menu_categories IS 'İşletme menü kategorileri - Kullanıcı tarafından yönetilir';
COMMENT ON TABLE business_menu_items IS 'Menü ürünleri - Fiyat, açıklama, görsel ve özel bilgiler';
COMMENT ON TABLE business_cameras IS 'AI kameralar - Kalibrasyon ve bölge tanımları ile';
COMMENT ON TABLE business_camera_snapshots IS 'Kamera anlık verileri - Zaman serisi analizi için';
