# 🧪 Gerçek AI Kamera Sistemi Test Rehberi

## Test Senaryoları

### 1️⃣ Model Yükleme Testi

**Adımlar:**
1. `/business` sayfasını aç
2. Herhangi bir kameraya tıkla
3. Analytics modalında "TensorFlow.js Yükleniyor..." mesajını gör
4. 2-3 saniye içinde "Gerçek AI Aktif" mesajına geç

**Beklenen:**
```
🤖 TensorFlow.js Yükleniyor... → ✅ Gerçek AI Aktif
```

**Console Çıktısı:**
```
🤖 TensorFlow.js COCO-SSD modeli yükleniyor...
✅ Model başarıyla yüklendi!
```

---

### 2️⃣ Kamera Stream Testi

**Adımlar:**
1. Test kamera URL'i: `http://192.168.1.100:81/stream`
2. Dashboard'a kamera ekle
3. Stream görüntüsü gelene kadar bekle

**Beklenen:**
- Stream yükleniyor → Stream gösterildi
- Console: `✅ Kamera görüntüsü yüklendi`
- CORS hatası YOK (proxy kullanılıyor)

**CORS Proxy Kontrolü:**
```javascript
// Browser Network tab
GET /api/camera-proxy?url=http%3A%2F%2F192.168.1.100%3A81%2Fstream
Status: 200 OK
Headers: Access-Control-Allow-Origin: *
```

---

### 3️⃣ İnsan Tespiti Testi

**Senaryo A: Tek Kişi**
- Kamera önünde 1 kişi dursun
- 3 saniye bekle
- Console: `👥 1 kişi tespit edildi`
- UI: Kırmızı nokta görünür (person marker)

**Senaryo B: Çoklu Kişi**
- Kamera önünde 3-5 kişi
- Console: `👥 3 kişi tespit edildi` (veya 4, 5)
- UI: Her kişi için ayrı marker

**Senaryo C: Boş Alan**
- Kamera önünde kimse yok
- Console: `👥 0 kişi tespit edildi`
- UI: Marker yok

**Doğrulama:**
```typescript
// detectedPeople array kontrol
detectedPeople.forEach(person => {
  console.log(`Kişi ${person.id}: (${person.x}, ${person.y}) - Güven: ${person.confidence}`);
});
```

---

### 4️⃣ Giriş/Çıkış Sayımı Testi

**Senaryo: Mağazaya Giriş**
1. t=0s: 0 kişi → `currentPeople: 0`
2. t=3s: 1 kişi girer → `entriesCount: 1, currentPeople: 1`
3. t=6s: 2 kişi daha → `entriesCount: 3, currentPeople: 3`
4. t=9s: 1 kişi çıkar → `exitsCount: 1, currentPeople: 2`

**Beklenen Analytics:**
```json
{
  "entriesCount": 3,
  "exitsCount": 1,
  "currentPeople": 2
}
```

**Hata Senaryosu:**
- Aynı kişi sayısı → Giriş/çıkış değişmez
- Ani artış (5→10) → Toplu giriş sayılır (entriesCount += 5)

---

### 5️⃣ Isı Haritası Testi

**8 Bölge Kontrolü:**

| Bölge | Test Edilerek |
|-------|---------------|
| Giriş | Kapı önünde dur |
| Raf 1-5 | Her rafın önünde 10sn dur |
| Merkez Koridor | Ortadan geç |
| Kasa | Kasa önünde bekle |

**Toggle Butonu:**
- "Isı Haritasını Göster" → Bölgeler görünür
- "Isı Haritasını Gizle" → Bölgeler kaybolur

**Renk Kodları:**
- Kırmızı (density > 75): 4+ kişi dar alanda
- Turuncu (50-75): 2-3 kişi
- Sarı (25-50): 1 kişi
- Yeşil (<25): Boş

**Console Kontrolü:**
```javascript
analytics.heatmapZones.forEach(zone => {
  console.log(`${zone.name}: ${zone.peopleCount} kişi (${zone.density}% yoğunluk)`);
});
```

---

### 6️⃣ Performance Testi

**Metrikler:**
- Model yükleme süresi: <3s
- Frame analiz süresi: <500ms
- Tespit doğruluğu: >85%
- Bellek kullanımı: <50MB/kamera

**Browser DevTools:**
```javascript
// Performance tab
- Scripting: TensorFlow inference
- Rendering: Canvas draw
- Memory: Model + canvas buffers

// Beklenen
Total: ~300-400ms/3s interval
Memory: 25-30MB sabit
```

---

### 7️⃣ Multi-Kamera Testi

**Senaryo:**
1. 3 kamera ekle
2. Her birinde ayrı stream
3. Aynı anda açık

**Beklenen:**
- Her kamera bağımsız AI analiz
- Model 1 kez yüklenir (shared)
- Her kameranın kendi analytics state'i

**Memory Check:**
- 1 kamera: ~30MB
- 3 kamera: ~50MB (model shared, canvas 3x)

---

### 8️⃣ Error Handling Testi

**Senaryo A: CORS Hatası**
- Proxy disabled → Canvas taint hatası
- **Beklenen:** Console warning, simülasyona dön

**Senaryo B: Model Yükleme Hatası**
- İnternet kesildi → Model yüklenemedi
- **Beklenen:** Error mesajı, retry butonu

**Senaryo C: Kamera Bağlantı Hatası**
- Yanlış IP → Stream timeout
- **Beklenen:** "Kamera bağlantısı kurulamadı" mesajı

---

## Test Checklist

### Fonksiyonel Testler
- [ ] Model yükleniyor
- [ ] Stream görüntüleniyor
- [ ] İnsan tespiti çalışıyor
- [ ] Giriş sayımı doğru
- [ ] Çıkış sayımı doğru
- [ ] 8 bölge haritası görünüyor
- [ ] Renk kodları doğru
- [ ] Toggle butonu çalışıyor

### Performance Testler
- [ ] Model yükleme <3s
- [ ] Inference <500ms
- [ ] Memory leak yok
- [ ] CPU usage normal (<30%)

### Edge Cases
- [ ] Boş alan (0 kişi)
- [ ] Aşırı kalabalık (20+ kişi)
- [ ] Hızlı giriş/çıkış
- [ ] Kamera açısı değişimi
- [ ] Düşük ışık koşulları

### Browser Uyumluluk
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Hata Ayıklama

### Console Logları

**Normal Flow:**
```
🤖 TensorFlow.js COCO-SSD modeli yükleniyor...
✅ Model başarıyla yüklendi!
✅ Kamera görüntüsü yüklendi: http://...
🤖 TensorFlow.js COCO-SSD AI aktif - Gerçek insan tanıma çalışıyor
👥 3 kişi tespit edildi
```

**Hata Flow:**
```
❌ Model yükleme hatası: NetworkError
⚠️ Canvas çizim hatası (CORS): SecurityError
⚠️ Kamera bağlantısı kurulamadı: http://...
```

### Network Tab

**Başarılı:**
```
GET /api/camera-proxy?url=...
Status: 200 OK
Type: image/jpeg (multipart)
Size: ~50KB/frame
```

**Başarısız:**
```
GET /stream
Status: net::ERR_CONNECTION_REFUSED
```

---

## Gerçek Ortam Test Senaryosu

### Süpermarket Örneği

**1. Sabah Açılış (08:00-09:00)**
- Beklenen: 0→5 kişi yavaş artış
- Giriş bölgesi yoğun
- Raflar boş

**2. Öğle Yoğunluğu (12:00-13:00)**
- Beklenen: 15-25 kişi
- Tüm bölgeler orta-yüksek yoğunluk
- Kasa bölgesi kırmızı

**3. Akşam Sakin (18:00-19:00)**
- Beklenen: 5-10 kişi
- Merkez koridor yeşil
- Raf 5 (donuk) yoğun

**4. Kapanış (22:00)**
- Beklenen: 25→0 kişi hızlı azalış
- ExitsCount artıyor
- Tüm bölgeler yeşil

---

## Test Sonuç Raporu Şablonu

```markdown
# AI Kamera Test Raporu

**Tarih:** 2024-XX-XX
**Test Eden:** [İsim]
**Ortam:** Production / Development

## Model Performance
- Yükleme süresi: X saniye
- Inference süresi: X ms
- Doğruluk oranı: %XX

## Tespit Doğruluğu
- Tek kişi: ✅/❌ (X/10 başarılı)
- Çoklu kişi: ✅/❌ (X/10 başarılı)
- Boş alan: ✅/❌ (X/10 başarılı)

## Giriş/Çıkış Sayımı
- Giriş doğruluğu: %XX
- Çıkış doğruluğu: %XX
- Kayıp sayım: X adet

## Isı Haritası
- Bölge atama: ✅/❌
- Renk kodlama: ✅/❌
- Toggle: ✅/❌

## Sorunlar
1. [Sorun 1]
2. [Sorun 2]

## Öneriler
1. [Öneri 1]
2. [Öneri 2]
```

---

## Production Monitoring

### Metrikler

```javascript
// analytics dashboard eklemeleri
const metrics = {
  modelLoadTime: 2345, // ms
  averageInferenceTime: 312, // ms
  detectionAccuracy: 0.91, // %91
  totalPeopleDetected: 1245,
  peakConcurrentPeople: 23,
  totalEntries: 789,
  totalExits: 766,
  mostCrowdedZone: 'Kasa',
  averageStayTime: 420 // seconds
};
```

### Alerts

```javascript
// Kritik durumlar
if (occupancyPercentage > 90) {
  alert('🚨 Mağaza kapasitesi %90 aşıldı!');
}

if (analytics.heatmapZones.find(z => z.density > 80)) {
  alert('⚠️ Aşırı yoğun bölge tespit edildi!');
}
```

---

**Hazırlayan:** CityV AI Team  
**Son Güncelleme:** ${new Date().toLocaleDateString('tr-TR')}
