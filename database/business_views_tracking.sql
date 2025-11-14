-- Business Views Tracking Table
-- Harita, liste ve arama üzerinden işletme görüntülenmelerini takip eder

CREATE TABLE IF NOT EXISTS business_views (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  location_id VARCHAR(100), -- Görüntülenen lokasyonun ID'si (ank-1, ank-2, vb.)
  location_name VARCHAR(255), -- Lokasyon adı
  location_category VARCHAR(50), -- cafe, bank, restaurant vb.
  source VARCHAR(50) DEFAULT 'map', -- 'map', 'list', 'search', 'direct'
  viewed_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT, -- Opsiyonel: Hangi cihazdan görüntülendi
  ip_address VARCHAR(50) -- Opsiyonel: IP adresi
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_views_business_id ON business_views(business_id);
CREATE INDEX IF NOT EXISTS idx_business_views_viewed_at ON business_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_business_views_source ON business_views(source);
CREATE INDEX IF NOT EXISTS idx_business_views_location_id ON business_views(location_id);

-- View for quick statistics
CREATE OR REPLACE VIEW business_view_stats AS
SELECT
  business_id,
  COUNT(*) as total_views,
  COUNT(CASE WHEN DATE(viewed_at) = CURRENT_DATE THEN 1 END) as today_views,
  COUNT(CASE WHEN viewed_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week_views,
  COUNT(CASE WHEN viewed_at >= NOW() - INTERVAL '30 days' THEN 1 END) as month_views,
  COUNT(CASE WHEN source = 'map' THEN 1 END) as map_views,
  COUNT(CASE WHEN source = 'list' THEN 1 END) as list_views,
  COUNT(CASE WHEN source = 'search' THEN 1 END) as search_views
FROM business_views
GROUP BY business_id;

-- Cleanup old views (optional - keeps last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_business_views()
RETURNS void AS $$
BEGIN
  DELETE FROM business_views
  WHERE viewed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE business_views IS 'İşletme görüntülenme takibi - harita, liste, arama';
COMMENT ON COLUMN business_views.source IS 'Görüntülenme kaynağı: map, list, search, direct';
COMMENT ON COLUMN business_views.location_id IS 'Görüntülenen lokasyonun CityV ID''si';