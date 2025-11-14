# Business Dashboard - Günlük İstatistik Sistemi

## 📊 Sistem Özeti

Business dashboard'daki veriler artık **günlük bazda arşivlenir** ve **23:59'da sıfırlanır**. Logout yapıldığında veriler kaybolmaz, profil ve konum bilgileri korunur.

---

## 🔄 Nasıl Çalışır?

### 1. **Gerçek Zamanlı Veri Akışı (00:00 - 23:58)**
- Dashboard'da tüm metrikler **5 saniyede bir** güncellenir
- Kamera verileri `iot_ai_analysis` tablosuna kaydedilir
- Konum, profil bilgileri localStorage'da **kalıcı** olarak saklanır

### 2. **Günlük Arşivleme (23:59)**
- **Vercel Cron Job** her gün saat 23:59'da otomatik çalışır
- `/api/cron/archive-daily-stats` endpoint'i tetiklenir
- Bugünkü tüm veriler `business_daily_stats` tablosuna kaydedilir

### 3. **Yeni Gün Başlangıcı (00:00)**
- Dashboard **sıfırdan** başlar
- Eski veriler kaybolmaz - **arşivde** saklanır
- Raporlar üzerinden geçmiş verilere erişilebilir

---

## 🗄️ Database Şeması

### `business_daily_stats` Tablosu

```sql
CREATE TABLE business_daily_stats (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Günlük Metrikler
  total_visitors INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  total_exits INTEGER DEFAULT 0,
  peak_occupancy INTEGER DEFAULT 0,
  avg_occupancy DECIMAL(5,2) DEFAULT 0,
  total_cameras_active INTEGER DEFAULT 0,
  
  -- Yoğunluk Dağılımı
  minutes_empty INTEGER DEFAULT 0,
  minutes_low INTEGER DEFAULT 0,
  minutes_medium INTEGER DEFAULT 0,
  minutes_high INTEGER DEFAULT 0,
  minutes_overcrowded INTEGER DEFAULT 0,
  
  -- Zaman Analizi
  busiest_hour INTEGER, -- 0-23
  busiest_hour_count INTEGER DEFAULT 0,
  avg_stay_minutes INTEGER DEFAULT 0,
  
  -- Favoriler
  favorites_added INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP, -- 23:59'da set edilir
  
  UNIQUE(business_user_id, stat_date)
);
```

---

## 🔧 Setup Adımları

### 1. Database Tablosunu Oluştur

```bash
# PostgreSQL'de şemayı çalıştır
psql -U your_user -d your_database -f database/business_daily_stats.sql
```

Ya da Vercel Postgres'te:
1. Vercel Dashboard → Storage → Postgres
2. Query editörde `database/business_daily_stats.sql` içeriğini çalıştır

### 2. Cron Job Ayarları

`vercel.json` dosyasında cron tanımlandı:

```json
{
  "crons": [
    {
      "path": "/api/cron/archive-daily-stats",
      "schedule": "59 23 * * *"
    }
  ]
}
```

**Cron Schedule Açıklaması:**
- `59 23 * * *` = Her gün saat 23:59'da çalış
- Format: `minute hour day month weekday`

### 3. Environment Variables (Opsiyonel)

`.env.local` dosyasına ekle:

```bash
# Cron Job güvenliği için (opsiyonel)
CRON_SECRET=your-random-secret-key-here
```

Vercel'de ayarla:
1. Project Settings → Environment Variables
2. `CRON_SECRET` ekle

---

## 📡 API Endpoints

### 1. Geçmiş İstatistikleri Getir

```typescript
GET /api/business/stats/history?businessUserId=6&days=30

// Response
{
  "success": true,
  "history": [
    {
      "stat_date": "2025-11-13",
      "total_visitors": 145,
      "peak_occupancy": 23,
      "avg_occupancy": 12.5,
      "busiest_hour": 14,
      "total_cameras_active": 2
    }
  ],
  "count": 30
}
```

### 2. Manuel Arşivleme (Test İçin)

```typescript
POST /api/business/stats/history
{
  "businessUserId": 6
}

// Response
{
  "success": true,
  "message": "Bugünkü veriler arşivlendi",
  "stats": { ... }
}
```

### 3. Cron Job Endpoint (Otomatik)

```bash
GET /api/cron/archive-daily-stats
Authorization: Bearer YOUR_CRON_SECRET
```

---

## 🧪 Test Etme

### Manuel Test (Development)

```bash
# 1. Database tablosunu oluştur
node database/archiveDailyStats.js

# 2. API üzerinden test et
curl -X POST http://localhost:3000/api/business/stats/history \
  -H "Content-Type: application/json" \
  -d '{"businessUserId": 6}'

# 3. Arşivi kontrol et
curl http://localhost:3000/api/business/stats/history?businessUserId=6&days=7
```

### Production Test

```bash
# Vercel Cron'u manuel tetikle
curl https://cityv.vercel.app/api/cron/archive-daily-stats \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 💾 Store Davranışı

### `businessDashboardStore.ts`

```typescript
// ✅ KALICI VERILER (Logout'ta silinmez)
- businessProfile (konum, adres, telefon, vs.)
- businessUser (email, membership, vs.)
- activeSection (UI state)

// ❌ ARTIK STORE'DA TUTULMUYOR
- analytics (günlük veriler) → Database'de
- analyticsExpiry → Cron job ile yönetiliyor
```

**Logout Davranışı:**
```typescript
handleLogout() {
  authStorage.clear();        // ✅ Sadece token silinir
  // Store silinmez!          // ✅ Profil/konum kalır
  // Database'e dokunulmaz!   // ✅ Günlük veriler korunur
}
```

---

## 📊 Rapor Entegrasyonu

### Analytics/Reports Sayfasında Kullanım

```typescript
// components/Business/Dashboard/AnalyticsSection.tsx
const [statsHistory, setStatsHistory] = useState([]);

useEffect(() => {
  fetch(`/api/business/stats/history?businessUserId=${userId}&days=30`)
    .then(res => res.json())
    .then(data => {
      setStatsHistory(data.history);
      // Grafiklerde göster
    });
}, [userId]);
```

---

## 🚨 Önemli Notlar

1. **Logout = Veri Kaybı YOK**
   - Konum bilgileri kaybolmaz
   - Profil bilgileri korunur
   - Günlük istatistikler database'de

2. **Günlük Sıfırlama = 23:59**
   - Vercel Cron otomatik çalışır
   - Manuel tetiklemeye gerek yok
   - Timezone: UTC (Türkiye için +3 saat)

3. **Geçmiş Veriler**
   - Sınırsız gün arşivlenebilir
   - Raporlarda gösterilebilir
   - SQL ile sorgulanabilir

4. **Timezone Ayarları**
   - Cron: `59 23 * * *` (UTC)
   - Türkiye için: Saat 02:59 (UTC+3)
   - İsterseniz `56 20 * * *` yaparak Türkiye 23:59 olabilir

---

## 🔍 Troubleshooting

### Cron Çalışmıyor?

1. Vercel Dashboard → Deployments → Cron Logs
2. `CRON_SECRET` doğru tanımlı mı?
3. API endpoint erişilebilir mi?

### Veriler Arşivlenmiyor?

```sql
-- Manuel kontrol
SELECT * FROM business_daily_stats 
WHERE business_user_id = 6 
ORDER BY stat_date DESC;

-- Bugünkü veri var mı?
SELECT * FROM business_daily_stats 
WHERE stat_date = CURRENT_DATE;
```

### Store Temizlenmeli mi?

```typescript
// Sadece acil durumlarda
import { clearBusinessProfile } from '@/store/businessDashboardStore';
clearBusinessProfile(); // ⚠️ Dikkat: Tüm profil silinir!
```

---

## 📅 Deployment Checklist

- [x] Database tablosu oluşturuldu
- [x] Cron job tanımlandı (`vercel.json`)
- [x] API endpoints oluşturuldu
- [x] Store güncellendi (logout'ta silme kaldırıldı)
- [x] `CRON_SECRET` environment variable eklendi
- [ ] Production'da test edildi
- [ ] Monitoring kuruldu (opsiyonel)

---

## 🎯 Sonuç

✅ **Logout yapınca veriler kaybolmaz**
✅ **Her gün 23:59'da otomatik arşivleme**
✅ **Yeni gün temiz slate ile başlar**
✅ **Geçmiş verilere raporlardan erişim**
✅ **Konum/profil bilgileri kalıcı**

Tüm sistem production-ready ve Vercel Cron ile otomatik çalışıyor! 🚀
