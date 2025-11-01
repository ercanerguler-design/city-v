-- Business Favorites Tracking Table
-- Kullanıcıların işletmeleri favorilere eklemesini takip eder

CREATE TABLE IF NOT EXISTS business_favorites (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  user_email VARCHAR(255), -- Anonim kullanıcılar için opsiyonel
  location_id VARCHAR(100) NOT NULL, -- Favori eklenen lokasyonun ID'si (ank-1, ank-2, vb.)
  location_name VARCHAR(255) NOT NULL, -- Lokasyon adı
  location_category VARCHAR(50), -- cafe, bank, restaurant vb.
  location_address TEXT, -- Adres bilgisi
  location_coordinates JSONB, -- [lat, lng] koordinatlar
  added_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT, -- Opsiyonel: Hangi cihazdan eklendi
  source VARCHAR(50) DEFAULT 'map', -- 'map', 'list', 'search'
  UNIQUE(business_id, location_id) -- Aynı lokasyon tekrar eklenemez
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_favorites_business_id ON business_favorites(business_id);
CREATE INDEX IF NOT EXISTS idx_business_favorites_location_id ON business_favorites(location_id);
CREATE INDEX IF NOT EXISTS idx_business_favorites_added_at ON business_favorites(added_at);

-- View for quick statistics
CREATE OR REPLACE VIEW business_favorites_stats AS
SELECT
  business_id,
  COUNT(*) as total_favorites,
  COUNT(CASE WHEN DATE(added_at) = CURRENT_DATE THEN 1 END) as today_favorites,
  COUNT(CASE WHEN added_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week_favorites,
  COUNT(CASE WHEN added_at >= NOW() - INTERVAL '30 days' THEN 1 END) as month_favorites,
  COUNT(CASE WHEN location_category = 'cafe' THEN 1 END) as cafe_favorites,
  COUNT(CASE WHEN location_category = 'restaurant' THEN 1 END) as restaurant_favorites,
  COUNT(CASE WHEN location_category = 'bank' THEN 1 END) as bank_favorites
FROM business_favorites
GROUP BY business_id;

COMMENT ON TABLE business_favorites IS 'Kullanıcıların işletmeleri favorilere eklemesi - harita, liste, arama';
COMMENT ON COLUMN business_favorites.source IS 'Favori eklenme kaynağı: map, list, search';
COMMENT ON COLUMN business_favorites.location_id IS 'CityV haritasındaki lokasyon ID (ank-1, ank-2, vb.)';
