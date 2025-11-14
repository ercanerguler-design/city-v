# 🎯 Günlük Özet Verileri Sistemi - Kullanım Kılavuzu

## 📋 Genel Bakış

Bu sistem, işletmelerin günlük analitiğini otomatik olarak toplar, database'e kaydeder ve business dashboard'da görüntüler. Her gün sonunda (veya manuel olarak çalıştırıldığında) o günün tüm verilerini özetler ve raporlama için hazır hale getirir.

## 🗄️ Database Yapısı

### daily_business_summaries Tablosu

```sql
CREATE TABLE daily_business_summaries (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL,
  summary_date DATE NOT NULL,
  
  -- Temel Metrikler
  total_visitors INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  total_exits INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  
  -- Ortalama ve Maksimum Değerler
  avg_occupancy DECIMAL(5,2) DEFAULT 0,
  max_occupancy INTEGER DEFAULT 0,
  min_occupancy INTEGER DEFAULT 0,
  
  -- Yoğunluk Verileri
  avg_crowd_density DECIMAL(5,2) DEFAULT 0,
  max_crowd_density DECIMAL(5,2) DEFAULT 0,
  
  -- Zaman Bazlı Veriler
  peak_hour INTEGER, -- En yoğun saat (0-23)
  peak_hour_visitors INTEGER DEFAULT 0,
  busiest_period VARCHAR(20), -- morning, afternoon, evening, night
  
  -- Kamera Verileri
  total_detections INTEGER DEFAULT 0,
  active_cameras_count INTEGER DEFAULT 0,
  total_analysis_records INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(business_user_id, summary_date)
);
```

## 🚀 Kurulum Adımları

### 1. Database Tablosunu Oluştur

```powershell
# PostgreSQL'e bağlan ve SQL dosyasını çalıştır
node -e "const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); const sql = fs.readFileSync('database/create-daily-summaries.sql', 'utf8'); pool.query(sql).then(() => console.log('✅ Tablo oluşturuldu')).catch(console.error).finally(() => pool.end());"
```

Veya doğrudan SQL dosyasını çalıştır:
```bash
psql $DATABASE_URL -f database/create-daily-summaries.sql
```

### 2. Örnek Veriyi Test Et

SQL dosyası otomatik olarak son 7 gün için örnek veri oluşturur. Manuel olarak kontrol etmek için:

```sql
SELECT * FROM daily_business_summaries ORDER BY summary_date DESC LIMIT 7;
```

### 3. Business Dashboard'a Kartları Ekle

`app/business/page.tsx` dosyasında DailySummaryCards component'ini import et:

```typescript
import DailySummaryCards from '@/components/Business/Dashboard/DailySummaryCards';

// Dashboard içinde kullan
<DailySummaryCards businessUserId={businessUserId} />
```

## 📊 Veri Toplama (Aggregation)

### Manuel Çalıştırma

```powershell
# Dünün verilerini topla (varsayılan)
node scripts/aggregate-daily-data.js

# Belirli bir tarihin verilerini topla
node scripts/aggregate-daily-data.js 2025-11-13
```

### Otomatik Çalıştırma (Cron Job)

#### Windows Task Scheduler

1. Task Scheduler'ı aç
2. "Create Basic Task" tıkla
3. Name: "CityV Daily Data Aggregation"
4. Trigger: Daily, 00:30 (gece yarısından sonra)
5. Action: Start a program
6. Program: `node`
7. Arguments: `C:\path\to\City-v131125\scripts\aggregate-daily-data.js`
8. Start in: `C:\path\to\City-v131125`

#### Linux/Mac Cron

```bash
# Crontab'ı düzenle
crontab -e

# Her gün 00:30'da çalıştır
30 0 * * * cd /path/to/City-v131125 && node scripts/aggregate-daily-data.js >> /var/log/cityv-aggregation.log 2>&1
```

#### Vercel Cron (Production)

`vercel.json` dosyasına ekle:

```json
{
  "crons": [{
    "path": "/api/cron/aggregate-daily-data",
    "schedule": "30 0 * * *"
  }]
}
```

API endpoint oluştur: `app/api/cron/aggregate-daily-data/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { aggregateDailyData } from '@/scripts/aggregate-daily-data';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Vercel cron secret ile doğrula
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await aggregateDailyData();
    return NextResponse.json({ success: true, message: 'Daily data aggregated' });
  } catch (error) {
    return NextResponse.json({ error: 'Aggregation failed' }, { status: 500 });
  }
}
```

## 🔌 API Kullanımı

### GET - Tek Tarih Özet Verisi

```typescript
// Bugünün verilerini al
const response = await fetch(
  `/api/business/daily-summary?businessUserId=1&date=2025-11-14`
);
const data = await response.json();

// Response:
{
  success: true,
  summary: {
    id: 1,
    businessUserId: 1,
    date: "2025-11-14",
    metrics: {
      totalVisitors: 250,
      totalEntries: 130,
      totalExits: 120,
      currentOccupancy: 10,
      avgOccupancy: 15.5,
      maxOccupancy: 35,
      minOccupancy: 3,
      avgCrowdDensity: 42.5,
      maxCrowdDensity: 78.5
    },
    timeAnalysis: {
      peakHour: 15,
      peakHourVisitors: 38,
      busiestPeriod: "afternoon"
    },
    cameraData: {
      totalDetections: 450,
      activeCamerasCount: 3,
      totalAnalysisRecords: 480
    },
    timestamps: {
      createdAt: "2025-11-14T00:30:00Z",
      updatedAt: "2025-11-14T00:30:00Z"
    }
  }
}
```

### POST - Tarih Aralığı Özet Verisi

```typescript
// Son 7 günün verilerini al
const response = await fetch('/api/business/daily-summary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    businessUserId: 1,
    startDate: '2025-11-07',
    endDate: '2025-11-14'
  })
});
const data = await response.json();

// Response:
{
  success: true,
  summaries: [
    { date: "2025-11-14", totalVisitors: 250, ... },
    { date: "2025-11-13", totalVisitors: 230, ... },
    // ...
  ],
  totalStats: {
    totalVisitorsSum: 1680,
    totalEntriesSum: 890,
    totalExitsSum: 850,
    avgOccupancyAvg: 16.8,
    maxOccupancyPeak: 45,
    avgDensityAvg: 44.2,
    totalDays: 7
  },
  dateRange: {
    start: "2025-11-07",
    end: "2025-11-14"
  }
}
```

## 📱 Dashboard Kullanımı

### DailySummaryCards Component

Business dashboard ana sayfasında otomatik olarak:
- Bugünün verilerini gösterir
- Dünle karşılaştırma yapar (% artış/azalış)
- Her 5 dakikada bir otomatik güncellenir
- Manuel yenileme butonu sunar

**Gösterilen Metrikler:**
- 📊 Toplam Ziyaretçi (bugün vs dün)
- 🚪 Giriş & Çıkış sayıları
- 👥 Ortalama ve maksimum doluluk
- ⏰ En yoğun saat ve dönem
- 📈 Yoğunluk ortalaması ve maksimumu
- 📷 Aktif kamera sayısı ve tespit sayısı

### DateRangeReport Component Güncellemesi

Tarih aralığı raporlarında artık `daily_business_summaries` kullanılabilir:

```typescript
// Önce günlük özetlerden dene, yoksa canlı verilerden al
const summaryResponse = await fetch('/api/business/daily-summary', {
  method: 'POST',
  body: JSON.stringify({ businessUserId, startDate, endDate })
});

if (summaryResponse.ok) {
  // Günlük özetlerden hızlı rapor
  const summaryData = await summaryResponse.json();
  setReportData(summaryData);
} else {
  // Fallback: Canlı verilerden detaylı rapor
  const liveResponse = await fetch(
    `/api/business/report?businessUserId=${businessUserId}&startDate=${startDate}&endDate=${endDate}`
  );
  const liveData = await liveResponse.json();
  setReportData(liveData);
}
```

## 🔄 Veri Akışı

```
┌─────────────────────┐
│  ESP32-CAM Devices  │
│  (AI Detection)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ iot_ai_analysis     │
│ (Real-time Data)    │
└──────────┬──────────┘
           │
           ▼ (Her gün 00:30)
┌─────────────────────┐
│ aggregate-daily-    │
│ data.js Script      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ daily_business_     │
│ summaries Table     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Business Dashboard  │
│ DailySummaryCards   │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Reports (CSV/PDF)   │
│ Historical Analysis │
└─────────────────────┘
```

## 🧪 Test Etme

### 1. Database Tablosunu Kontrol Et

```sql
-- Tablo var mı?
\dt daily_business_summaries

-- Örnek veriler oluştu mu?
SELECT COUNT(*), MIN(summary_date), MAX(summary_date) 
FROM daily_business_summaries;

-- Son kayıtları göster
SELECT * FROM daily_business_summaries ORDER BY summary_date DESC LIMIT 3;
```

### 2. Aggregation Script'i Test Et

```powershell
# Dünün verilerini topla
node scripts/aggregate-daily-data.js

# Console çıktısı:
# 📊 2025-11-13 tarihli günlük verileri topluyorum...
# ✅ Business user 1: 250 ziyaretçi, 480 kayıt
# 📊 Özet:
# ✅ Başarılı: 1
# ❌ Hatalı: 0
# 📅 Tarih: 2025-11-13
```

### 3. API Endpoint'leri Test Et

```powershell
# GET - Bugün
curl "http://localhost:3000/api/business/daily-summary?businessUserId=1&date=2025-11-14"

# POST - Tarih aralığı
curl -X POST http://localhost:3000/api/business/daily-summary `
  -H "Content-Type: application/json" `
  -d '{\"businessUserId\":1,\"startDate\":\"2025-11-07\",\"endDate\":\"2025-11-14\"}'
```

### 4. Dashboard'da Görüntüle

1. Business dashboard'a giriş yap
2. Ana sayfada "Günlük Özet Veriler" kartlarını gör
3. Bugün vs Dün karşılaştırmasını kontrol et
4. "🔄 Yenile" butonuna tıklayarak güncel veriyi çek

## 🐛 Sorun Giderme

### Günlük özet verisi bulunamadı

**Sorun:** API 404 döndürüyor, "Bu tarih için günlük özet verisi bulunamadı"

**Çözüm:**
1. `iot_ai_analysis` tablosunda o tarih için veri var mı kontrol et:
   ```sql
   SELECT COUNT(*) FROM iot_ai_analysis 
   WHERE DATE(created_at) = '2025-11-14';
   ```
2. Aggregation script'i çalıştır:
   ```bash
   node scripts/aggregate-daily-data.js 2025-11-14
   ```

### Script hata veriyor

**Sorun:** "Cannot find module 'pg'"

**Çözüm:**
```powershell
npm install pg
```

**Sorun:** "DATABASE_URL is not defined"

**Çözüm:**
```powershell
# .env.local dosyasında DATABASE_URL var mı kontrol et
$env:DATABASE_URL = "postgresql://user:pass@host/database"
node scripts/aggregate-daily-data.js
```

### Dashboard kartları görünmüyor

**Sorun:** Component render olmuyor

**Çözüm:**
1. `app/business/page.tsx` içinde import edilmiş mi:
   ```typescript
   import DailySummaryCards from '@/components/Business/Dashboard/DailySummaryCards';
   ```
2. businessUserId doğru prop olarak geçiliyor mu:
   ```typescript
   <DailySummaryCards businessUserId={businessUser.id} />
   ```
3. Browser console'da hata var mı kontrol et (F12)

### Veriler güncellemiyor

**Sorun:** Kartlar eski veriyi gösteriyor

**Çözüm:**
1. "🔄 Yenile" butonuna tıkla
2. Sayfayı yenile (F5)
3. Aggregation script'in en son ne zaman çalıştığını kontrol et
4. API endpoint'e manuel istek at ve response'u kontrol et

## 📈 İleri Seviye Kullanım

### Haftalık/Aylık Trendler

```sql
-- Son 30 günün trendi
SELECT 
  summary_date,
  total_visitors,
  LAG(total_visitors) OVER (ORDER BY summary_date) as prev_day_visitors,
  total_visitors - LAG(total_visitors) OVER (ORDER BY summary_date) as daily_change
FROM daily_business_summaries
WHERE business_user_id = 1
  AND summary_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY summary_date DESC;

-- Haftanın günlerine göre ortalama
SELECT 
  TO_CHAR(summary_date, 'Day') as day_name,
  ROUND(AVG(total_visitors), 0) as avg_visitors,
  ROUND(AVG(avg_occupancy), 1) as avg_occupancy
FROM daily_business_summaries
WHERE business_user_id = 1
  AND summary_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY TO_CHAR(summary_date, 'Day'), EXTRACT(DOW FROM summary_date)
ORDER BY EXTRACT(DOW FROM summary_date);
```

### Export İçin CSV Formatı

```typescript
function exportDailySummariesToCSV(summaries: any[]) {
  const headers = [
    'Tarih', 'Toplam Ziyaretçi', 'Giriş', 'Çıkış', 
    'Ort. Doluluk', 'Maks. Doluluk', 'En Yoğun Saat', 
    'En Yoğun Dönem', 'Ort. Yoğunluk %', 'Aktif Kamera'
  ];
  
  const rows = summaries.map(s => [
    s.date,
    s.totalVisitors,
    s.totalEntries,
    s.totalExits,
    s.avgOccupancy.toFixed(1),
    s.maxOccupancy,
    `${s.peakHour}:00`,
    s.busiestPeriod,
    s.avgCrowdDensity.toFixed(1),
    s.activeCamerasCount
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  return csv;
}
```

## ✅ Başarı Kriterleri

Sistem doğru çalışıyorsa:
- ✅ Her gün 00:30'da otomatik aggregation çalışıyor
- ✅ `daily_business_summaries` tablosunda her gün yeni kayıt oluşuyor
- ✅ Business dashboard'da günlük kartlar görünüyor
- ✅ Bugün vs Dün karşılaştırması doğru
- ✅ API endpoint'leri 200 OK dönüyor
- ✅ Raporlarda günlük özetler kullanılabiliyor
- ✅ CSV export çalışıyor

## 📝 Notlar

- Günlük özetler **gece yarısından sonra** (00:30) oluşturulur
- Her business user için **günde 1 kayıt** (UNIQUE constraint)
- Eski veriler üzerine yazılmaz (ON CONFLICT DO UPDATE)
- **Manual çalıştırma** her zaman mümkün (geçmiş tarihler için)
- **Real-time data** için `iot_ai_analysis` kullanılmaya devam edilir
- **Historical data** için `daily_business_summaries` kullanılır (daha hızlı)

## 🎉 Tamamlandı!

Günlük özet verileri sistemi başarıyla kuruldu ve kullanıma hazır! 🚀

Sorular için: CityV Development Team
