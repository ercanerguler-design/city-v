-- ============================================
-- BUSINESS CAMERA MANAGEMENT SYSTEM
-- Premium: 10 kamera, Enterprise: 50 kamera
-- ============================================

CREATE TABLE IF NOT EXISTS business_cameras (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
  camera_name VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  port INTEGER DEFAULT 80,
  username VARCHAR(100),
  password VARCHAR(255),
  location_description TEXT,
  camera_type VARCHAR(50) DEFAULT 'ESP32-CAM',
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, offline, error
  stream_url TEXT,
  snapshot_url TEXT,
  is_public BOOLEAN DEFAULT false,
  last_online TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Analytics
  total_detections INTEGER DEFAULT 0,
  last_detection_time TIMESTAMP,
  average_crowd_level INTEGER DEFAULT 0,
  
  -- Camera settings
  resolution VARCHAR(20) DEFAULT '1600x1200',
  fps INTEGER DEFAULT 10,
  detection_enabled BOOLEAN DEFAULT true,
  recording_enabled BOOLEAN DEFAULT false,
  
  -- Metadata
  notes TEXT,
  tags TEXT[]
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_business_cameras_user ON business_cameras(business_user_id);
CREATE INDEX IF NOT EXISTS idx_business_cameras_status ON business_cameras(status);

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_business_camera_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_camera_timestamp
BEFORE UPDATE ON business_cameras
FOR EACH ROW
EXECUTE FUNCTION update_business_camera_timestamp();

-- Demo data for testing
INSERT INTO business_cameras (
  business_user_id,
  camera_name,
  ip_address,
  port,
  location_description,
  camera_type,
  status,
  stream_url
) VALUES 
  (1, 'Ana Giriş Kamerası', '192.168.1.100', 80, 'Mağaza ana giriş kapısı', 'ESP32-CAM', 'active', 'http://192.168.1.100/stream'),
  (1, 'Kasa Alanı', '192.168.1.101', 80, 'Kasa ve ödeme noktası', 'ESP32-CAM', 'active', 'http://192.168.1.101/stream'),
  (1, 'Ürün Reyonları', '192.168.1.102', 80, 'Ürün reyonları bölgesi', 'ESP32-CAM', 'active', 'http://192.168.1.102/stream')
ON CONFLICT DO NOTHING;
