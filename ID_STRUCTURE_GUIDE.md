# 🔐 City-V ID Structure & Data Isolation System

## 📊 Database ID Architecture

### **Sistemin Temel Prensibi**
Her kullanıcı ve işletme **unique ID** ile tanımlanır ve tüm veriler bu ID'lerle **izole** edilir. 
Başka bir kullanıcının verileri asla karışmaz.

---

## 🏗️ ID Hierarchy (Üç Katmanlı Yapı)

### 1️⃣ **Business User (İşletme Kullanıcısı)**
```sql
Table: business_users
Primary Key: id (INTEGER)
```

**Örnek:**
```
ID: 20
Email: atmbankde@gmail.com
Name: Ercan Ergüler
```

**Bu ID kullanıldığı yerler:**
- `business_profiles.user_id` → Profil sahibi
- `business_cameras.business_user_id` → Kamera sahibi
- JWT token içinde `userId` → Authentication

---

### 2️⃣ **Business Profile (İşletme Profili)**
```sql
Table: business_profiles
Primary Key: id (INTEGER)
Foreign Key: user_id → business_users.id
```

**Örnek:**
```
Profile ID: 15
User ID: 20 (business_users.id)
Business Name: SCE INNOVATION
```

**Bu ID kullanıldığı yerler:**
- `business_menu_categories.business_id` → Menü kategorileri
- `business_menu_items.business_id` → Menü ürünleri
- `location_reviews.location_id` → Yorumlar
- `/api/locations` response → Harita üzerinde gösterim

---

### 3️⃣ **Business Camera (IoT Kameralar)**
```sql
Table: business_cameras
Primary Key: id (INTEGER)
Foreign Key: business_user_id → business_users.id
```

**Örnek:**
```
Camera ID: 50 → Salon
Camera ID: 55 → City-V Camera
Business User ID: 20 (her iki kamera da aynı kullanıcıya ait)
```

**Bu ID kullanıldığı yerler:**
- `crowd_analysis.camera_id` → Kalabalık verileri
- `iot_ai_analysis.camera_id` → AI analiz verileri
- ESP32 cihazlar → API'ye veri gönderirken camera_id kullanır

---

## 🔒 Data Isolation Examples

### ✅ Doğru Veri İlişkileri (Mevcut Sistem)

```
Business User 20 (atmbankde@gmail.com)
  └── Business Profile 15 (SCE INNOVATION)
        ├── Menu Categories (7 kategori) → business_id = 15
        │     └── Menu Items (18 ürün) → business_id = 15
        ├── Reviews (5 yorum) → location_id = 15
        └── Cameras
              ├── Camera 50 (Salon) → business_user_id = 20
              │     └── Crowd Analysis (6 kayıt) → camera_id = 50
              └── Camera 55 (City-V Camera) → business_user_id = 20
                    └── Crowd Analysis (18 kayıt) → camera_id = 55
```

### ❌ Yanlış Veri İlişkileri (Temizlendi)

**Eski durumda vardı, şimdi silindi:**
```
❌ Menu Category ID 1 → business_id = 1 (business profile yok!)
❌ Menu Category ID 4 → business_id = 4 (business profile yok!)
❌ Menu Category ID 6 → business_id = 6 (business profile yok!)
```

Bu veriler **orphaned (sahipsiz)** olduğu için `cleanup-orphaned-data.js` ile temizlendi.

---

## 🔐 API Authentication & Authorization

### **JWT Token Structure**
```typescript
{
  userId: 20,        // business_users.id
  email: "atmbankde@gmail.com"
}
```

### **API Endpoint Security**

#### 1. **Menu API** (`/api/business/menu`)
```typescript
// 1. JWT token'dan userId al
const user = jwt.verify(token, JWT_SECRET);

// 2. businessId parametresi ile eşleşmeli mi kontrol et
// NOT: businessId = business_profiles.id değil, business_users.id ile eşleşmeli

// 3. business_id ile veri çek (business_profiles.id)
const categories = await sql`
  SELECT * FROM business_menu_categories 
  WHERE business_id = ${businessProfileId}
`;
```

#### 2. **Camera Data API** (`/api/business/live-iot-data`)
```typescript
// Sadece kendi kameralarını göster
const cameras = await sql`
  SELECT * FROM business_cameras
  WHERE business_user_id = ${user.userId}
`;

// Sadece bu kameralara ait crowd analysis
const crowdData = await sql`
  SELECT * FROM crowd_analysis
  WHERE camera_id IN (${cameraIds})
`;
```

#### 3. **Reviews API** (`/api/locations/reviews`)
```typescript
// Business dashboard için - sadece kendi işletmesinin yorumlarını göster
const reviews = await sql`
  SELECT lr.* 
  FROM location_reviews lr
  JOIN business_profiles bp ON lr.location_id = bp.id
  WHERE bp.user_id = ${businessUserId}
`;
```

---

## 📝 Yeni İşletme Ekleme Prosedürü

### **Adım 1: Business User Oluştur**
```sql
INSERT INTO business_users (email, password, full_name, phone, membership_tier)
VALUES ('yeni@isletme.com', 'hashed_password', 'İşletme Sahibi', '+905551234567', 'premium')
RETURNING id; -- Örnek: 21
```

### **Adım 2: Business Profile Oluştur**
```sql
INSERT INTO business_profiles (
  user_id, business_name, category, latitude, longitude, 
  address, phone, working_hours
)
VALUES (
  21, -- business_users.id
  'Yeni Kafe',
  'cafe',
  39.9334,
  32.8597,
  'Çankaya, Ankara',
  '+903121234567',
  '{"monday": {"isOpen": true, "openTime": "09:00", "closeTime": "22:00"}}'::jsonb
)
RETURNING id; -- Örnek: 16
```

### **Adım 3: Kamera Ekle (Opsiyonel)**
```sql
INSERT INTO business_cameras (
  business_user_id, -- business_users.id
  camera_name,
  camera_type,
  location
)
VALUES (
  21, -- business_users.id (business_profiles.id DEĞİL!)
  'Giriş Kamerası',
  'ESP32-CAM',
  'Salon Girişi'
)
RETURNING id; -- Örnek: 56
```

### **Adım 4: Menü Ekle**
```sql
-- Kategori
INSERT INTO business_menu_categories (business_id, name, icon)
VALUES (16, 'İçecekler', '☕') -- business_profiles.id
RETURNING id; -- Örnek: 18

-- Ürün
INSERT INTO business_menu_items (business_id, category_id, name, price)
VALUES (16, 18, 'Türk Kahvesi', '40.00'); -- business_profiles.id
```

---

## ⚠️ Dikkat Edilmesi Gerekenler

### ❌ **YANLIŞ - Karışma Riski**
```typescript
// business_profiles.id ile business_users.id karıştırılmamalı!
const cameras = await sql`
  SELECT * FROM business_cameras
  WHERE business_user_id = ${businessProfileId} -- YANLIŞ! 15 kullanılırsa yanlış
`;
```

### ✅ **DOĞRU**
```typescript
// business_cameras -> business_users.id kullanır
const cameras = await sql`
  SELECT * FROM business_cameras
  WHERE business_user_id = ${businessUserId} -- DOĞRU! 20 kullanılır
`;

// business_menu_categories -> business_profiles.id kullanır
const categories = await sql`
  SELECT * FROM business_menu_categories
  WHERE business_id = ${businessProfileId} -- DOĞRU! 15 kullanılır
`;
```

---

## 🧪 Test & Verification

### **ID Yapısını Kontrol Et**
```bash
node check-id-structure.js
```

**Beklenen Çıktı:**
```
✅ All business users have profiles
✅ All cameras linked to valid business users
✅ All menu categories linked to valid businesses
```

### **Orphaned Data Temizle**
```bash
node cleanup-orphaned-data.js
```

---

## 📊 Mevcut Sistem Durumu (21 Kasım 2025)

```
✅ Business Users: 1
   └── ID: 20 (atmbankde@gmail.com)

✅ Business Profiles: 1
   └── ID: 15 (SCE INNOVATION) → user_id: 20

✅ Cameras: 2
   ├── ID: 50 (Salon) → business_user_id: 20
   └── ID: 55 (City-V Camera) → business_user_id: 20

✅ Menu Categories: 7 → business_id: 15
✅ Menu Items: 18 → business_id: 15
✅ Reviews: 5 → location_id: 15
✅ Crowd Analysis: 24 kayıt → camera_id: 50 & 55

❌ Orphaned Data: TEMİZLENDİ
   • 9 kategori silindi (business_id 1, 4, 6, 10)
   • 8 ürün silindi
```

---

## 🚀 Production Deployment Checklist

- [x] ID yapısı doğrulandı
- [x] Orphaned data temizlendi
- [x] API authentication kontrol edildi
- [x] Foreign key ilişkileri test edildi
- [x] Multi-user izolasyonu doğrulandı
- [x] Dokümantasyon hazırlandı

---

## 📞 İletişim

Her yeni işletme eklendiğinde:
1. `business_users` → User ID al
2. `business_profiles` → Profile ID al (user_id ile bağla)
3. Kameralar için User ID kullan
4. Menü için Profile ID kullan
5. ID'leri karıştırma!

**Kural:** `business_user_id` varsa → `business_users.id`, `business_id` varsa → `business_profiles.id`
