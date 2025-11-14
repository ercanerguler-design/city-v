-- Daily Business Summaries Table
-- Bu tablo her gün sonunda işletmelerin günlük verilerini saklar
-- Rapor çekerken hızlı erişim sağlar

CREATE TABLE IF NOT EXISTS daily_business_summaries (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  
  -- Temel Metriklerde
  total_visitors INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  total_exits INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  
  -- Ortalama ve Maksimum Değerler
  avg_occupancy DECIMAL(5,2) DEFAULT 0,
  max_occupancy INTEGER DEFAULT 0,
  min_occupancy INTEGER DEFAULT 0,
  
  -- Yoğunluk Verileri
  avg_crowd_density DECIMAL(5,2) DEFAULT 0,
  max_crowd_density DECIMAL(5,2) DEFAULT 0,
  
  -- Zaman Bazlı Veriler
  peak_hour INTEGER, -- En yoğun saat (0-23)
  peak_hour_visitors INTEGER DEFAULT 0,
  busiest_period VARCHAR(20), -- 'morning', 'afternoon', 'evening', 'night'
  
  -- Kamera Verileri
  total_detections INTEGER DEFAULT 0,
  active_cameras_count INTEGER DEFAULT 0,
  total_analysis_records INTEGER DEFAULT 0,
  
  -- İstatistiksel Veriler
  unique_detection_sessions INTEGER DEFAULT 0,
  avg_stay_duration_minutes DECIMAL(10,2),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint - Her işletme için günde bir kayıt
  UNIQUE(business_user_id, summary_date)
);

-- Index'ler - Hızlı sorgu için
CREATE INDEX IF NOT EXISTS idx_daily_summaries_business_user 
  ON daily_business_summaries(business_user_id);

CREATE INDEX IF NOT EXISTS idx_daily_summaries_date 
  ON daily_business_summaries(summary_date);

CREATE INDEX IF NOT EXISTS idx_daily_summaries_business_date 
  ON daily_business_summaries(business_user_id, summary_date);

-- Güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_daily_summary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_daily_summary_timestamp ON daily_business_summaries;

CREATE TRIGGER trigger_update_daily_summary_timestamp
  BEFORE UPDATE ON daily_business_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary_timestamp();

-- Örnek veri (son 7 gün için)
DO $$
DECLARE
  business_id INTEGER;
  current_date DATE;
  i INTEGER;
BEGIN
  -- İlk business user'ı bul
  SELECT id INTO business_id FROM business_users LIMIT 1;
  
  IF business_id IS NOT NULL THEN
    -- Son 7 gün için örnek data
    FOR i IN 0..6 LOOP
      current_date := CURRENT_DATE - i;
      
      INSERT INTO daily_business_summaries (
        business_user_id,
        summary_date,
        total_visitors,
        total_entries,
        total_exits,
        current_occupancy,
        avg_occupancy,
        max_occupancy,
        min_occupancy,
        avg_crowd_density,
        max_crowd_density,
        peak_hour,
        peak_hour_visitors,
        busiest_period,
        total_detections,
        active_cameras_count,
        total_analysis_records
      ) VALUES (
        business_id,
        current_date,
        100 + (i * 15) + FLOOR(RANDOM() * 50),  -- total_visitors
        50 + (i * 8) + FLOOR(RANDOM() * 20),     -- total_entries
        45 + (i * 7) + FLOOR(RANDOM() * 20),     -- total_exits
        5 + FLOOR(RANDOM() * 10),                -- current_occupancy
        15.5 + (i * 2.3),                        -- avg_occupancy
        35 + (i * 3),                            -- max_occupancy
        3 + i,                                   -- min_occupancy
        42.5 + (i * 3.2),                        -- avg_crowd_density
        78.5 + (i * 4.1),                        -- max_crowd_density
        14 + FLOOR(RANDOM() * 4),                -- peak_hour (14-18)
        25 + FLOOR(RANDOM() * 15),               -- peak_hour_visitors
        CASE 
          WHEN i % 3 = 0 THEN 'afternoon'
          WHEN i % 3 = 1 THEN 'evening'
          ELSE 'morning'
        END,                                     -- busiest_period
        150 + (i * 20) + FLOOR(RANDOM() * 30),   -- total_detections
        2 + (i % 3),                             -- active_cameras_count
        180 + (i * 25) + FLOOR(RANDOM() * 40)    -- total_analysis_records
      )
      ON CONFLICT (business_user_id, summary_date) 
      DO NOTHING;
    END LOOP;
    
    RAISE NOTICE '✅ Örnek günlük özet verileri oluşturuldu (son 7 gün)';
  ELSE
    RAISE NOTICE '⚠️ Business user bulunamadı, örnek veri oluşturulamadı';
  END IF;
END $$;

COMMENT ON TABLE daily_business_summaries IS 'Günlük işletme özet verileri - Her gün sonu agregasyonu';
COMMENT ON COLUMN daily_business_summaries.summary_date IS 'Özet verinin ait olduğu tarih';
COMMENT ON COLUMN daily_business_summaries.peak_hour IS 'En yoğun saat (0-23 arası)';
COMMENT ON COLUMN daily_business_summaries.busiest_period IS 'En yoğun dönem: morning, afternoon, evening, night';
