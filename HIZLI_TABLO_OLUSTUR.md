# 🚨 ACIL: Business Tabloları Oluştur

## ❌ Hata
```
relation "business_users" does not exist
```

## ✅ Çözüm: Vercel Postgres Dashboard'dan SQL Çalıştır

### Adım 1: Vercel Postgres'e Git
1. Tarayıcıda aç: https://vercel.com/dashboard
2. Storage → Postgres → Senin database'ini seç
3. **"Query"** tab'ına git

### Adım 2: SQL'i Kopyala ve Çalıştır

Aşağıdaki SQL komutunu **Vercel Postgres Query Editor**'a yapıştır ve **Run** butonuna bas:

```sql
-- ============================================
-- BUSINESS MEMBERSHIP SYSTEM - QUICK SETUP
-- ============================================

-- 1. Business kullanıcıları
CREATE TABLE IF NOT EXISTS business_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  company_name VARCHAR(255),
  company_type VARCHAR(100),
  company_address TEXT,
  company_city VARCHAR(100),
  company_district VARCHAR(100),
  tax_number VARCHAR(50),
  tax_office VARCHAR(100),
  authorized_person VARCHAR(255),
  added_by_admin BOOLEAN DEFAULT false,
  admin_notes TEXT
);

-- 2. Business profilleri
CREATE TABLE IF NOT EXISTS business_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  logo_url TEXT,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  working_hours JSONB,
  social_media JSONB,
  photos TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Business abonelik planları
CREATE TABLE IF NOT EXISTS business_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  monthly_price DECIMAL(10, 2),
  features JSONB,
  added_by_admin_id INTEGER,
  license_key VARCHAR(255) UNIQUE,
  max_users INTEGER DEFAULT 1,
  is_trial BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Index'ler
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_user_id ON business_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_dates ON business_subscriptions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_active ON business_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_business_users_company ON business_users(company_name);
CREATE INDEX IF NOT EXISTS idx_business_users_email ON business_users(email);
```

### Adım 3: Başarı Kontrolü

Query çalıştıktan sonra şunu yaz:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'business_%'
ORDER BY table_name;
```

✅ Görmeli:
- `business_profiles`
- `business_subscriptions`
- `business_users`

### Adım 4: Sayfayı Yenile

1. Admin panel sayfasını yenile: `http://localhost:3002/cityvadmin/dashboard`
2. **Business Üyeler** tab'ına git
3. **"+ Yeni Üye Ekle"** butonuna tıkla
4. ✅ Çalışmalı!

---

## 🎯 Alternatif: Terminal'den Çalıştır

Eğer Vercel CLI kuruluysa:

```powershell
# .env.local'deki DATABASE_URL'i kullan
$env:DATABASE_URL = "postgresql://neondb_owner:npg_Z1HBqLuCNi0w@ep-solitary-wind-ad4zkrm3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# psql ile bağlan (PostgreSQL client gerekli)
psql $env:DATABASE_URL -f database/full-business-setup.sql
```

**VEYA** Node.js script kullan:

```powershell
node database/setupBusinessDatabase.mjs
```

---

## 📧 Email Sistemi (Sonra)

Tablolar oluştuktan sonra email sistemi kuracağız:

1. Resend API entegrasyonu
2. Email template'leri
3. Kullanıcıya giriş bilgileri gönderme

**Şimdilik önce tabloları oluştur! 🚀**
