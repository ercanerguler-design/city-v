-- Giriş-Çıkış Takip Tablosu
CREATE TABLE IF NOT EXISTS iot_entry_exit_logs (
  id SERIAL PRIMARY KEY,
  camera_id INTEGER NOT NULL,
  business_id INTEGER,
  location_zone VARCHAR(100),
  entry_count INTEGER DEFAULT 0,
  exit_count INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0, -- İçeride kaç kişi var
  analysis_id INTEGER REFERENCES iot_ai_analysis(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_entry_camera (camera_id, timestamp),
  INDEX idx_entry_business (business_id, timestamp),
  INDEX idx_entry_zone (location_zone, timestamp)
);

-- Bölgesel Yoğunluk Tablosu
CREATE TABLE IF NOT EXISTS iot_zone_occupancy (
  id SERIAL PRIMARY KEY,
  camera_id INTEGER NOT NULL,
  business_id INTEGER,
  zone_name VARCHAR(100), -- Giriş, Salon, Mutfak, WC vs.
  person_count INTEGER DEFAULT 0,
  crowd_density FLOAT DEFAULT 0.0,
  density_level VARCHAR(20), -- low, medium, high, critical
  heatmap_url TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_zone_camera (camera_id, zone_name, timestamp),
  INDEX idx_zone_business (business_id, timestamp)
);

-- Gerçek Zamanlı Mevcut Durum View
CREATE OR REPLACE VIEW v_current_occupancy AS
SELECT 
  eel.camera_id,
  eel.business_id,
  eel.location_zone,
  eel.current_occupancy,
  eel.entry_count as total_entries_today,
  eel.exit_count as total_exits_today,
  eel.timestamp as last_update
FROM iot_entry_exit_logs eel
WHERE eel.id IN (
  SELECT MAX(id) 
  FROM iot_entry_exit_logs 
  GROUP BY camera_id, location_zone
);

-- Saatlik Entry/Exit İstatistikleri
CREATE OR REPLACE VIEW v_hourly_traffic AS
SELECT 
  business_id,
  location_zone,
  DATE_TRUNC('hour', timestamp) as hour,
  SUM(entry_count) as total_entries,
  SUM(exit_count) as total_exits,
  AVG(current_occupancy)::INTEGER as avg_occupancy,
  MAX(current_occupancy) as peak_occupancy
FROM iot_entry_exit_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY business_id, location_zone, DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- Bölgesel Yoğunluk Analizi View
CREATE OR REPLACE VIEW v_zone_density_realtime AS
SELECT 
  zo.business_id,
  zo.zone_name,
  zo.person_count,
  zo.crowd_density,
  zo.density_level,
  zo.heatmap_url,
  zo.timestamp as last_update
FROM iot_zone_occupancy zo
WHERE zo.id IN (
  SELECT MAX(id) 
  FROM iot_zone_occupancy 
  WHERE timestamp > NOW() - INTERVAL '5 minutes'
  GROUP BY camera_id, zone_name
);

COMMENT ON TABLE iot_entry_exit_logs IS 'Giriş-çıkış sayımları ve anlık doluluk takibi';
COMMENT ON TABLE iot_zone_occupancy IS 'Bölge bazlı yoğunluk analizi (işletme içi harita)';
