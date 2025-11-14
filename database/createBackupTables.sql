-- Business verileri için backup/restore sistemi
-- Silinen business'lar yeniden eklendiğinde eski verileri geri yükleyebilmek için

-- Backup tablosu: Silinen business profilleri
CREATE TABLE IF NOT EXISTS business_profiles_backup (
  id SERIAL PRIMARY KEY,
  original_profile_id INTEGER NOT NULL, -- Orijinal business_profiles id'si
  user_email VARCHAR(255) NOT NULL, -- Business user email (restore için)
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  logo_url TEXT,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  working_hours JSONB,
  social_media JSONB,
  photos TEXT[],
  deleted_at TIMESTAMP DEFAULT NOW(),
  deleted_by VARCHAR(255), -- Admin email
  restore_count INTEGER DEFAULT 0, -- Kaç kez restore edildi
  last_restored_at TIMESTAMP
);

-- Backup tablosu: Silinen business cameras
CREATE TABLE IF NOT EXISTS business_cameras_backup (
  id SERIAL PRIMARY KEY,
  original_camera_id INTEGER NOT NULL,
  original_business_profile_id INTEGER NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  camera_name VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  port INTEGER DEFAULT 80,
  location_description VARCHAR(255),
  stream_url TEXT,
  resolution VARCHAR(20) DEFAULT '640x480',
  ai_enabled BOOLEAN DEFAULT true,
  zones JSONB,
  calibration_line JSONB,
  deleted_at TIMESTAMP DEFAULT NOW()
);

-- Backup tablosu: Silinen business campaigns
CREATE TABLE IF NOT EXISTS business_campaigns_backup (
  id SERIAL PRIMARY KEY,
  original_campaign_id INTEGER NOT NULL,
  original_business_profile_id INTEGER NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percent INTEGER,
  discount_amount DECIMAL(10, 2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  target_audience VARCHAR(50),
  reach_count INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  deleted_at TIMESTAMP DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_profiles_backup_email ON business_profiles_backup(user_email);
CREATE INDEX IF NOT EXISTS idx_cameras_backup_email ON business_cameras_backup(user_email);
CREATE INDEX IF NOT EXISTS idx_campaigns_backup_email ON business_campaigns_backup(user_email);

-- Temizlik fonksiyonu: 90 günden eski backupları sil
CREATE OR REPLACE FUNCTION cleanup_old_backups() RETURNS void AS $$
BEGIN
  DELETE FROM business_profiles_backup WHERE deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM business_cameras_backup WHERE deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM business_campaigns_backup WHERE deleted_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Demo veri temizliği (isteğe bağlı)
-- SELECT cleanup_old_backups();
