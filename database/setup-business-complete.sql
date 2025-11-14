-- ============================================
-- CITYV BUSINESS SYSTEM - VERCEL POSTGRES
-- Kurulum Scripti
-- ============================================

-- 1. Menü Kategorileri Tablosu
CREATE TABLE IF NOT EXISTS business_menu_categories (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  icon VARCHAR(50) DEFAULT '📦',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Menü Ürünleri Tablosu
CREATE TABLE IF NOT EXISTS business_menu_items (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  category_id INTEGER REFERENCES business_menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'TRY',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  allergens TEXT[],
  dietary_info TEXT[],
  preparation_time INTEGER,
  calories INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Business Cameras Tablosunu Güncelle (zones ve calibration_line ekle)
-- Önce mevcut yapıyı kontrol et
DO $$ 
BEGIN
  -- calibration_line kolonu yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_cameras' AND column_name = 'calibration_line'
  ) THEN
    ALTER TABLE business_cameras ADD COLUMN calibration_line JSONB;
    ALTER TABLE business_cameras ADD COLUMN entry_direction VARCHAR(20) DEFAULT 'up_to_down';
    ALTER TABLE business_cameras ADD COLUMN zones JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE business_cameras ADD COLUMN total_entries INTEGER DEFAULT 0;
    ALTER TABLE business_cameras ADD COLUMN total_exits INTEGER DEFAULT 0;
    ALTER TABLE business_cameras ADD COLUMN current_occupancy INTEGER DEFAULT 0;
    ALTER TABLE business_cameras ADD COLUMN max_capacity INTEGER DEFAULT 100;
    ALTER TABLE business_cameras ADD COLUMN ai_enabled BOOLEAN DEFAULT true;
    ALTER TABLE business_cameras ADD COLUMN features JSONB DEFAULT '{"entry_exit": true, "crowd_analysis": true, "zone_monitoring": true}'::jsonb;
    ALTER TABLE business_cameras ADD COLUMN rtsp_url TEXT;
    ALTER TABLE business_cameras ADD COLUMN resolution VARCHAR(20) DEFAULT '640x480';
    ALTER TABLE business_cameras ADD COLUMN fps INTEGER DEFAULT 0;
    ALTER TABLE business_cameras ADD COLUMN last_seen TIMESTAMP;
  END IF;
END $$;

-- 4. Kamera Snapshot Tablosu
CREATE TABLE IF NOT EXISTS business_camera_snapshots (
  id SERIAL PRIMARY KEY,
  camera_id INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  entries_count INTEGER DEFAULT 0,
  exits_count INTEGER DEFAULT 0,
  current_people INTEGER DEFAULT 0,
  zone_data JSONB,
  heatmap_data JSONB,
  snapshot_url TEXT,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON business_menu_categories(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_business ON business_menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON business_menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_camera_snapshots_camera ON business_camera_snapshots(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_snapshots_timestamp ON business_camera_snapshots(timestamp DESC);

-- 6. Demo Veri (Test için)
INSERT INTO business_menu_categories (business_id, name, icon, display_order) VALUES
  (1, 'İçecekler', '🥤', 1),
  (1, 'Ana Yemekler', '🍽️', 2),
  (1, 'Tatlılar', '🍰', 3)
ON CONFLICT DO NOTHING;

INSERT INTO business_menu_items (business_id, category_id, name, description, price, is_available) VALUES
  (1, 1, 'Türk Kahvesi', 'Geleneksel Türk kahvesi', 45.00, true),
  (1, 1, 'Espresso', 'İtalyan espresso', 35.00, true),
  (1, 2, 'Izgara Köfte', 'Özel baharatlarla', 150.00, true),
  (1, 3, 'Künefe', 'Tel kadayıf tatlısı', 120.00, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- TABLO KONTROL SORGUSU
-- ============================================

SELECT 
  'business_menu_categories' as table_name, 
  COUNT(*) as row_count 
FROM business_menu_categories
UNION ALL
SELECT 
  'business_menu_items' as table_name, 
  COUNT(*) as row_count 
FROM business_menu_items
UNION ALL
SELECT 
  'business_cameras' as table_name, 
  COUNT(*) as row_count 
FROM business_cameras
UNION ALL
SELECT 
  'business_camera_snapshots' as table_name, 
  COUNT(*) as row_count 
FROM business_camera_snapshots;

-- ============================================
-- BAŞARILI! Tablolar oluşturuldu.
-- ============================================
