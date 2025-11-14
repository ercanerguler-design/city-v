-- Admin tarafından business üye eklemek için tablo güncellemeleri

-- business_users tablosuna şirket bilgileri ekle
ALTER TABLE business_users 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_type VARCHAR(100), -- 'restaurant', 'retail', 'cafe', 'hotel', etc.
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS company_district VARCHAR(100),
ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS tax_office VARCHAR(100),
ADD COLUMN IF NOT EXISTS authorized_person VARCHAR(255), -- Yetkili kişi
ADD COLUMN IF NOT EXISTS added_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- business_subscriptions tablosuna ek bilgiler
ALTER TABLE business_subscriptions
ADD COLUMN IF NOT EXISTS added_by_admin_id INTEGER, -- Hangi admin ekledi
ADD COLUMN IF NOT EXISTS license_key VARCHAR(255) UNIQUE, -- Benzersiz lisans anahtarı
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 1, -- Kaç kullanıcı kullanabilir
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;

-- Index'ler ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_user_id ON business_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_dates ON business_subscriptions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_active ON business_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_business_users_company ON business_users(company_name);

COMMENT ON COLUMN business_users.added_by_admin IS 'Admin tarafından eklenen üye mi?';
COMMENT ON COLUMN business_subscriptions.license_key IS 'Benzersiz lisans anahtarı - kullanıcı girişinde kontrol edilecek';
