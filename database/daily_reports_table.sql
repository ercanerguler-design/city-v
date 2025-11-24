-- ============================================
-- DAILY REPORTS SYSTEM
-- 24 saatlik verileri rapor olarak saklama
-- ============================================

CREATE TABLE IF NOT EXISTS business_daily_reports (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  
  -- Özet Metrikler
  total_visitors INTEGER DEFAULT 0,
  peak_hour INTEGER, -- En yoğun saat (0-23)
  peak_hour_count INTEGER DEFAULT 0,
  quietest_hour INTEGER, -- En boş saat (0-23)
  quietest_hour_count INTEGER DEFAULT 0,
  average_occupancy NUMERIC(5,2) DEFAULT 0, -- Ortalama yoğunluk yüzdesi
  
  -- Kamera Metrikleri
  active_cameras INTEGER DEFAULT 0,
  total_detections INTEGER DEFAULT 0,
  average_confidence NUMERIC(5,2) DEFAULT 0,
  
  -- Saatlik Dağılım (JSON)
  hourly_distribution JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"hour": 0, "visitors": 10, "density": "low"}, ...]
  
  -- Kamera Bazlı Dağılım (JSON)
  camera_breakdown JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"camera_id": 60, "camera_name": "Giriş", "visitors": 100}, ...]
  
  -- Yoğunluk Seviyeleri (JSON)
  crowd_levels JSONB DEFAULT '{}'::jsonb,
  -- Format: {"empty": 5, "low": 8, "medium": 7, "high": 3, "overcrowded": 1}
  
  -- Giriş-Çıkış Analizi
  total_entries INTEGER DEFAULT 0,
  total_exits INTEGER DEFAULT 0,
  net_occupancy INTEGER DEFAULT 0,
  
  -- AI Insights (JSON)
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"type": "optimization", "title": "...", "description": "..."}]
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  generated_at TIMESTAMP DEFAULT NOW(),
  report_version VARCHAR(10) DEFAULT '1.0'
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON business_daily_reports(business_user_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON business_daily_reports(report_date DESC);

-- Unique constraint - Her kullanıcı için günde bir rapor
CREATE UNIQUE INDEX IF NOT EXISTS unique_daily_report_per_user ON business_daily_reports(business_user_id, report_date);

COMMENT ON TABLE business_daily_reports IS '24 saatlik işletme raporları - veriler sıfırlanmaz, rapor olarak saklanır';
COMMENT ON COLUMN business_daily_reports.hourly_distribution IS 'Saatlik ziyaretçi dağılımı (JSON array)';
COMMENT ON COLUMN business_daily_reports.camera_breakdown IS 'Kamera bazlı analiz (JSON array)';
COMMENT ON COLUMN business_daily_reports.ai_recommendations IS 'AI önerileri ve insights (JSON array)';
