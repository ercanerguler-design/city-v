# 🚀 AI Kamera Sistemi - Hızlı Test Rehberi

## LANSMAN ÖNCESİ 5 DAKİKA TEST

### 1️⃣ Kamera Stream Testi (30 saniye)

```bash
# ESP32 IP'sini tarayıcıda aç
http://192.168.1.100/stream
```

**Başarılı:** Kamera görüntüsü real-time akıyor
**Hata:** Görüntü yok → ESP32'yi reset edin veya IP/port kontrol edin

---

### 2️⃣ Kalibrasyon Çizimi (1 dakika)

**Business Dashboard → Kameralar → Kalibrasyon**

1. Modal açılınca **stream görünmeli** (ilk test başarılıysa)
2. **İlk tıklama**: Yeşil nokta (giriş)
3. **İkinci tıklama**: Kırmızı nokta (çıkış)
4. **Kaydet** butonuna tıkla
5. **Console log kontrol**: `✅ Kalibrasyon kaydedildi`

**Veritabanı Kontrol:**
```javascript
// Browser console'da
fetch('/api/business/cameras/1/calibration')
  .then(r => r.json())
  .then(console.log);
// Beklenen: { success: true, calibrationLine: {...} }
```

---

### 3️⃣ Bölge Çizimi (1 dakika)

**Business Dashboard → Kameralar → Bölge Çiz**

1. **Bölge tipi seç**: Oturma Alanı (🪑 Seating)
2. **İsim gir**: "Masa 1"
3. **Canvas'ta 4 nokta tıkla** (dikdörtgen)
4. **Polygon Tamamla** butonuna tıkla
5. **Kaydet**

**Console log:** `✅ Bölge kaydedildi`

**Veritabanı Kontrol:**
```javascript
fetch('/api/business/cameras/1/zones')
  .then(r => r.json())
  .then(data => console.log(data.zones.length)); // > 0 olmalı
```

---

### 4️⃣ AI Detection Testi (1 dakika)

**Business Dashboard → AI Kamera → Live Detection**

1. Component mount olunca **loading** görünmeli (3-5 saniye)
2. Loading bittikten sonra:
   - **FPS sayacı** görünmeli (sağ üst)
   - **Tespit sayısı** görünmeli
3. **Kişi geçtiğinde**:
   - Yeşil bounding box çıkmalı
   - "👤 Kişi 87%" gibi label görünmeli
4. **Nesne varsa** (sandalye, masa):
   - Mavi bounding box çıkmalı
   - "🪑 Sandalye 92%" gibi label görünmeli

**Console log:** `✅ AI Detection stream başladı`

**Model yükleme kontrolü:**
```javascript
// Browser console
tf.ready().then(() => console.log('✅ TensorFlow.js hazır'));
```

---

### 5️⃣ Heat Map Testi (1 dakika)

**Business Dashboard → AI Kamera → Heat Map**

1. **Önceden zone çizilmiş olmalı** (Test 3)
2. Component açılınca:
   - Stream üzerinde zone boundary görünmeli (kesikli çizgi)
   - Kişi geçtiğinde **heat point** oluşmalı (yeşil/sarı/kırmızı gradient)
3. **Zone occupancy** görünmeli:
   - Zone merkezi label: "Masa 1"
   - Yüzde değeri: "35%" (yeşil renk)

**Console log:** `✅ Heat map stream başladı`

**Heat point kontrolü:**
```javascript
// Heat point sayısını console'da görmek için
// HeatMapOverlay component'inde state'i izleyin
```

---

## 🐛 Hata Çözümleri

### ❌ "Kamera Bağlantısı Yok"
**Neden:** ESP32 stream URL'i yanlış
**Çözüm:** 
```javascript
// .env.local veya component'te
const streamUrl = `http://${camera.ip_address}:${camera.port}/stream`;
// Örnek: http://192.168.1.100/stream
```

### ❌ "AI Model yüklenemedi"
**Neden:** TensorFlow.js paketi eksik
**Çözüm:**
```bash
npm install --legacy-peer-deps @tensorflow/tfjs @tensorflow-models/coco-ssd
```

### ❌ "Column does not exist"
**Neden:** Database kolonları eksik
**Çözüm:**
```bash
node database/add-ai-columns.js
```

### ❌ "params.cameraId" hatası
**Neden:** Next.js 15 async params
**Çözüm:** API route'larda şu pattern kullanılmalı:
```typescript
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ cameraId: string }> }
) {
  const params = await context.params;
  const cameraId = params.cameraId;
  // ...
}
```

---

## ✅ Başarı Kriterleri

Aşağıdakilerin HEPSI çalışıyorsa sistem %100 hazır:

- [ ] ESP32 stream tarayıcıda görünüyor
- [ ] Kalibrasyon modal'da stream akıyor
- [ ] Çizgi çizimi çalışıyor (yeşil+kırmızı nokta)
- [ ] Zone polygon çizimi çalışıyor
- [ ] AI detection kişileri tespit ediyor (yeşil box)
- [ ] AI detection nesneleri tespit ediyor (mavi box)
- [ ] Heat map gradient görünüyor
- [ ] Zone occupancy % hesaplanıyor
- [ ] Database'e kayıt yapılıyor (calibration_line, zones)

---

## 🚀 Lansman Sırası

1. **ESP32'yi başlat** → Stream URL'i test et
2. **Database kontrol** → `business_cameras` tablosunda AI kolonları var mı?
3. **Business Dashboard'u aç** → Kamera ekle
4. **Kalibrasyon yap** → Çizgi çiz ve kaydet
5. **Zone çiz** → En az 2-3 bölge oluştur (masa, kasa, giriş)
6. **AI Detection'ı aç** → Model yüklensin, detectionlar görünsün
7. **Heat Map'i aç** → Zone occupancy takip et

**Tüm adımlar 5-7 dakikada tamamlanmalı!**

---

## 📊 Performance Benchmarks

| Özellik | Beklenen Değer | Test Sonucu |
|---------|----------------|-------------|
| Stream FPS | 15-30 | ✅ __ FPS |
| AI Detection FPS | 5-10 | ✅ __ FPS |
| Model Load Time | < 5 saniye | ✅ __ saniye |
| Detection Latency | < 200ms | ✅ __ ms |
| Database Write | < 100ms | ✅ __ ms |
| Heat Map Render | 60 FPS | ✅ 60 FPS |

---

## 🎯 Son Kontrol Listesi

```bash
# 1. Dependencies
npm list @tensorflow/tfjs @tensorflow-models/coco-ssd

# 2. Database
node database/add-ai-columns.js

# 3. Server
npm run dev

# 4. ESP32 Stream
curl http://192.168.1.100/stream -I

# 5. API Test
curl http://localhost:3000/api/business/cameras/1/calibration

# 6. Build Test (opsiyonel)
npm run build
```

**Hepsi ✅ ise LANSMANA HAZIR!** 🚀🔥

---

**Lansman Saati:** Bugün gece 🌙
**Hedef:** %100 doğruluk, sıfır hata
**Durum:** ✅ HAZIR
