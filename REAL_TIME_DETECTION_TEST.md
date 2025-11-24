# 🧪 REAL-TIME DETECTION - QUICK TEST GUIDE

## 🚀 Hızlı Test (5 Dakika)

### 1. Development Server Başlat
```powershell
npm run dev
```
Beklenen: `http://localhost:3000` açılır

---

### 2. Business Dashboard'a Gir
```
1. Chrome'u aç
2. http://localhost:3000/business
3. Giriş yap (business hesabı)
4. Dashboard yüklenir
```

---

### 3. AI Detection Tab'ını Aç
```
1. Üst menüde "🤖 AI Detection" tab'ına tıkla
2. F12 → Console'u aç
3. Beklenen log:
   "🤖 AI Detection tab aktif - 5s refresh başlatıldı"
```

---

### 4. Real-Time Polling Test
```
✅ Console'da her 5 saniyede bir log göreceksin:
   "🤖 TensorFlow detections loaded: {data}"

✅ Yeşil banner'da "Güncelleniyor..." yazısı yanıp sönecek

✅ Son güncelleme saati her 5 saniyede değişecek
```

---

### 5. Visual Test
```
✅ CANLI banner görünüyor (yeşil gradient)
✅ Beyaz pulsing nokta animasyonlu
✅ 4 summary card (mor, mavi, turuncu, kırmızı)
✅ Son Deteksiyonlar bölümü - CANLI başlık
✅ Kırmızı pulsing "LIVE" indicator
```

---

### 6. Detection Card Test
```
✅ Recent detections listesi görünüyor
✅ Timestamp: "23s önce" veya "5dk önce" formatında
✅ < 30 saniye: Yeşil gradient + "YENİ" badge
✅ > 30 saniye: Turuncu gradient
✅ Object type badges: 🔍 person (8), car (2)
✅ Stats: 👥 8 kişi, 🎯 92% güven
```

---

### 7. Animation Test
```
✅ Detection cards fade-in animasyonlu
✅ Cards sırayla görünür (staggered)
✅ "YENİ" badge pulse efekti
✅ Live indicator sürekli yanıp sönüyor
```

---

### 8. Tab Switch Test
```
1. "📈 Analizler" tab'ına geç
2. 10 saniye bekle
3. "🤖 AI Detection" tab'ına geri dön
4. Beklenen: Console'da yeni log
   "🤖 AI Detection tab aktif - 5s refresh başlatıldı"
```

---

### 9. Performance Test
```
1. DevTools → Performance tab
2. Record'a bas
3. 30 saniye bekle
4. Stop
5. Kontrol: FPS 60'ta mı? (animations smooth)
```

---

### 10. Database Data Check
```powershell
# Test data var mı kontrol et
node check-recent-iot.js

# Beklenen:
# ✅ Son 24 saatin verisi
# ✅ device_id var
# ✅ detection_objects JSONB parse ediliyor
```

---

## 🐛 Sorun Çözümleri

### Detection Görünmüyor
```powershell
# Veritabanı kontrol
node check-iot-data.js

# Camera mapping kontrol
node check-business-cameras.js

# Console'da error var mı bak
```

### 5 Saniye Refresh Çalışmıyor
```bash
✅ Check: AI Detection tab'ı aktif mi?
✅ Check: Console'da interval log var mı?
✅ Check: Browser console açık mı?

# Fix: Tab'ı kapat-aç
```

### "YENİ" Badge Görünmüyor
```bash
# Timestamp'leri kontrol et
# ESP32'den yeni data gönder
# < 30 saniye old detection olmalı
```

---

## 📊 Success Criteria

### ✅ Test Passed If:
- [ ] Console'da 5 saniyede bir log
- [ ] CANLI banner görünüyor + pulsing
- [ ] "Güncelleniyor..." loading indicator
- [ ] Timestamp "X saniye/dakika önce" formatında
- [ ] YENİ badge < 30 saniye detections'da
- [ ] Yeşil gradient recent detections'da
- [ ] Object type badges parse ediliyor
- [ ] Tab switch çalışıyor
- [ ] Animations smooth (60 FPS)
- [ ] Mobile responsive

---

## 🚀 Production Test (ESP32 ile)

### ESP32-CAM Bağlantı:
```bash
1. ESP32-CAM'i çalıştır
2. WiFi bağlan
3. Detection gönder → /api/iot/crowd-analysis
4. 5 saniye içinde dashboard'da görünmeli
```

### Expected Flow:
```
ESP32 POST → Database INSERT → 5s polling → UI Update
```

### Validation:
```powershell
# Son detection'ı kontrol et
node check-recent-iot.js

# Dashboard'da göründü mü?
# YENİ badge var mı?
# Timestamp doğru mu?
```

---

## 🎉 Test Complete!

Tüm testler geçtiyse → **SİSTEM HAZIR** ✅

Next: Production deployment (Vercel)

---

**Test Duration**: ~5 minutes
**Last Updated**: 2025-01-13
**Status**: ✅ READY FOR CUSTOMER
