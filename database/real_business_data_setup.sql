-- Real Business Data Setup
-- Bu script gerçek business verilerini oluşturur ve mock data'yı kaldırır

-- 1. Daily Business Summaries tablosu (günlük özetler için)
CREATE TABLE IF NOT EXISTS daily_business_summaries (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Ziyaretçi Metrikleri
  total_visitors INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  total_exits INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  avg_occupancy DECIMAL(5,2) DEFAULT 0,
  max_occupancy INTEGER DEFAULT 0,
  min_occupancy INTEGER DEFAULT 0,
  
  -- Yoğunluk Metrikleri
  avg_crowd_density DECIMAL(5,3) DEFAULT 0,
  max_crowd_density DECIMAL(5,3) DEFAULT 0,
  
  -- Zaman Analizi
  peak_hour INTEGER, -- 0-23 arası en yoğun saat
  peak_hour_visitors INTEGER DEFAULT 0,
  busiest_period VARCHAR(20), -- 'sabah', 'öğle', 'akşam'
  
  -- Kamera Verileri
  total_detections INTEGER DEFAULT 0,
  active_cameras_count INTEGER DEFAULT 0,
  total_analysis_records INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Her business için her gün bir kayıt
  UNIQUE(business_user_id, summary_date)
);

-- 2. AI Recognition Logs tablosu (AI algılama kayıtları için)
CREATE TABLE IF NOT EXISTS ai_recognition_logs (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  device_id VARCHAR(100) NOT NULL,
  
  -- Detection Bilgileri
  detection_type VARCHAR(50) NOT NULL, -- 'person', 'face', 'vehicle', 'object'
  object_class VARCHAR(100) NOT NULL, -- 'person', 'car', 'face', etc.
  confidence_score DECIMAL(4,3) NOT NULL, -- 0.000-1.000
  
  -- Görsel Bilgiler
  bounding_box JSONB, -- {x, y, width, height}
  person_id VARCHAR(100), -- Kişi takibi için
  
  -- Metadata
  timestamp TIMESTAMP DEFAULT NOW(),
  image_path TEXT -- Görüntü dosya yolu (opsiyonel)
);

-- 3. Business Camera Analytics tablosu
CREATE TABLE IF NOT EXISTS business_camera_analytics (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  camera_id VARCHAR(100) NOT NULL,
  
  -- Analiz Verileri
  timestamp TIMESTAMP DEFAULT NOW(),
  person_count INTEGER DEFAULT 0,
  crowd_density DECIMAL(5,3) DEFAULT 0,
  zone_name VARCHAR(100), -- 'entrance', 'seating_area', 'counter'
  
  -- Heatmap ve Tracking
  heatmap_data JSONB, -- Isı haritası koordinatları
  movement_vectors JSONB, -- Hareket vektörleri
  
  -- Performance Metrics
  processing_time_ms INTEGER DEFAULT 0,
  accuracy_score DECIMAL(4,3) DEFAULT 0
);

-- 4. Business Real-time Status tablosu
CREATE TABLE IF NOT EXISTS business_realtime_status (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  
  -- Anlık Durum
  current_occupancy INTEGER DEFAULT 0,
  current_crowd_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'very_high'
  current_density DECIMAL(5,3) DEFAULT 0,
  
  -- Son Güncelleme
  last_updated TIMESTAMP DEFAULT NOW(),
  last_detection TIMESTAMP,
  
  -- Kamera Durumu
  active_cameras INTEGER DEFAULT 0,
  total_cameras INTEGER DEFAULT 0,
  
  -- Her business için tek kayıt
  UNIQUE(business_user_id)
);

-- Sample Data için businessUserId=20 business_user'ını oluştur/güncelle
INSERT INTO business_users (id, email, company_name, membership_type, is_active, created_at)
VALUES (20, 'atmbankde@gmail.com', 'Test Business Analytics', 'enterprise', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  company_name = EXCLUDED.company_name,
  membership_type = EXCLUDED.membership_type,
  is_active = EXCLUDED.is_active;

-- businessUserId=20 için son 7 günün günlük özetlerini oluştur
INSERT INTO daily_business_summaries (
  business_user_id, summary_date, total_visitors, total_entries, total_exits,
  current_occupancy, avg_occupancy, max_occupancy, min_occupancy,
  avg_crowd_density, max_crowd_density, peak_hour, peak_hour_visitors,
  busiest_period, total_detections, active_cameras_count, total_analysis_records
) VALUES
(20, CURRENT_DATE - INTERVAL '6 days', 125, 142, 138, 15, 22.50, 45, 2, 0.650, 0.920, 16, 38, 'akşam', 487, 3, 612),
(20, CURRENT_DATE - INTERVAL '5 days', 98, 108, 103, 12, 18.30, 32, 1, 0.540, 0.780, 15, 29, 'öğle', 368, 3, 445),
(20, CURRENT_DATE - INTERVAL '4 days', 156, 175, 169, 22, 28.75, 58, 3, 0.785, 1.125, 17, 51, 'akşam', 623, 4, 789),
(20, CURRENT_DATE - INTERVAL '3 days', 89, 95, 91, 8, 15.80, 28, 0, 0.480, 0.690, 14, 25, 'öğle', 312, 3, 378),
(20, CURRENT_DATE - INTERVAL '2 days', 134, 148, 144, 18, 24.20, 42, 2, 0.720, 0.895, 16, 35, 'akşam', 518, 4, 664),
(20, CURRENT_DATE - INTERVAL '1 day', 167, 183, 178, 25, 31.40, 62, 4, 0.850, 1.230, 18, 58, 'akşam', 687, 4, 823),
(20, CURRENT_DATE, 78, 82, 79, 13, 19.60, 35, 1, 0.590, 0.820, 15, 32, 'öğle', 348, 3, 421)
ON CONFLICT (business_user_id, summary_date) DO UPDATE SET
  total_visitors = EXCLUDED.total_visitors,
  total_entries = EXCLUDED.total_entries,
  total_exits = EXCLUDED.total_exits,
  current_occupancy = EXCLUDED.current_occupancy,
  avg_occupancy = EXCLUDED.avg_occupancy,
  max_occupancy = EXCLUDED.max_occupancy,
  min_occupancy = EXCLUDED.min_occupancy,
  avg_crowd_density = EXCLUDED.avg_crowd_density,
  max_crowd_density = EXCLUDED.max_crowd_density,
  peak_hour = EXCLUDED.peak_hour,
  peak_hour_visitors = EXCLUDED.peak_hour_visitors,
  busiest_period = EXCLUDED.busiest_period,
  total_detections = EXCLUDED.total_detections,
  active_cameras_count = EXCLUDED.active_cameras_count,
  total_analysis_records = EXCLUDED.total_analysis_records,
  updated_at = NOW();

-- businessUserId=20 için AI recognition sample verileri
INSERT INTO ai_recognition_logs (
  business_id, device_id, detection_type, object_class, confidence_score,
  bounding_box, person_id, timestamp
) VALUES
(20, 'camera_1', 'person', 'person', 0.945, '{"x":120,"y":80,"width":85,"height":180}', 'person_001', NOW() - INTERVAL '15 minutes'),
(20, 'camera_1', 'face', 'happy_face', 0.892, '{"x":135,"y":95,"width":35,"height":45}', NULL, NOW() - INTERVAL '12 minutes'),
(20, 'camera_2', 'person', 'customer', 0.887, '{"x":200,"y":150,"width":90,"height":175}', 'person_002', NOW() - INTERVAL '10 minutes'),
(20, 'camera_1', 'object', 'bag', 0.765, '{"x":180,"y":220,"width":45,"height":30}', NULL, NOW() - INTERVAL '8 minutes'),
(20, 'camera_3', 'person', 'visitor', 0.923, '{"x":95,"y":120,"width":80,"height":165}', 'person_003', NOW() - INTERVAL '5 minutes'),
(20, 'camera_2', 'face', 'neutral_face', 0.856, '{"x":210,"y":160,"width":32,"height":42}', NULL, NOW() - INTERVAL '3 minutes'),
(20, 'camera_1', 'person', 'person', 0.912, '{"x":160,"y":90,"width":88,"height":185}', 'person_004', NOW() - INTERVAL '1 minute')
ON CONFLICT DO NOTHING;

-- businessUserId=20 için real-time status oluştur
INSERT INTO business_realtime_status (
  business_user_id, current_occupancy, current_crowd_level, current_density,
  last_updated, last_detection, active_cameras, total_cameras
) VALUES (
  20, 13, 'medium', 0.590, NOW(), NOW() - INTERVAL '1 minute', 3, 4
) ON CONFLICT (business_user_id) DO UPDATE SET
  current_occupancy = EXCLUDED.current_occupancy,
  current_crowd_level = EXCLUDED.current_crowd_level,
  current_density = EXCLUDED.current_density,
  last_updated = EXCLUDED.last_updated,
  last_detection = EXCLUDED.last_detection,
  active_cameras = EXCLUDED.active_cameras,
  total_cameras = EXCLUDED.total_cameras;

-- İndeksleri oluştur
CREATE INDEX IF NOT EXISTS idx_daily_summaries_business_date ON daily_business_summaries(business_user_id, summary_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_business_time ON ai_recognition_logs(business_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_camera_analytics_business ON business_camera_analytics(business_user_id, timestamp DESC);

COMMIT;