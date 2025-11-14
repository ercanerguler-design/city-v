-- Business users tablosuna lisans ve bitiş tarihi ekle

-- Membership type ve expiry date kolonları
ALTER TABLE business_users 
ADD COLUMN IF NOT EXISTS membership_type VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS membership_expiry_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS max_cameras INTEGER DEFAULT 1;

-- Membership type için check constraint
ALTER TABLE business_users 
ADD CONSTRAINT check_membership_type 
CHECK (membership_type IN ('free', 'premium', 'enterprise'));

-- Membership type'a göre default camera limitleri ayarla
UPDATE business_users 
SET max_cameras = CASE 
  WHEN membership_type = 'premium' THEN 10
  WHEN membership_type = 'enterprise' THEN 50
  ELSE 1
END
WHERE max_cameras IS NULL OR max_cameras = 0;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_business_users_membership ON business_users(membership_type);
CREATE INDEX IF NOT EXISTS idx_business_users_expiry ON business_users(membership_expiry_date);

-- Comment ekle
COMMENT ON COLUMN business_users.membership_type IS 'Üyelik tipi: free (1 kamera), premium (10 kamera), enterprise (50 kamera)';
COMMENT ON COLUMN business_users.membership_expiry_date IS 'Üyelik bitiş tarihi. NULL ise süresiz';
COMMENT ON COLUMN business_users.max_cameras IS 'Maximum ekleyebileceği kamera sayısı';

-- Test için örnek veri güncelleme (opsiyonel)
-- UPDATE business_users SET membership_type = 'premium', membership_expiry_date = NOW() + INTERVAL '1 year', max_cameras = 10 WHERE id = 1;
-- UPDATE business_users SET membership_type = 'enterprise', membership_expiry_date = NOW() + INTERVAL '2 years', max_cameras = 50 WHERE id = 2;
