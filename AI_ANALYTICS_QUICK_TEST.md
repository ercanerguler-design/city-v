# 🚀 AI Analytics - Hızlı Test Rehberi

## ⚡ 3 Dakikada Test Et!

### 1️⃣ Server'ı Başlat (30 saniye)
```powershell
cd "c:\Users\ercan\OneDrive\Masaüstü\Proje Cityv\City-v131125"
npm run dev
```

Bekle: `✓ Ready in 10s` görene kadar

---

### 2️⃣ Dashboard'a Git (10 saniye)
1. Tarayıcıda aç: `http://localhost:3000/business/dashboard`
2. Eğer giriş gerekliyse:
   - Email: SCE INNOVATION hesabı
   - Token: localStorage'da `business_token`

---

### 3️⃣ AI Analytics'i Aç (5 saniye)
Dashboard'da:
- **Sol menüden** veya **sayfada** "AI Sistemleri" bölümünü bul
- Otomatik açılır

---

### 4️⃣ Görsel Kontroller (2 dakika)

#### ✅ HEADER KONTROLÜ:
- [ ] **Rotating Zap Icon**: Dönüyor mu? (20s animasyon)
- [ ] **CANLI Badge**: Yeşil yanıp sönüyor mu?
- [ ] **Son Güncelleme**: Saat değişiyor mu? (5s)

#### ✅ TAB KONTROLÜ:
- [ ] **5 Tab Var**: Overview, Crowd, Heatmap, AI, Seating
- [ ] **Hover Efekti**: Mouse üzerine gelince büyüyor mu?
- [ ] **Gradient Background**: Renkler aktif tab'da parlak mı?

#### ✅ HEATMAP TAB (ANA TEST):
1. **"Isı Haritası"** tab'ına tıkla
2. **Kontrol Et**:
   - [ ] Canvas görünüyor mu? (1200x600px)
   - [ ] Grid çizgileri var mı?
   - [ ] Renkli gradientler görünüyor mu?
   - [ ] Hotspot markers (kırmızı pulse eden noktalar)?
   
3. **Stats Kartları** (4 tane):
   - [ ] Ortalama Yoğunluk (Mavi)
   - [ ] Sıcak Bölge (Kırmızı)
   - [ ] Yoğun Saat (Mor)
   - [ ] Veri Noktası (Yeşil)
   
4. **En Yoğun Bölgeler**:
   - [ ] 5 kart yan yana
   - [ ] Pulse animasyonlu noktalar
   - [ ] Hover'da scale efekti
   
5. **Legend** (Alt kısım):
   - [ ] 4 renk gradientli kutu
   - [ ] 0-30%, 30-50%, 50-75%, 75-100% yazıları

#### ✅ OVERVIEW TAB:
1. **"Genel Bakış"** tab'ına tıkla
2. **Kontrol Et**:
   - [ ] RealTimeStatus kartı (sol üst)
   - [ ] Anlık yoğunluk % görünüyor
   - [ ] Progress bar dolu
   - [ ] LiveCrowdCard (sağ)
   - [ ] CrowdTrendChart (tam genişlik)
   - [ ] Historical Report + AI Detection Feed (alt)

---

### 5️⃣ Real-time Test (1 dakika)

#### Test 1: Otomatik Güncelleme
1. Heatmap tab'ında kal
2. Console'u aç (F12)
3. **10 saniye bekle**
4. Console'da görmeli: `🔥 Heatmap güncelleniyor...`
5. "Son Güncelleme" saati değişti mi?

#### Test 2: Live Pulse
1. Header'daki **yeşil noktaya** bak
2. Yanıp sönüyor mu? (2s cycle)
3. "CANLI" yazısı fade in/out mu?

#### Test 3: Hotspot Pulse
1. Canvas üzerindeki kırmızı noktalara bak
2. Boyutları değişiyor mu? (pulse)
3. Glow efekti var mı?

---

## 🔍 Console Kontrolleri

### Beklenilen Log'lar:
```javascript
// Her 5 saniyede
⚡ AI Analytics güncelleniyor... 14:23:45

// Her 10 saniyede
🔥 Heatmap güncelleniyor...
📊 Fetching heatmap data for business: 20
📊 Analytics data: { success: true, ... }

// Her fetch'te
✅ Analytics başarıyla hesaplandı: { topLocations: 5, ... }
```

### ❌ HATA Olursa:
```javascript
❌ Failed to fetch heatmap: Error...
❌ Analytics API error: ...
```

**Çözüm**: 
1. Database bağlantısını kontrol et
2. `business_cameras` tablosunda veri var mı?
3. `iot_ai_analysis` tablosunda veri var mı?

---

## 📊 Database Hızlı Test

### Veri Var mı Kontrol:
```sql
-- Toplam analiz sayısı
SELECT COUNT(*) FROM iot_ai_analysis;
-- Beklenilen: > 0

-- Bugünkü veriler
SELECT COUNT(*) 
FROM iot_ai_analysis 
WHERE DATE(created_at) = CURRENT_DATE;
-- Beklenilen: > 0

-- Business kameraları
SELECT COUNT(*) 
FROM business_cameras 
WHERE business_user_id = 20;
-- Beklenilen: > 0
```

---

## 🎨 Görsel Başarım Kriterleri

### ✅ MÜKEMMEL Görsel:
- Header gradient smooth ve parlak
- Tab'lar hover'da büyüyor
- Canvas grid net görünüyor
- Renkler canlı (yeşil/sarı/turuncu/kırmızı)
- Pulse animasyonları akıcı
- Stats kartları hover'da scale oluyor
- Hotspot markers canvas üzerinde

### ⚠️ Sorun İşaretleri:
- Canvas boş (siyah)
- "Henüz ısı haritası verisi yok" yazısı
- Stats kartlarında 0 değerleri
- Hotspots listesi boş
- Console'da fetch error

---

## 🔧 Hızlı Fix'ler

### Canvas Boş:
```javascript
// Browser console'da:
fetch('http://localhost:3000/api/business/analytics?businessId=20')
  .then(r => r.json())
  .then(d => console.log('API Response:', d));

// Beklenilen: hourlyData, topLocations, analytics objesi
```

### Veri 0 Görünüyor:
```sql
-- Demo veri ekle
INSERT INTO iot_ai_analysis (camera_id, person_count, created_at)
SELECT 
  id, 
  FLOOR(RANDOM() * 20 + 5)::INTEGER,
  NOW() - (FLOOR(RANDOM() * 86400) || ' seconds')::INTERVAL
FROM business_cameras
WHERE business_user_id = 20
LIMIT 100;
```

### Real-time Çalışmıyor:
1. Console'da interval log'ları var mı?
2. useEffect cleanup çalışıyor mu?
3. Component unmount/remount oluyor mu?

---

## 📸 Test Screenshot Checklist

### Alınması Gereken Ekran Görüntüleri:
1. ✅ **Header**: Rotating icon + live badge
2. ✅ **Heatmap Canvas**: Renkli ısı haritası
3. ✅ **Stats Grid**: 4 kart yan yana
4. ✅ **Hotspots**: 5 kart pulse ile
5. ✅ **Overview Tab**: RealTimeStatus + diğer components
6. ✅ **Console Logs**: Real-time updates

---

## 🎯 Başarı Kriterleri

### ✅ TÜM BUNLAR OLDUĞUNDA BAŞARILI:
- [x] Server çalışıyor (port 3000)
- [x] Dashboard açılıyor
- [x] 5 tab görünüyor
- [x] Heatmap canvas render oluyor
- [x] Renkli gradientler var
- [x] Hotspot markers pulse ediyor
- [x] Stats kartları doğru değerler gösteriyor
- [x] Console'da 5-10s interval log'ları
- [x] "CANLI" badge yanıp sönüyor
- [x] Hover efektleri çalışıyor

---

## ⏱️ Toplam Test Süresi: ~3 dakika

**1. Server Start**: 30s  
**2. Navigate**: 10s  
**3. Visual Check**: 2min  
**4. Real-time Test**: 1min  

---

## 🚨 Acil Durum

### Server Çöktüyse:
```powershell
# Kill process
Get-Process node | Stop-Process -Force

# Restart
cd "c:\Users\ercan\OneDrive\Masaüstü\Proje Cityv\City-v131125"
npm run dev
```

### Database Bağlantı Hatası:
```javascript
// .env.local kontrol
DATABASE_URL=postgres://...
POSTGRES_URL=postgres://...
```

### Port Meşgulse:
```powershell
# 3000 portunu temizle
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Veya farklı port
$env:PORT=3001; npm run dev
```

---

## 📞 Hata Raporlama

### Log Format:
```
🐛 HATA RAPORU
- Zaman: 14:30:45
- Sayfa: /business/dashboard
- Tab: Heatmap
- Hata: Canvas boş görünüyor
- Console: [error messages]
- Database: [query results]
- Screenshot: [link]
```

---

**Test Başarılı! 🎉**

Tüm checkboxlar ✅ ise:
> **AI Analytics sistemi profesyonel şekilde çalışıyor!**

---

**Hazırlayan**: AI Assistant  
**Tarih**: ${new Date().toLocaleString('tr-TR')}  
**Versiyon**: Quick Test v1.0
