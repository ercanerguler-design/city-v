-- Favoriler ve Görüntüleme Tablolarını Kontrol Et ve Oluştur

-- 1. business_views tablosu kontrolü ve oluşturma
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'business_views') THEN
        CREATE TABLE business_views (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
          location_id VARCHAR(100),
          location_name VARCHAR(255),
          location_category VARCHAR(50),
          source VARCHAR(50) DEFAULT 'map',
          viewed_at TIMESTAMP DEFAULT NOW(),
          user_agent TEXT,
          ip_address VARCHAR(50)
        );
        
        CREATE INDEX idx_business_views_business_id ON business_views(business_id);
        CREATE INDEX idx_business_views_viewed_at ON business_views(viewed_at);
        CREATE INDEX idx_business_views_source ON business_views(source);
        CREATE INDEX idx_business_views_location_id ON business_views(location_id);
        
        RAISE NOTICE '✅ business_views tablosu oluşturuldu';
    ELSE
        RAISE NOTICE '✓ business_views tablosu zaten var';
    END IF;
END $$;

-- 2. business_favorites tablosu kontrolü ve oluşturma
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'business_favorites') THEN
        CREATE TABLE business_favorites (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
          user_email VARCHAR(255),
          location_id VARCHAR(100) NOT NULL,
          location_name VARCHAR(255) NOT NULL,
          location_category VARCHAR(50),
          location_address TEXT,
          location_coordinates JSONB,
          added_at TIMESTAMP DEFAULT NOW(),
          user_agent TEXT,
          source VARCHAR(50) DEFAULT 'map',
          UNIQUE(business_id, location_id)
        );
        
        CREATE INDEX idx_business_favorites_business_id ON business_favorites(business_id);
        CREATE INDEX idx_business_favorites_location_id ON business_favorites(location_id);
        CREATE INDEX idx_business_favorites_added_at ON business_favorites(added_at);
        
        RAISE NOTICE '✅ business_favorites tablosu oluşturuldu';
    ELSE
        RAISE NOTICE '✓ business_favorites tablosu zaten var';
    END IF;
END $$;

-- 3. View'ları oluştur (varsa DROP et)
DROP VIEW IF EXISTS business_view_stats;
CREATE VIEW business_view_stats AS
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

DROP VIEW IF EXISTS business_favorites_stats;
CREATE VIEW business_favorites_stats AS
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

-- 4. Mevcut verileri kontrol et
SELECT 
    'business_views' as tablo,
    COUNT(*) as kayit_sayisi,
    COUNT(DISTINCT business_id) as business_sayisi
FROM business_views
UNION ALL
SELECT 
    'business_favorites' as tablo,
    COUNT(*) as kayit_sayisi,
    COUNT(DISTINCT business_id) as business_sayisi
FROM business_favorites;

-- 5. Son eklenen favoriler
SELECT 
    bf.business_id,
    bp.business_name,
    bf.location_name,
    bf.location_category,
    bf.added_at,
    bf.source
FROM business_favorites bf
LEFT JOIN business_profiles bp ON bf.business_id = bp.id
ORDER BY bf.added_at DESC
LIMIT 10;
