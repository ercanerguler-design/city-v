-- Kamera AI özellikleri için eksik kolonları ekle

-- Kalibrasyon çizgisi ve yönü
ALTER TABLE business_cameras 
ADD COLUMN IF NOT EXISTS calibration_line JSONB DEFAULT NULL;

ALTER TABLE business_cameras 
ADD COLUMN IF NOT EXISTS entry_direction VARCHAR(50) DEFAULT 'up_to_down';

-- Bölge çizim verileri (polygon noktaları)
ALTER TABLE business_cameras 
ADD COLUMN IF NOT EXISTS zones JSONB DEFAULT '[]'::jsonb;

-- Ek kalibrasyon verileri
ALTER TABLE business_cameras 
ADD COLUMN IF NOT EXISTS calibration_data JSONB DEFAULT '{}'::jsonb;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_business_cameras_calibration ON business_cameras(calibration_line) WHERE calibration_line IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_business_cameras_zones ON business_cameras USING GIN (zones) WHERE zones != '[]'::jsonb;

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ business_cameras tablosu AI özellikleri ile güncellendi';
  RAISE NOTICE '   - calibration_line: Giriş/çıkış çizgisi';
  RAISE NOTICE '   - entry_direction: Yön (up_to_down, down_to_up, vb.)';
  RAISE NOTICE '   - zones: Bölge poligonları (masa, raf, vb.)';
  RAISE NOTICE '   - calibration_data: Ek kalibrasyon verileri';
END $$;
