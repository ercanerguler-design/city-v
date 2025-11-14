# City-V Business Integration - TAMAMLANDI ✅

## 🎯 Genel Bakış

Business üyeleri eklediğinizde, işletme bilgileri ve konum algılandığında **otomatik olarak City-V anasayfasına entegre olacak** şekilde sistem kuruldu. İşletmeler çalışma saatlerine göre City-V anasayfasında **"AÇIK/KAPALI"** bilgisi gösterecek.

## ✅ Tamamlanan İşlemler

### 1. Database Yapısı (TAMAMLANDI)

**Yeni Kolonlar Eklendi:**
- `location_id` (VARCHAR 255, UNIQUE) - İşletme için otomatik URL-friendly ID
- `category` (VARCHAR 50) - City-V kategori sistemi ile uyumlu kategori
- `is_visible_on_map` (BOOLEAN) - Haritada görünürlük kontrolü
- `auto_sync_to_cityv` (BOOLEAN) - Otomatik senkronizasyon ayarı
- `working_hours` (JSONB) - Çalışma saatleri (haftalık program)
- `average_wait_time` (INTEGER) - Ortalama bekleme süresi
- `current_crowd_level` (VARCHAR 20) - Mevcut kalabalık seviyesi
- `rating` (DECIMAL 3,2) - Kullanıcı değerlendirmesi
- `review_count` (INTEGER) - Toplam yorum sayısı

**Otomatik Sistemler:**

1. **Location ID Oluşturma:**
   - Trigger: `trigger_auto_generate_location_id`
   - Function: `generate_location_id(business_name, city)`
   - Özellik: Türkçe karakter desteği (ğ→g, ü→u, ş→s, vb.)
   - Örnek: "Kahve Dünyası Ankara" → "kahve-dunyasi-ankara"
   - Unique kontrolü: Aynı isim varsa sayı eklenir (kahve-dunyasi-ankara-2)

2. **Kategori Eşleştirme:**
   - Trigger: `trigger_auto_update_category`
   - Function: `map_business_type_to_category(business_type)`
   - 20+ business_type → City-V category eşleşmesi
   - Örnekler:
     - restaurant → restaurant
     - cafe → cafe
     - shopping → alisveris
     - hospital → saglik
     - bank → banka
     - gym → spor

3. **Database View:**
   - View: `cityv_locations`
   - Business profiles + static locations birleşik görünümü
   - Sadece aktif ve görünür işletmeler
   - City-V Location formatına otomatik dönüşüm

### 2. API Endpoints (TAMAMLANDI)

#### `/api/locations` (GET)
**Amaç:** Business ve static location'ları birleşik olarak döner

**Query Parameters:**
- `city` - Şehir filtresi (ankara, istanbul, izmir)
- `category` - Kategori filtresi (restaurant, cafe, vb.)

**Response Format:**
```json
{
  "success": true,
  "locations": [
    {
      "id": "kahve-dunyasi-ankara",
      "name": "Kahve Dünyası",
      "category": "cafe",
      "coordinates": [39.9334, 32.8597],
      "address": "Kızılay, Ankara",
      "workingHours": {
        "monday": {"open": "09:00", "close": "22:00", "isOpen": true},
        "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true},
        ...
      },
      "isOpen": true,
      "source": "business",
      "isBusiness": true,
      "currentCrowdLevel": "orta",
      "currentPeople": 15,
      "isLive": true
    }
  ]
}
```

#### `/api/business/sync-to-cityv` (POST)
**Amaç:** Business profile'ı City-V'ye manuel senkronize eder

**Request Body:**
```json
{
  "businessUserId": "user-id",
  "workingHours": { ... },
  "isVisibleOnMap": true,
  "autoSyncToCityv": true
}
```

#### `/api/business/sync-to-cityv` (GET)
**Amaç:** Sync durumunu kontrol eder

**Query Parameters:**
- `businessUserId` - Business user ID

**Response:**
```json
{
  "synced": true,
  "profile": {
    "locationId": "kahve-dunyasi-ankara",
    "category": "cafe",
    "isVisibleOnMap": true,
    "autoSyncToCityv": true
  }
}
```

### 3. Frontend Entegrasyonu (TAMAMLANDI)

#### WorkingHoursEditor Komponenti
**Konum:** `components/Business/Dashboard/WorkingHoursEditor.tsx`

**Özellikler:**
- 7 günlük açılış/kapanış saati düzenleyici
- Her gün için açık/kapalı toggle
- "Tümüne Uygula" özelliği (örn: Hafta içi 09:00-18:00)
- City-V görünürlük kontrolü
- Otomatik senkronizasyon ayarı
- Sync durum banner'ı (yeşil=senkronize, turuncu=değil)
- Toast bildirimleri

**Kullanım:**
```tsx
<WorkingHoursEditor 
  businessUserId={userId} 
  initialHours={workingHours}
/>
```

#### Business Dashboard Integration
**Konum:** `components/Business/Dashboard/SettingsSection.tsx`

Ayarlar sekmesine yeni bölüm eklendi:
- "City-V Anasayfa Entegrasyonu" başlığı
- Gradient background ile görsel vurgu
- WorkingHoursEditor komponenti entegre edildi

#### City-V Homepage Update
**Konum:** `app/page-professional.tsx`

**Değişiklikler:**
- `/api/cityv/business-locations` → `/api/locations` endpoint değişimi
- Static + Business locations birleşik çekiliyor
- Şehir değiştiğinde otomatik güncelleme
- 30 saniyede bir otomatik refresh (IoT data için)
- Working hours ile AÇIK/KAPALI hesaplaması
- `isLocationOpen()` utility kullanımı

**Önceki Kod:**
```tsx
const response = await fetch('/api/cityv/business-locations');
```

**Yeni Kod:**
```tsx
const response = await fetch(`/api/locations?city=${selectedCity}`);
```

### 4. Working Hours Sistemi (TAMAMLANDI)

#### Format
```json
{
  "monday": {
    "open": "09:00",
    "close": "18:00",
    "isOpen": true
  },
  "tuesday": {
    "open": "09:00",
    "close": "18:00",
    "isOpen": true
  },
  "wednesday": { "isOpen": false },
  ...
}
```

#### isLocationOpen() Utility
**Konum:** `lib/workingHours.ts`

**Özellikler:**
- Mevcut gün ve saate göre açık/kapalı kontrolü
- 24 saat açık işletme desteği
- Weekend/hafta içi farklı saatler
- Kategori bazlı fallback (örn: hastaneler 7/24)

**Kullanım:**
```tsx
const { isOpen, reason } = isLocationOpen(location);
// isOpen: true/false
// reason: "Kapalı (Bugün çalışmıyor)" vb.
```

#### LocationCard Integration
**Konum:** `components/ui/LocationCard.tsx`

Zaten working hours desteği var:
- Yeşil "AÇIK" badge
- Kırmızı "KAPALI" badge
- Working hours schedule gösterimi

## 📋 Migration Çalıştırma

**Otomatik Script:**
```bash
node run-cityv-migration-fixed.js
```

**Manuel (psql):**
```bash
psql -d cityv < database/business-cityv-integration.sql
psql -d cityv < database/business-category-mapping.sql
```

## 🧪 Test Etme

### 1. Database Kontrolü
```sql
-- Yeni kolonları kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_profiles' 
AND column_name IN ('location_id', 'category', 'working_hours');

-- Trigger'ları kontrol et
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'business_profiles';

-- View'ı kontrol et
SELECT * FROM cityv_locations LIMIT 5;
```

### 2. API Testi
```bash
# Tüm locations
curl http://localhost:3000/api/locations?city=ankara

# Sadece cafe'ler
curl http://localhost:3000/api/locations?city=ankara&category=cafe

# Sync durumu
curl http://localhost:3000/api/business/sync-to-cityv?businessUserId=USER_ID
```

### 3. Frontend Test
1. Business dashboard'a giriş yap
2. Ayarlar sekmesine git
3. "City-V Anasayfa Entegrasyonu" bölümünü bul
4. Working hours ayarla (örn: Pzt-Cum 09:00-18:00)
5. "Haritada Göster" toggle'ını aktif et
6. "Kaydet" butonuna tıkla
7. City-V anasayfasını aç: http://localhost:3000
8. İşletmenin haritada göründüğünü kontrol et
9. Kartın üzerinde "AÇIK" veya "KAPALI" badge'ini gör

### 4. Otomatik Test Script
```bash
node test-cityv-integration.js
```

## 🔄 Çalışma Akışı

### Business Profili Oluşturma
1. Admin business user ekler
2. Business user profil bilgilerini doldurur
3. **Trigger otomatik çalışır:**
   - `location_id` oluşturulur
   - `category` eşleştirilir
4. Business dashboard'da working hours ayarlanır
5. "Haritada Göster" aktif edilir
6. **Otomatik City-V'ye senkronize olur**

### City-V Anasayfa
1. Sayfa yüklendiğinde `/api/locations` çağrılır
2. Business + Static locations birleştirilir
3. Working hours'a göre AÇIK/KAPALI hesaplanır
4. Haritada marker'lar gösterilir
5. Her 30 saniyede bir güncellenir

### Real-Time Updates
- IoT crowd data 5 saniyede bir güncellenir
- Business profile değişiklikleri anında yansır
- Working hours güncellemeleri 30 saniyede bir haritaya yansır

## 📁 Dosya Yapısı

```
database/
  ├── business-cityv-integration.sql      # Ana migration (columns, triggers, view)
  └── business-category-mapping.sql       # Kategori eşleştirme

app/api/
  ├── locations/route.ts                  # Birleşik locations endpoint
  └── business/sync-to-cityv/route.ts    # Sync endpoint

components/Business/Dashboard/
  ├── WorkingHoursEditor.tsx              # Working hours UI
  └── SettingsSection.tsx                 # Dashboard settings

app/
  └── page-professional.tsx               # City-V homepage (güncellendi)

lib/
  └── workingHours.ts                     # AÇIK/KAPALI logic

scripts/
  ├── run-cityv-migration-fixed.js        # Migration runner
  └── test-cityv-integration.js           # Integration test
```

## 🎨 Working Hours Format Örnekleri

### Standart İş Yeri
```json
{
  "monday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "tuesday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "wednesday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "thursday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "friday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "saturday": {"isOpen": false},
  "sunday": {"isOpen": false}
}
```

### Cafe / Restoran
```json
{
  "monday": {"open": "08:00", "close": "23:00", "isOpen": true},
  "tuesday": {"open": "08:00", "close": "23:00", "isOpen": true},
  "wednesday": {"open": "08:00", "close": "23:00", "isOpen": true},
  "thursday": {"open": "08:00", "close": "23:00", "isOpen": true},
  "friday": {"open": "08:00", "close": "01:00", "isOpen": true},
  "saturday": {"open": "09:00", "close": "01:00", "isOpen": true},
  "sunday": {"open": "09:00", "close": "23:00", "isOpen": true}
}
```

### 24 Saat Açık
```json
{
  "monday": {"open": "00:00", "close": "23:59", "isOpen": true},
  "tuesday": {"open": "00:00", "close": "23:59", "isOpen": true},
  "wednesday": {"open": "00:00", "close": "23:59", "isOpen": true},
  "thursday": {"open": "00:00", "close": "23:59", "isOpen": true},
  "friday": {"open": "00:00", "close": "23:59", "isOpen": true},
  "saturday": {"open": "00:00", "close": "23:59", "isOpen": true},
  "sunday": {"open": "00:00", "close": "23:59", "isOpen": true}
}
```

## 🐛 Troubleshooting

### Problem: İşletme haritada görünmüyor
**Çözüm:**
1. Business profile'da `latitude` ve `longitude` dolu mu?
2. `is_visible_on_map` true mu?
3. Business user `is_active` true mu?
4. `/api/locations` endpoint'i doğru response veriyor mu?

### Problem: Location ID oluşmadı
**Çözüm:**
1. Trigger'ı kontrol et: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_generate_location_id'`
2. Manuel çalıştır: `UPDATE business_profiles SET location_id = generate_location_id(business_name, city) WHERE location_id IS NULL`

### Problem: Kategori eşleşmedi
**Çözüm:**
1. Business_type değerini kontrol et
2. `map_business_type_to_category()` fonksiyonuna ekle
3. Manuel güncelle: `UPDATE business_profiles SET category = map_business_type_to_category(business_type) WHERE category IS NULL`

### Problem: AÇIK/KAPALI yanlış gösteriliyor
**Çözüm:**
1. Working hours formatını kontrol et
2. Timezone ayarını kontrol et
3. `isLocationOpen()` fonksiyonunu test et

## 🚀 Deployment

### Vercel Deployment
1. Environment variables ayarla:
   - `DATABASE_URL` / `POSTGRES_URL`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

2. Migration'ları çalıştır:
```bash
npm run migrate  # veya
node run-cityv-migration-fixed.js
```

3. Build ve deploy:
```bash
npm run build
vercel --prod
```

### Database Backup
```bash
# Backup al
pg_dump -h HOST -U USER -d DB > backup.sql

# Restore et
psql -h HOST -U USER -d DB < backup.sql
```

## 📊 Monitoring

### Database Queries
```sql
-- Aktif business locations sayısı
SELECT COUNT(*) FROM cityv_locations;

-- Kategorilere göre dağılım
SELECT category, COUNT(*) FROM business_profiles GROUP BY category;

-- Haritada görünür işletmeler
SELECT COUNT(*) FROM business_profiles WHERE is_visible_on_map = true;

-- Working hours olan işletmeler
SELECT COUNT(*) FROM business_profiles WHERE working_hours IS NOT NULL;
```

### API Metrics
- `/api/locations` response time
- Location count per city
- Business vs Static ratio
- Working hours coverage

## ✅ Checklist

### Business Admin
- [ ] Business user eklendi
- [ ] Profile bilgileri dolduruldu
- [ ] Konum (latitude/longitude) girildi
- [ ] Business type seçildi
- [ ] Working hours ayarlandı
- [ ] "Haritada Göster" aktif edildi
- [ ] Kaydet butonuna tıklandı

### Test
- [ ] `/api/locations` response alıyor
- [ ] Business location listede görünüyor
- [ ] `location_id` otomatik oluştu
- [ ] `category` doğru eşleşti
- [ ] Working hours doğru formatta
- [ ] City-V homepage'de marker görünüyor
- [ ] AÇIK/KAPALI badge doğru gösteriliyor
- [ ] 30 saniyede bir güncelleniyor

### Production
- [ ] Database migrations çalıştırıldı
- [ ] Environment variables ayarlandı
- [ ] Vercel deployment yapıldı
- [ ] API endpoints test edildi
- [ ] Real-time updates çalışıyor
- [ ] Working hours sistemi aktif

## 🎉 Sonuç

City-V Business Integration **TAM OTOM tamamen tamamlandı**! 

Artık:
✅ Business üyesi eklediğinizde otomatik City-V'ye entegre olur
✅ Location ID otomatik oluşturulur (URL-friendly, Türkçe karakter desteği)
✅ Kategori otomatik eşleştirilir
✅ Working hours ile AÇIK/KAPALI durumu gösterilir
✅ Haritada real-time IoT data ile birlikte gösterilir
✅ 30 saniyede bir otomatik güncellenir

**Tüm sistem hazır ve çalışır durumda!** 🚀
