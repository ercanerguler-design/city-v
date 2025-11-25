-- Kamera Soft Delete Migration
-- Kamera silindiğinde veritabanında tut, sadece deleted_at işaretle
-- Raporlarda tarihsel veriler görünsün

-- 1. business_cameras tablosuna deleted_at column ekle
ALTER TABLE business_cameras 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 2. Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_business_cameras_deleted_at 
ON business_cameras(deleted_at) 
WHERE deleted_at IS NULL;

-- 3. Aktif kameraları hızlı bulmak için composite index
CREATE INDEX IF NOT EXISTS idx_business_cameras_active 
ON business_cameras(business_user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- 4. Yorum ekle
COMMENT ON COLUMN business_cameras.deleted_at IS 
'Soft delete için. NULL = aktif, timestamp = silinmiş ama tarihsel veriler korunuyor';

-- ✅ Kullanım:
-- Dashboard: WHERE deleted_at IS NULL (sadece aktif kameralar)
-- Raporlar: deleted_at'e bakmadan tüm veriler
-- Silme: UPDATE business_cameras SET deleted_at = NOW() WHERE id = X
