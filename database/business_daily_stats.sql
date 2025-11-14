-- Business Dashboard Günlük İstatistikler Tablosu
-- Her gün 23:59'da mevcut günün verileri bu tabloya kaydedilir
-- Yeni gün (00:00) başladığında dashboard temiz başlar

CREATE TABLE IF NOT EXISTS business_daily_stats (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Günlük Metrikler
  total_visitors INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  total_exits INTEGER DEFAULT 0,
  peak_occupancy INTEGER DEFAULT 0,
  avg_occupancy DECIMAL(5,2) DEFAULT 0,
  total_cameras_active INTEGER DEFAULT 0,
  
  -- Yoğunluk Dağılımı (dakika cinsinden)
  minutes_empty INTEGER DEFAULT 0,
  minutes_low INTEGER DEFAULT 0,
  minutes_medium INTEGER DEFAULT 0,
  minutes_high INTEGER DEFAULT 0,
  minutes_overcrowded INTEGER DEFAULT 0,
  
  -- Zaman Dilimleri (en yoğun saatler)
  busiest_hour INTEGER, -- 0-23
  busiest_hour_count INTEGER DEFAULT 0,
  
  -- Ortalama Kalış Süresi
  avg_stay_minutes INTEGER DEFAULT 0,
  
  -- Favoriler
  favorites_added INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP, -- 23:59'da arşivlenme zamanı
  
  -- Her business için her gün bir kayıt
  UNIQUE(business_user_id, stat_date)
);

-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_business_daily_stats_user_date 
  ON business_daily_stats(business_user_id, stat_date DESC);

CREATE INDEX IF NOT EXISTS idx_business_daily_stats_date 
  ON business_daily_stats(stat_date DESC);

-- Geçmiş verileri sorgulamak için view
CREATE OR REPLACE VIEW business_stats_history AS
SELECT 
  bds.*,
  bu.email,
  bp.business_name,
  bp.business_type,
  bp.city
FROM business_daily_stats bds
JOIN business_users bu ON bds.business_user_id = bu.id
LEFT JOIN business_profiles bp ON bp.user_id = bu.id
ORDER BY bds.stat_date DESC, bds.business_user_id;

-- Günlük özet fonksiyonu (bugünkü verileri hesapla)
CREATE OR REPLACE FUNCTION calculate_today_stats(p_business_user_id INTEGER)
RETURNS TABLE (
  total_visitors BIGINT,
  total_entries BIGINT,
  total_exits BIGINT,
  peak_occupancy INTEGER,
  avg_occupancy NUMERIC,
  active_cameras BIGINT,
  busiest_hour INTEGER,
  busiest_hour_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(ia.person_count), 0)::BIGINT as total_visitors,
    COALESCE(SUM((ia.detection_objects->>'people_in')::INTEGER), 0)::BIGINT as total_entries,
    COALESCE(SUM((ia.detection_objects->>'people_out')::INTEGER), 0)::BIGINT as total_exits,
    COALESCE(MAX(ia.person_count), 0)::INTEGER as peak_occupancy,
    COALESCE(AVG(ia.person_count), 0)::NUMERIC as avg_occupancy,
    COUNT(DISTINCT bc.id)::BIGINT as active_cameras,
    EXTRACT(HOUR FROM ia.created_at)::INTEGER as busiest_hour,
    COUNT(*)::BIGINT as busiest_hour_count
  FROM iot_ai_analysis ia
  JOIN business_cameras bc ON ia.camera_id = bc.id
  WHERE bc.business_user_id = p_business_user_id
    AND DATE(ia.created_at) = CURRENT_DATE
  GROUP BY EXTRACT(HOUR FROM ia.created_at)
  ORDER BY COUNT(*) DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE business_daily_stats IS 'Günlük iş istatistikleri - her gün 23:59''da arşivlenir, 00:00''da yeni gün başlar';
COMMENT ON FUNCTION calculate_today_stats IS 'Bugünkü istatistikleri hesaplar - arşivlemeden önce çağrılır';
