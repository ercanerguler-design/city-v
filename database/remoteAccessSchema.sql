-- CityV Remote Access Database Schema
-- Bu script remote access özelliği için gerekli tabloları oluşturur

-- 1. Remote access sessions tracking
CREATE TABLE IF NOT EXISTS business_remote_sessions (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  device_info JSONB DEFAULT '{}',
  location VARCHAR(255) DEFAULT 'Unknown',
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_duration INTEGER DEFAULT 0, -- in seconds
  session_type VARCHAR(20) DEFAULT 'remote' CHECK (session_type IN ('local', 'remote')),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  ended_at TIMESTAMP
);

-- 2. Trusted devices for each business user
CREATE TABLE IF NOT EXISTS business_trusted_devices (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  device_fingerprint VARCHAR(255) NOT NULL,
  device_name VARCHAR(100) NOT NULL,
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100)
);

-- 3. Camera access logs for security tracking
CREATE TABLE IF NOT EXISTS camera_access_logs (
  id SERIAL PRIMARY KEY,
  camera_id INTEGER REFERENCES business_cameras(id) ON DELETE SET NULL,
  accessed_by INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('local', 'remote')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_duration INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- 4. Business cameras table enhancement (add fields if not exist)
DO $$ 
BEGIN
  -- Add stream_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_cameras' AND column_name = 'stream_url') THEN
    ALTER TABLE business_cameras ADD COLUMN stream_url VARCHAR(255);
  END IF;
  
  -- Add port column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_cameras' AND column_name = 'port') THEN
    ALTER TABLE business_cameras ADD COLUMN port INTEGER DEFAULT 80;
  END IF;
  
  -- Add is_remote_enabled column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_cameras' AND column_name = 'is_remote_enabled') THEN
    ALTER TABLE business_cameras ADD COLUMN is_remote_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_remote_sessions_user_id ON business_remote_sessions(business_user_id);
CREATE INDEX IF NOT EXISTS idx_remote_sessions_date ON business_remote_sessions(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_remote_sessions_active ON business_remote_sessions(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON business_trusted_devices(business_user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON business_trusted_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_active ON business_trusted_devices(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_camera_access_logs_camera_id ON camera_access_logs(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_access_logs_user_id ON camera_access_logs(accessed_by);
CREATE INDEX IF NOT EXISTS idx_camera_access_logs_date ON camera_access_logs(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_camera_access_logs_type ON camera_access_logs(access_type);

-- Views for analytics
CREATE OR REPLACE VIEW remote_access_stats AS
SELECT 
  bu.id as business_user_id,
  bu.fullName as business_name,
  COUNT(DISTINCT brs.id) as total_remote_sessions,
  COUNT(DISTINCT brs.ip_address) as unique_locations,
  COUNT(DISTINCT btd.id) as trusted_devices_count,
  MAX(brs.accessed_at) as last_remote_access,
  AVG(brs.session_duration) as avg_session_duration
FROM business_users bu
LEFT JOIN business_remote_sessions brs ON bu.id = brs.business_user_id
LEFT JOIN business_trusted_devices btd ON bu.id = btd.business_user_id AND btd.is_active = true
GROUP BY bu.id, bu.fullName;

-- Function to clean old sessions (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_remote_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM business_remote_sessions 
  WHERE accessed_at < (CURRENT_TIMESTAMP - INTERVAL '30 days')
    AND is_active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update device last_seen
CREATE OR REPLACE FUNCTION update_device_last_seen(
  p_user_id INTEGER,
  p_fingerprint VARCHAR(255)
)
RETURNS VOID AS $$
BEGIN
  UPDATE business_trusted_devices 
  SET last_seen = CURRENT_TIMESTAMP
  WHERE business_user_id = p_user_id 
    AND device_fingerprint = p_fingerprint;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically end sessions older than 24 hours
CREATE OR REPLACE FUNCTION auto_end_old_sessions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE business_remote_sessions 
  SET is_active = false, ended_at = CURRENT_TIMESTAMP
  WHERE is_active = true 
    AND accessed_at < (CURRENT_TIMESTAMP - INTERVAL '24 hours');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_end_sessions') THEN
    CREATE TRIGGER trigger_auto_end_sessions
      AFTER INSERT ON business_remote_sessions
      FOR EACH ROW
      EXECUTE FUNCTION auto_end_old_sessions();
  END IF;
END $$;

-- Insert sample data for testing (only if tables are empty)
DO $$
BEGIN
  -- Check if we need sample data
  IF NOT EXISTS (SELECT 1 FROM business_trusted_devices LIMIT 1) THEN
    
    -- Add sample trusted devices for existing business users
    INSERT INTO business_trusted_devices (business_user_id, device_fingerprint, device_name, device_info)
    SELECT 
      bu.id,
      'sample_device_' || bu.id || '_' || random()::text,
      'Chrome Browser',
      '{"userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "platform": "Win32"}'::jsonb
    FROM business_users bu
    WHERE bu.id IN (1, 2, 3, 6) -- Sample user IDs
    ON CONFLICT DO NOTHING;
    
    -- Add sample remote sessions
    INSERT INTO business_remote_sessions (business_user_id, ip_address, location, device_info, session_type)
    SELECT 
      bu.id,
      '192.168.1.' || (bu.id * 10)::text,
      'Istanbul, Turkey',
      '{"fingerprint": "sample_device_' || bu.id || '", "name": "Chrome Browser"}'::jsonb,
      'remote'
    FROM business_users bu
    WHERE bu.id IN (1, 2, 3, 6)
    ON CONFLICT DO NOTHING;
    
  END IF;
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON business_remote_sessions TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON business_trusted_devices TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON camera_access_logs TO PUBLIC;
GRANT SELECT ON remote_access_stats TO PUBLIC;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ CityV Remote Access Database Schema created successfully!';
  RAISE NOTICE '📊 Tables created: business_remote_sessions, business_trusted_devices, camera_access_logs';
  RAISE NOTICE '🔍 Indexes and views created for optimal performance';
  RAISE NOTICE '⚡ Functions and triggers set up for automatic maintenance';
END $$;