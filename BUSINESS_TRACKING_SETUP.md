# Business Dashboard - Görüntüleme & Favori Takibi Kurulum Rehberi

## 🎯 Yapılan Değişiklikler

### ✅ 1. Görüntüleme Takibi (Gerçek Zamanlı)
- **Önceki Durum**: Ankara geneli için business_id gerekiyordu, çalışmıyordu
- **Yeni Durum**: Business user giriş yaptığında, haritadaki TÜM lokasyonları görüntülediğinde kendi dashboard'unda takip edebiliyor

### ✅ 2. Favori Sistemi (Yeni Özellik)
- Kullanıcılar City-V haritasından lokasyonları favorilere ekleyebilir
- Business dashboard'da "Favoriler" sekmesi eklendi
- Favori edilen lokasyonlar, kategoriler ve trendler gösteriliyor

### ✅ 3. Gerçek Veriler (Mock Kaldırıldı)
- Tüm mock veriler (cityvData, revenueData, notificationsData) temizlendi
- City-V görüntülenmeleri gerçek database'den geliyor
- Favoriler gerçek database'den geliyor
- IoT analitik verileri zaten gerçekti, değişmedi

---

## 📋 Veritabanı Tabloları

### 1. business_views (Görüntüleme Takibi)
```sql
CREATE TABLE business_views (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id),
  location_id VARCHAR(100),      -- Görüntülenen lokasyon (ank-1, ank-2, vb.)
  location_name VARCHAR(255),    -- Lokasyon adı
  location_category VARCHAR(50), -- cafe, restaurant, bank vb.
  source VARCHAR(50),            -- 'map', 'list', 'search'
  viewed_at TIMESTAMP,
  user_agent TEXT,
  ip_address VARCHAR(50)
);
```

**Dosya**: `database/business_views_tracking.sql`

### 2. business_favorites (Favori Takibi)
```sql
CREATE TABLE business_favorites (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES business_profiles(id),
  user_email VARCHAR(255),
  location_id VARCHAR(100) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  location_category VARCHAR(50),
  location_address TEXT,
  location_coordinates JSONB,
  added_at TIMESTAMP,
  user_agent TEXT,
  source VARCHAR(50),
  UNIQUE(business_id, location_id) -- Aynı lokasyon tekrar eklenemez
);
```

**Dosya**: `database/business_favorites_tracking.sql`

---

## 🚀 Kurulum Adımları

### Adım 1: Veritabanı Tablolarını Oluşturun

**PowerShell'de**:
```powershell
# 1. Görüntüleme tablosu
Get-Content database\business_views_tracking.sql

# 2. Favoriler tablosu
Get-Content database\business_favorites_tracking.sql
```

**SQL'leri Çalıştırın**:
1. Vercel Postgres Dashboard'u açın
2. Her iki SQL dosyasının içeriğini kopyalayın
3. Query tab'ında çalıştırın

### Adım 2: Business Kullanıcı Olarak Giriş Yapın

1. `http://localhost:3000/business/login` adresine gidin
2. Business hesabınızla giriş yapın
3. Dashboard açılacak

### Adım 3: Test Edin

1. **Başka bir sekme** açın
2. `http://localhost:3000` ana sayfaya gidin (City-V haritası)
3. Herhangi bir lokasyon kartına tıklayın
4. Favori butonuna (kalp ❤️) tıklayın

### Adım 4: Dashboard'da Kontrol Edin

Business dashboard'a geri dönün:

**Analitik → City-V Sekmesi**:
- Toplam görüntüleme sayısını görün
- Bugünkü görüntülenmeleri görün
- Harita görüntülenme sayısını görün
- En çok görüntülenen lokasyonları görün

**Analitik → Favoriler Sekmesi**:
- Toplam favori sayısını görün
- Bugün eklenen favorileri görün
- Kategori dağılımını görün
- Son eklenen favorilerin listesini görün

---

## 🔍 Nasıl Çalışıyor?

### Görüntüleme Takibi

```
[Kullanıcı City-V haritasında lokasyon kartına tıklar]
           ↓
[LocationCard.tsx onClick]
           ↓
[localStorage'dan business_user kontrol eder]
           ↓
[POST /api/business/track-view]
  Body: {
    businessId: user.id,
    location: { id, name, category },
    source: 'map'
  }
           ↓
[business_views tablosuna INSERT]
           ↓
[Business Dashboard City-V tab'ı]
  - 30 saniyede bir otomatik güncellenir
  - GET /api/business/track-view?businessId=X
  - Gerçek verileri gösterir
```

### Favori Ekleme

```
[Kullanıcı kalp butonuna tıklar]
           ↓
[LocationCard.tsx favori butonu onClick]
           ↓
[localStorage'dan business_user kontrol eder]
           ↓
[POST /api/business/favorites]
  Body: {
    businessId: user.id,
    location: { id, name, category, address, coordinates },
    action: 'add',
    source: 'map'
  }
           ↓
[business_favorites tablosuna INSERT]
  - UNIQUE constraint: Aynı lokasyon tekrar eklenemez
           ↓
[Business Dashboard Favoriler tab'ı]
  - 30 saniyede bir otomatik güncellenir
  - GET /api/business/favorites?businessId=X
  - Toplam favoriler, kategori dağılımı, son eklenenler
```

---

## 📊 API Endpoints

### 1. POST /api/business/track-view
**Request**:
```json
{
  "businessId": 6,
  "location": {
    "id": "ank-1",
    "name": "Kızılay Kahve Diyarı",
    "category": "cafe"
  },
  "source": "map"
}
```

**Response**:
```json
{
  "success": true,
  "totalViews": 15,
  "message": "Görüntülenme kaydedildi"
}
```

### 2. GET /api/business/track-view?businessId=6
**Response**:
```json
{
  "success": true,
  "totalViews": 15,
  "todayViews": 3,
  "weeklyViews": [
    { "date": "2025-11-01", "views": 3 },
    { "date": "2025-10-31", "views": 5 }
  ],
  "sourceBreakdown": [
    { "source": "map", "views": 12 },
    { "source": "list", "views": 3 }
  ],
  "topLocations": [
    {
      "locationId": "ank-1",
      "locationName": "Kızılay Kahve Diyarı",
      "category": "cafe",
      "viewCount": 8
    }
  ]
}
```

### 3. POST /api/business/favorites
**Request (Ekle)**:
```json
{
  "businessId": 6,
  "location": {
    "id": "ank-1",
    "name": "Kızılay Kahve Diyarı",
    "category": "cafe",
    "address": "Kızılay Meydanı No:5",
    "coordinates": [39.9208, 32.8541]
  },
  "action": "add",
  "source": "map"
}
```

**Request (Kaldır)**:
```json
{
  "businessId": 6,
  "location": { "id": "ank-1" },
  "action": "remove"
}
```

**Response**:
```json
{
  "success": true,
  "action": "added",
  "totalFavorites": 5
}
```

### 4. GET /api/business/favorites?businessId=6
**Response**:
```json
{
  "totalFavorites": 5,
  "todayFavorites": 2,
  "weekFavorites": 4,
  "monthFavorites": 5,
  "categoryBreakdown": [
    { "location_category": "cafe", "count": 3 },
    { "location_category": "restaurant", "count": 2 }
  ],
  "dailyTrend": [
    { "date": "2025-11-01", "count": 2 }
  ],
  "recentFavorites": [
    {
      "id": 1,
      "location_id": "ank-1",
      "location_name": "Kızılay Kahve Diyarı",
      "location_category": "cafe",
      "location_address": "Kızılay Meydanı No:5",
      "added_at": "2025-11-01T10:30:00Z",
      "source": "map"
    }
  ],
  "stats": {
    "cafe": 3,
    "restaurant": 2,
    "bank": 0
  }
}
```

---

## 🎨 Dashboard Sekmeleri

### 1. **Analizler Tab** (analytics)
- IoT kamera verileri (değişmedi)
- Günlük/haftalık ziyaretçi grafikleri
- Yoğunluk analizi
- Giriş-çıkış verileri

### 2. **City-V Tab** (cityv)
- **Profil İstatistikleri**:
  - Toplam görüntüleme (gerçek)
  - Bugünkü görüntüleme (gerçek)
  - Harita görüntülenmeleri (gerçek)
  - Favoriler (gerçek)
- **Haftalık Trend**: Son 7 günün görüntüleme grafiği
- **En Çok Görüntülenen Lokasyonlar**: Top 10 liste

### 3. **Favoriler Tab** (favorites) ⭐ YENİ
- **İstatistik Kartları**:
  - Toplam favori
  - Bugün eklenen
  - Haftalık
  - Aylık
- **Kategori Dağılımı**: Bar chart
- **Son Eklenen Favoriler**: Detaylı liste

### 4. **Bildirimler Tab** (notifications)
- Şu an boş (gelecekte bildirim sistemi eklenecek)

---

## 🔧 Teknik Detaylar

### Değiştirilen Dosyalar

1. **components/ui/LocationCard.tsx**:
   - Lokasyon tıklamasında view tracking
   - Favori butonunda business favorite tracking
   - business_user localStorage'dan alınıyor

2. **components/Business/Dashboard/AnalyticsSection.tsx**:
   - Favoriler tab'ı eklendi
   - Mock veriler kaldırıldı
   - cityvStats ve favoritesData state'leri eklendi
   - loadFavorites fonksiyonu eklendi
   - 30 saniyelik otomatik refresh

3. **app/api/business/track-view/route.ts**:
   - Location bilgileri eklendi (location_id, location_name, location_category)
   - topLocations query eklendi
   - GET endpoint zenginleştirildi

4. **app/api/business/favorites/route.ts** ⭐ YENİ:
   - POST: Favori ekle/kaldır
   - GET: Favori istatistikleri

5. **database/business_views_tracking.sql**:
   - Location bilgisi kolonları eklendi
   - Demo data kaldırıldı

6. **database/business_favorites_tracking.sql** ⭐ YENİ:
   - Favori tracking için yeni tablo

7. **lib/ankaraData.ts**:
   - businessId alanı kaldırıldı (gerek kalmadı)

---

## ✅ Test Kontrol Listesi

- [ ] Business login çalışıyor
- [ ] City-V haritasında lokasyon tıklaması çalışıyor
- [ ] Console'da "👁️ View tracked" mesajı görünüyor
- [ ] Business Dashboard City-V tab'ında görüntüleme sayıları artıyor
- [ ] Favori butonu çalışıyor
- [ ] Console'da "⭐ Business favorite added" mesajı görünüyor
- [ ] Business Dashboard Favoriler tab'ında favoriler görünüyor
- [ ] 30 saniyede bir otomatik güncelleme çalışıyor
- [ ] En çok görüntülenen lokasyonlar listesi gösteriliyor
- [ ] Kategori dağılımı grafiği gösteriliyor

---

## 🐛 Hata Ayıklama

### Problem: "business_views" tablosu bulunamadı
**Çözüm**: `database/business_views_tracking.sql` dosyasını veritabanında çalıştırın

### Problem: "business_favorites" tablosu bulunamadı
**Çözüm**: `database/business_favorites_tracking.sql` dosyasını veritabanında çalıştırın

### Problem: Görüntüleme sayıları artmıyor
**Çözüm**: 
1. Business kullanıcı olarak giriş yaptığınızdan emin olun
2. Console'da `localStorage.getItem('business_user')` kontrol edin
3. Network tab'ında POST request gönderildiğini kontrol edin

### Problem: Favoriler görünmüyor
**Çözüm**:
1. Favori butonu tıklandığında console'da hata var mı kontrol edin
2. Network tab'ında POST /api/business/favorites başarılı mı kontrol edin
3. Veritabanında business_favorites tablosunda veri var mı kontrol edin

---

## 📈 Performans

- **Otomatik Güncelleme**: 30 saniye
- **Cache**: Yok (her istekte gerçek veriler)
- **Index'ler**: business_id, location_id, viewed_at, added_at
- **Veri Retention**: 90 gün (cleanup fonksiyonu mevcut)

---

## 🎉 Sonuç

Artık business dashboard tamamen gerçek verilerle çalışıyor:
- ✅ Görüntülenme takibi gerçek
- ✅ Favori sistemi çalışıyor
- ✅ Mock veriler kaldırıldı
- ✅ Otomatik güncelleme aktif
- ✅ Lokasyon detayları kaydediliyor

Başarılar! 🚀
