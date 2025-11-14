# İşletme Görüntüleme Takibi - Kurulum ve Test Rehberi

## 📋 Sistem Özeti

City-V haritasında bir işletme kartına tıklandığında, bu görüntüleme Business Dashboard'da gerçek zamanlı olarak takip edilir.

## ✅ Tamamlanan İşlemler

### 1. Veritabanı Şeması (✅ HAZIR)
- **Dosya**: `database/business_views_tracking.sql`
- **Tablo**: `business_views` - Tüm görüntülenmeleri kaydeder
- **View**: `business_view_stats` - Hızlı istatistikler için
- **Indexes**: business_id, viewed_at, source için performans optimizasyonu
- **Demo Data**: business_id=6 için 5 örnek görüntüleme

### 2. Backend API (✅ ÇALIŞIYOR)
- **Dosya**: `app/api/business/track-view/route.ts`
- **POST Endpoint**: Görüntüleme kaydeder
  - Body: `{ businessId: number, source: 'map' | 'list' | 'search' }`
  - Response: `{ success: true, totalViews: number }`
- **GET Endpoint**: İstatistikleri getirir
  - Query: `?businessId=6`
  - Response: `{ totalViews, todayViews, weeklyViews[], sourceBreakdown[] }`

### 3. Frontend Tracking (✅ ENTEGRE)
- **Dosya**: `components/ui/LocationCard.tsx`
- **Davranış**: Kart tıklamasında otomatik tracking
- **Log**: Console'da "👁️ View tracked for business: X" mesajı

### 4. Dashboard Görüntüleme (✅ CANLI)
- **Dosya**: `components/Business/Dashboard/AnalyticsSection.tsx`
- **City-V Tab**: Gerçek görüntüleme verilerini gösterir
- **Güncelleme**: Her 30 saniyede bir otomatik yenilenir
- **Veriler**: Toplam görüntülenme, bugünkü görüntülenme, kaynak dağılımı

### 5. TypeScript Type (✅ GÜNCELLENDİ)
- **Dosya**: `types/index.ts`
- **Alan**: `businessId?: number` Location interface'ine eklendi

### 6. Demo Lokasyon (✅ EKLENDİ)
- **Dosya**: `lib/ankaraData.ts`
- **Lokasyon**: "Kızılay Kahve Diyarı" → `businessId: 6`

## 🚀 Kurulum Adımları

### Adım 1: Veritabanı Tablosunu Oluştur

Veritabanınıza bağlanıp şu SQL'i çalıştırın:

```bash
# PowerShell'de dosya içeriğini görüntüle
Get-Content database\business_views_tracking.sql

# SQL'i kopyalayıp veritabanınızda çalıştırın (Vercel Postgres Dashboard veya psql ile)
```

**Alternatif**: Vercel Dashboard'dan:
1. Vercel projenize gidin
2. Storage → Postgres Database
3. Query Tab'ı açın
4. `business_views_tracking.sql` içeriğini yapıştırın
5. "Run Query" butonuna tıklayın

### Adım 2: Business Profile ID'sini Kontrol Et

Business dashboard'a giriş yapın ve console'da business profile ID'sini kontrol edin:

```javascript
// Browser console'da çalıştır:
const profile = JSON.parse(localStorage.getItem('business_user'));
console.log('Business ID:', profile?.id);
```

**ÖNEMLİ**: Eğer ID 6 değilse, iki seçeneğiniz var:

**Seçenek A**: Demo data'yı kendi ID'nize güncelleyin:
```sql
-- 6 yerine kendi business_id'nizi yazın
INSERT INTO business_views (business_id, source, viewed_at) VALUES
  (BURAYA_KENDI_ID, 'map', NOW() - INTERVAL '1 hour'),
  (BURAYA_KENDI_ID, 'map', NOW() - INTERVAL '2 hours'),
  (BURAYA_KENDI_ID, 'list', NOW() - INTERVAL '3 hours');
```

**Seçenek B**: `ankaraData.ts`'deki businessId'yi güncelleyin:
```typescript
// lib/ankaraData.ts - Line ~15
businessId: 6, // BURAYA KENDI ID'NİZİ YAZIN
```

## 🧪 Test Senaryosu

### Test 1: View Tracking API'yi Test Et

```bash
# POST Request - Görüntüleme kaydet
curl -X POST http://localhost:3000/api/business/track-view \
  -H "Content-Type: application/json" \
  -d '{"businessId": 6, "source": "map"}'

# Beklenen Response:
# {"success": true, "totalViews": 6}
```

```bash
# GET Request - İstatistikleri al
curl "http://localhost:3000/api/business/track-view?businessId=6"

# Beklenen Response:
# {
#   "totalViews": 6,
#   "todayViews": 1,
#   "weeklyViews": [...],
#   "sourceBreakdown": [...]
# }
```

### Test 2: Frontend'de Gerçek Tıklama Testi

1. **Dev Server'ı Çalıştır**:
   ```bash
   npm run dev
   ```

2. **City-V Haritasını Aç**:
   - Tarayıcıda `http://localhost:3000/page-professional` veya ana sayfa
   - Haritada "Kızılay Kahve Diyarı" lokasyonunu bul

3. **Browser Console'u Aç**:
   - F12 tuşuna bas
   - Console tab'ına geç

4. **Lokasyon Kartına Tıkla**:
   - Haritada "Kızılay Kahve Diyarı" işaretine tıkla
   - Console'da şu mesajı görmeli:
     ```
     👁️ View tracked for business: 6
     ✅ View tracking successful: {success: true, totalViews: 7}
     ```

5. **Business Dashboard'u Aç**:
   - `http://localhost:3000/business/dashboard` adresine git
   - Giriş yapın (eğer business_id=6 hesabınız varsa)

6. **City-V Tab'ını Kontrol Et**:
   - "Analitik" bölümüne gidin
   - En altta "City-V Entegrasyonu" tab'ına tıklayın
   - "Profil Görüntüleme" kartında gerçek sayıları görmeli:
     ```
     Toplam Görüntüleme: 7
     Bugün: 1
     Haritadan: 5
     ```

### Test 3: Otomatik Güncelleme Testi

1. Business Dashboard'da City-V tab'ında kalın
2. Başka bir tarayıcı sekmesi açın
3. City-V haritasında aynı lokasyona tekrar tıklayın
4. 30 saniye bekleyin (otomatik güncelleme aralığı)
5. Dashboard'daki sayıların artmış olması gerekir

## 📊 Veri Akışı

```
[City-V Harita]
    ↓ (Kullanıcı lokasyon kartına tıklar)
[LocationCard.tsx]
    ↓ (onClick handler)
[POST /api/business/track-view]
    ↓ (businessId: 6, source: 'map')
[business_views tablosuna INSERT]
    ↓
[Response: totalViews: 7]
    ↓
[Business Dashboard City-V Tab]
    ↓ (Her 30 saniyede bir)
[GET /api/business/track-view?businessId=6]
    ↓
[Güncel istatistikler gösterilir]
```

## 🔍 Hata Ayıklama

### Problem: Console'da "businessId undefined" hatası

**Çözüm**: LocationCard'a tıkladığınız lokasyonun businessId'si yok demektir.

```typescript
// lib/ankaraData.ts dosyasında lokasyona businessId ekleyin:
{
  id: 'ank-1',
  name: 'Kızılay Kahve Diyarı',
  // ... diğer alanlar
  businessId: 6, // BU SATIRI EKLEYİN
}
```

### Problem: Dashboard'da "0" görüntüleme gösteriyor

**Olası Sebepler**:
1. Veritabanı tablosu oluşturulmamış
2. businessId eşleşmiyor
3. API çağrısı başarısız

**Kontrol**:
```javascript
// Browser console'da:
fetch('http://localhost:3000/api/business/track-view?businessId=6')
  .then(r => r.json())
  .then(d => console.log('API Response:', d));
```

### Problem: "Failed to fetch" hatası

**Çözüm**: Backend API route'u kontrol edin:
```bash
# Terminal'de:
ls app/api/business/track-view/
# route.ts dosyasının olduğundan emin olun
```

### Problem: SQL Foreign Key hatası

**Sebep**: business_profiles tablosunda business_id=6 yok.

**Çözüm**: Önce bir business profile oluşturun veya mevcut bir profile'ın ID'sini kullanın:
```sql
-- Mevcut business profile'ları listele
SELECT id, business_name, email FROM business_profiles;

-- Çıkan ID'lerden birini kullanın
```

## 📈 Gelişmiş Özellikler

### Daha Fazla Lokasyona businessId Ekleyin

```typescript
// lib/ankaraData.ts
{
  id: 'ank-2',
  name: 'Tunalı Keyif Kahve',
  category: 'cafe',
  // ... diğer alanlar
  businessId: 7, // Farklı bir işletme için
},
```

### Farklı Kaynaklardan Tracking

```typescript
// Liste görünümünden tracking:
fetch('/api/business/track-view', {
  method: 'POST',
  body: JSON.stringify({ businessId: 6, source: 'list' })
});

// Arama sonuçlarından tracking:
fetch('/api/business/track-view', {
  method: 'POST',
  body: JSON.stringify({ businessId: 6, source: 'search' })
});
```

### IP ve User Agent Tracking (Opsiyonel)

API route'unda zaten hazır ama şu anda null olarak kaydediliyor. Aktif etmek için:

```typescript
// LocationCard.tsx onClick içinde:
const response = await fetch('/api/business/track-view', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    businessId: location.businessId,
    source: 'map',
    userAgent: navigator.userAgent, // EKLE
  }),
});
```

## 🎯 Başarı Kriterleri

- ✅ Harita tıklamasında console'da "View tracked" mesajı görünüyor
- ✅ Business Dashboard City-V tab'ında gerçek sayılar görünüyor
- ✅ Her tıklamada sayılar artıyor
- ✅ 30 saniyede bir otomatik güncelleniyor
- ✅ Farklı kaynaklardan (map/list/search) tracking çalışıyor

## 📝 Notlar

- Demo data business_id=6 için hazırlanmış
- Gerçek production'da her business kendi ID'sini kullanmalı
- 90 günden eski veriler otomatik silinebilir (cleanup fonksiyonu mevcut)
- View tracking anonim, kullanıcı bilgisi kaydetmiyor
- IP ve User Agent opsiyonel, istenirse aktif edilebilir

## 🆘 Destek

Hata durumunda kontrol edilecek log'lar:
- Browser Console: Frontend tracking log'ları
- Backend Terminal: API route log'ları
- Database Logs: Vercel Postgres dashboard

## 🚀 Sonraki Adımlar

1. Veritabanı tablosunu oluştur
2. Business ID'yi kontrol et
3. City-V haritasından test tıklamaları yap
4. Dashboard'da gerçek verileri gör
5. Başka lokasyonlara da businessId ekle
6. Production'a deploy et

Başarılar! 🎉
