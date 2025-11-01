-- AI Analiz Sonuçları Tablosu
CREATE TABLE IF NOT EXISTS iot_ai_analysis (
  id SERIAL PRIMARY KEY,
  camera_id INTEGER NOT NULL,
  location_zone VARCHAR(100),
  person_count INTEGER DEFAULT 0,
  crowd_density FLOAT DEFAULT 0.0,
  detection_objects JSONB, -- YOLO detection sonuçları
  heatmap_url TEXT, -- Isı haritası URL'i
  image_size INTEGER, -- Orijinal görüntü boyutu
  processing_time_ms INTEGER, -- AI işlem süresi
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- İndeksler
  INDEX idx_camera_id (camera_id),
  INDEX idx_location_zone (location_zone),
  INDEX idx_created_at (created_at),
  INDEX idx_person_count (person_count)
);

-- Crowd alerts tablosu (Yoğunluk uyarıları)
CREATE TABLE IF NOT EXISTS iot_crowd_alerts (
  id SERIAL PRIMARY KEY,
  camera_id INTEGER NOT NULL,
  location_zone VARCHAR(100),
  alert_type VARCHAR(50), -- 'high_density', 'unusual_crowd', 'safety_threshold'
  person_count INTEGER,
  crowd_density FLOAT,
  alert_message TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_camera_alert (camera_id, created_at),
  INDEX idx_unresolved (is_resolved, created_at)
);

-- Görünümler (Analytics için)
CREATE OR REPLACE VIEW v_ai_hourly_stats AS
SELECT 
  camera_id,
  location_zone,
  DATE_TRUNC('hour', created_at) as hour,
  AVG(person_count)::INTEGER as avg_person_count,
  MAX(person_count) as max_person_count,
  AVG(crowd_density)::FLOAT as avg_crowd_density,
  MAX(crowd_density) as max_crowd_density,
  COUNT(*) as analysis_count
FROM iot_ai_analysis
GROUP BY camera_id, location_zone, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Real-time stats view (Son 5 dakika)
CREATE OR REPLACE VIEW v_ai_realtime_stats AS
SELECT 
  camera_id,
  location_zone,
  AVG(person_count)::INTEGER as current_person_count,
  AVG(crowd_density)::FLOAT as current_crowd_density,
  MAX(created_at) as last_update
FROM iot_ai_analysis
WHERE created_at > NOW() - INTERVAL '5 minutes'
GROUP BY camera_id, location_zone;

COMMENT ON TABLE iot_ai_analysis IS 'ESP32-CAM Python AI analiz sonuçları (YOLO person detection, crowd density, heat maps)';
COMMENT ON TABLE iot_crowd_alerts IS 'Otomatik yoğunluk uyarıları ve güvenlik eşik bildirimleri';
