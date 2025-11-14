-- Business Profiles ile City-V Anasayfa Entegrasyonu
-- İşletmeler otomatik olarak anasayfada görünecek

-- 1. Eksik alanları ekle
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS location_id VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other',
ADD COLUMN IF NOT EXISTS is_visible_on_map BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_sync_to_cityv BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS average_wait_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_crowd_level VARCHAR(20) DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- 2. Çalışma saatleri formatını güncelle (eğer NULL ise default değer)
UPDATE business_profiles 
SET working_hours = '{
  "monday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "tuesday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "wednesday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "thursday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "friday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "saturday": {"open": "10:00", "close": "16:00", "isOpen": true},
  "sunday": {"open": null, "close": null, "isOpen": false}
}'::jsonb
WHERE working_hours IS NULL OR working_hours = '{}'::jsonb;

-- 3. Location ID oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_location_id(business_name TEXT, city TEXT)
RETURNS VARCHAR AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Türkçe karakterleri düzelt ve slug oluştur
  base_slug := LOWER(business_name);
  base_slug := REPLACE(base_slug, 'ğ', 'g');
  base_slug := REPLACE(base_slug, 'ü', 'u');
  base_slug := REPLACE(base_slug, 'ş', 's');
  base_slug := REPLACE(base_slug, 'ı', 'i');
  base_slug := REPLACE(base_slug, 'ö', 'o');
  base_slug := REPLACE(base_slug, 'ç', 'c');
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Şehir ekle
  IF city IS NOT NULL THEN
    base_slug := base_slug || '-' || LOWER(city);
  END IF;
  
  final_slug := base_slug;
  
  -- Benzersiz yap
  WHILE EXISTS(SELECT 1 FROM business_profiles WHERE location_id = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger - Yeni business eklenince otomatik location_id oluştur
CREATE OR REPLACE FUNCTION auto_generate_location_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_id IS NULL OR NEW.location_id = '' THEN
    NEW.location_id := generate_location_id(NEW.business_name, NEW.city);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_location_id ON business_profiles;
CREATE TRIGGER trigger_auto_location_id
BEFORE INSERT OR UPDATE ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_location_id();

-- 5. Mevcut kayıtlar için location_id oluştur
UPDATE business_profiles 
SET location_id = generate_location_id(business_name, city)
WHERE location_id IS NULL OR location_id = '';

-- 6. İndeksler
CREATE INDEX IF NOT EXISTS idx_business_profiles_location_id ON business_profiles(location_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_visible ON business_profiles(is_visible_on_map) WHERE is_visible_on_map = true;
CREATE INDEX IF NOT EXISTS idx_business_profiles_category ON business_profiles(category);
CREATE INDEX IF NOT EXISTS idx_business_profiles_city ON business_profiles(city);

-- 7. View - City-V anasayfa için location formatında
CREATE OR REPLACE VIEW cityv_locations AS
SELECT 
  bp.location_id as id,
  bp.business_name as name,
  COALESCE(bp.category, 'other') as category,
  ARRAY[bp.latitude, bp.longitude] as coordinates,
  bp.address,
  COALESCE(bp.current_crowd_level, 'moderate') as "currentCrowdLevel",
  COALESCE(bp.average_wait_time, 0) as "averageWaitTime",
  NOW() as "lastUpdated",
  bp.description,
  bp.working_hours as "workingHours",
  bp.rating,
  bp.review_count as "reviewCount",
  bp.phone,
  bp.website,
  bp.photos,
  bp.verified,
  bp.business_type as "businessType",
  bp.user_id as "businessUserId"
FROM business_profiles bp
WHERE bp.is_visible_on_map = true
  AND bp.latitude IS NOT NULL
  AND bp.longitude IS NOT NULL
  AND bp.auto_sync_to_cityv = true;

SELECT '✅ Business-CityV entegrasyonu tamamlandı' as result;
SELECT '📍 location_id trigger aktif' as info;
SELECT '🗺️ cityv_locations view oluşturuldu' as info;
