# PostgreSQL Üyelik Sistemi - Akış Diyagramı

## 🗄️ Database Tabloları

### 1. `users` Tablosu (Normal Kullanıcılar)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  membership_tier VARCHAR(50) DEFAULT 'free',  -- 'free', 'premium', 'business', 'enterprise'
  membership_expiry TIMESTAMP,
  ai_credits INTEGER DEFAULT 100,
  google_id VARCHAR(255) UNIQUE,
  ...
)
```

**Membership Tiers:**
- `free` - Ücretsiz kullanıcı
- `premium` - Ücretli bireysel kullanıcı
- `business` - Business aboneliği olan kullanıcı
- `enterprise` - Enterprise aboneliği olan kullanıcı

### 2. `business_users` Tablosu (Business Kullanıcılar)
```sql
CREATE TABLE business_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_type VARCHAR(100),
  authorized_person VARCHAR(255),
  added_by_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  ...
)
```

### 3. `business_subscriptions` Tablosu (Abonelikler)
```sql
CREATE TABLE business_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES business_users(id),
  plan_type VARCHAR(50),  -- 'premium' veya 'enterprise'
  license_key VARCHAR(100) UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  monthly_price DECIMAL(10,2),
  max_users INTEGER,
  features JSONB,
  ...
)
```

---

## 🔄 Business Üye Ekleme Akışı

### Admin → Users Tab → 🏢 Business Butonu

```
1. Admin buton tıklar
   ↓
2. Popup: Firma adı, Yetkili kişi sor
   ↓
3. POST /api/admin/business-members
   Body: {
     email: "user@example.com",
     companyName: "Acme Corp",
     authorizedPerson: "John Doe",
     subscriptionPlan: "premium",  // veya "enterprise"
     startDate: "2025-10-28",
     endDate: "2026-10-28",
     maxUsers: 10
   }
   ↓
4. API İşlemleri (PostgreSQL'de):
   
   a) Email kontrolü
      SELECT id FROM business_users WHERE email = ?
      
   b) Business user oluştur
      INSERT INTO business_users (
        email, full_name, company_name, 
        authorized_person, added_by_admin
      ) VALUES (...)
      RETURNING id → userId
      
   c) Business profile oluştur
      INSERT INTO business_profiles (
        user_id, business_name, address, ...
      ) VALUES (...)
      
   d) Subscription oluştur + Otomatik lisans
      licenseKey = generateLicenseKey() // CITYV-XXXX-XXXX-XXXX-XXXX
      INSERT INTO business_subscriptions (
        user_id, plan_type, license_key,
        start_date, end_date, max_users, ...
      ) VALUES (...)
      
   e) Normal users tablosunu güncelle ⭐
      SELECT id FROM users WHERE email = ?
      IF EXISTS:
        UPDATE users 
        SET membership_tier = 'business'  -- veya 'enterprise'
        WHERE email = ?
   ↓
5. Return: { success: true, licenseKey, ... }
   ↓
6. Frontend: Toast göster + Liste yenile
```

---

## 🗑️ Business Üyelikten Çıkarma Akışı

### Admin → Business Üyeler Tab → 🗑️ Üyelikten Çıkar

```
1. Admin buton tıklar
   ↓
2. Confirm dialog: "Firmayı çıkarmak istediğinize emin misiniz?"
   ↓
3. DELETE /api/admin/business-members
   Body: { userId: 123 }
   ↓
4. API İşlemleri (PostgreSQL'de):
   
   a) Subscription deaktif et
      UPDATE business_subscriptions
      SET is_active = false, end_date = NOW()
      WHERE user_id = ?
      
   b) Business user deaktif et
      UPDATE business_users
      SET is_active = false
      WHERE id = ?
      
   c) Normal users'a geri dön ⭐
      SELECT email FROM business_users WHERE id = ?
      SELECT id FROM users WHERE email = ?
      IF EXISTS:
        UPDATE users
        SET membership_tier = 'free'
        WHERE email = ?
   ↓
5. Return: { success: true }
   ↓
6. Frontend: Business listesinden kaldır, Users'a ekle
```

---

## 📊 Membership Tier Dönüşümleri

### Plan Type → Membership Tier Mapping

| API'den Gelen `subscriptionPlan` | Business Table `plan_type` | Users Table `membership_tier` |
|-----------------------------------|----------------------------|-------------------------------|
| `"premium"`                       | `"premium"`                | `"business"`                  |
| `"enterprise"`                    | `"enterprise"`             | `"enterprise"`                |

**Kodda:**
```typescript
// POST endpoint
const subscriptionPlan = 'premium'; // veya 'enterprise'
const actualTier = subscriptionPlan === 'premium' ? 'business' : 'enterprise';

UPDATE users SET membership_tier = actualTier WHERE email = ?
```

---

## 🔐 Email Eşleştirmesi

Aynı email hem `users` hem `business_users` tablosunda olabilir:

```
users Table:
  id=1, email="john@acme.com", membership_tier="business"

business_users Table:
  id=1, email="john@acme.com", company_name="Acme Corp"

business_subscriptions Table:
  id=1, user_id=1 (→ business_users.id), plan_type="premium"
```

**İlişki:**
- `business_users.email` = `users.email` (aynı kişi)
- Business üye olunca → `users.membership_tier` = 'business' veya 'enterprise'
- Business üyelikten çıkınca → `users.membership_tier` = 'free'

---

## ⚡ Otomatik İşlemler

### 1. Lisans Anahtarı Üretimi
```typescript
function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    const segment = Math.random().toString(36).substring(2, 8).toUpperCase();
    segments.push(segment);
  }
  return `CITYV-${segments.join('-')}`;
}
```
**Örnek:** `CITYV-A7D9EF-B2C4G8-H1J5K3-M9N6P2`

### 2. Tarih Ayarları
```typescript
const startDate = new Date().toISOString().split('T')[0]; // Bugün
const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  .toISOString().split('T')[0]; // 1 yıl sonra
```

### 3. Plan Özellikleri
```typescript
const monthlyPrice = planType === 'enterprise' ? 5000 : 2500;
const maxUsers = planType === 'enterprise' ? 50 : 10;
const features = planType === 'enterprise' 
  ? ['Sınırsız Kampanya', 'Gelişmiş Analitik', 'API Erişimi', ...]
  : ['Kampanya Yönetimi', 'Temel Analitik', 'Email Destek'];
```

---

## 🧪 Test SQL Sorguları

### Kullanıcının Business Durumunu Kontrol Et
```sql
SELECT 
  u.email,
  u.membership_tier,
  bu.company_name,
  bs.plan_type,
  bs.license_key,
  bs.is_active,
  bs.end_date
FROM users u
LEFT JOIN business_users bu ON u.email = bu.email
LEFT JOIN business_subscriptions bs ON bu.id = bs.user_id
WHERE u.email = 'test@example.com';
```

### Aktif Business Üyeleri Listele
```sql
SELECT 
  bu.company_name,
  bu.email,
  bs.plan_type,
  bs.license_key,
  bs.start_date,
  bs.end_date
FROM business_users bu
JOIN business_subscriptions bs ON bu.id = bs.user_id
WHERE bu.is_active = true 
  AND bs.is_active = true 
  AND bs.end_date > NOW();
```

### Free Üyelere Dönmüş Kullanıcılar
```sql
SELECT 
  u.email,
  u.name,
  u.membership_tier,
  bu.company_name,
  bs.end_date
FROM users u
LEFT JOIN business_users bu ON u.email = bu.email
LEFT JOIN business_subscriptions bs ON bu.id = bs.user_id
WHERE u.membership_tier = 'free'
  AND bu.id IS NOT NULL  -- Business kaydı var
  AND (bs.is_active = false OR bs.end_date < NOW());
```

---

## ✅ Veri Tutarlılığı Kontrolleri

### 1. Email Duplikasyonu Kontrolü
```sql
-- Aynı email'de sadece 1 business kaydı olmalı
SELECT email, COUNT(*) 
FROM business_users 
GROUP BY email 
HAVING COUNT(*) > 1;
```

### 2. Membership Tier Tutarlılığı
```sql
-- Business users'daki aktif üyeler, users'da business/enterprise olmalı
SELECT u.email, u.membership_tier, bu.company_name
FROM business_users bu
JOIN business_subscriptions bs ON bu.id = bs.user_id
JOIN users u ON bu.email = u.email
WHERE bs.is_active = true 
  AND bs.end_date > NOW()
  AND u.membership_tier NOT IN ('business', 'enterprise');
```

### 3. Süresi Dolmuş Abonelikler
```sql
-- Süresi dolmuş ama hala aktif gösterilen subscriptions
SELECT bu.company_name, bs.end_date, bs.is_active
FROM business_subscriptions bs
JOIN business_users bu ON bs.user_id = bu.id
WHERE bs.is_active = true 
  AND bs.end_date < NOW();
```

---

## 🎯 Özet: PostgreSQL'de Saklananlar

| Veri | Tablo | Kolon |
|------|-------|-------|
| Kullanıcı tier'ı | `users` | `membership_tier` |
| Firma bilgileri | `business_users` | `company_name`, `authorized_person`, ... |
| Lisans anahtarı | `business_subscriptions` | `license_key` |
| Abonelik tarihleri | `business_subscriptions` | `start_date`, `end_date` |
| Plan tipi | `business_subscriptions` | `plan_type` (premium/enterprise) |
| Aktiflik durumu | `business_subscriptions` | `is_active` |
| Max kullanıcı sayısı | `business_subscriptions` | `max_users` |

**Tüm veriler Vercel Postgres (Neon) üzerinde saklanıyor! 🚀**
