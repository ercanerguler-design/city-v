-- Business Kamera Yönetim Sistemi
-- Premium: max 10 kamera
-- Enterprise: max 50 kamera

DROP TABLE IF EXISTS business_cameras CASCADE;

CREATE TABLE business_cameras (
    id SERIAL PRIMARY KEY,
    business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
    camera_name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL, -- IPv4 or IPv6
    port INTEGER DEFAULT 80,
    username VARCHAR(255),
    password VARCHAR(255),
    stream_url TEXT, -- rtsp://username:password@ip:port/stream
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, error
    location_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_checked TIMESTAMP
    -- UNIQUE constraint kaldırıldı - silinen kameralar tekrar eklenebilsin
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_business_cameras_user ON business_cameras(business_user_id);
CREATE INDEX IF NOT EXISTS idx_business_cameras_status ON business_cameras(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_business_cameras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_cameras_updated_at
    BEFORE UPDATE ON business_cameras
    FOR EACH ROW
    EXECUTE FUNCTION update_business_cameras_updated_at();

-- Demo data (örnek kameralar)
INSERT INTO business_cameras (business_user_id, camera_name, ip_address, port, location_description, status)
VALUES 
    (1, 'Giriş Kapısı', '192.168.1.100', 554, 'Ana giriş - müşteri sayımı', 'active'),
    (1, 'Kasa Alanı', '192.168.1.101', 554, 'Kasa önü - kuyruk analizi', 'active'),
    (1, 'Ürün Rafları', '192.168.1.102', 554, 'Raf alanı - müşteri ilgisi', 'active')
ON CONFLICT (business_user_id, ip_address, port) DO NOTHING;

COMMENT ON TABLE business_cameras IS 'Business kullanıcılarının ESP32-CAM ve IP kamera bağlantıları';
COMMENT ON COLUMN business_cameras.stream_url IS 'RTSP veya HTTP stream URL - otomatik oluşturulur';
COMMENT ON COLUMN business_cameras.status IS 'active: çalışıyor, inactive: pasif, error: bağlantı hatası';
