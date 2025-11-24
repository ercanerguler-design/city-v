# 🔧 ESP32 IoT Veri Akışı Düzeltme Rehberi

## 🎯 Çözülen Sorunlar

### 1. ❌ Sidebar'da Canlı Veri Görünmüyordu
**Sebep:** `business_cameras` tablosunda `device_id` kolonu yoktu, LiveCrowdSidebar API eşleştirme yapamıyordu

**Çözüm:**
- `/api/business/live-iot-data` → `camera_id (bc.id)` kullanarak eşleştirme
- `iot_crowd_analysis.device_id` (VARCHAR) → `CAST AS INTEGER` ile `bc.id` eşleşmesi

### 2. ❌ ESP32 Web Arayüzü Açıkken Veri Göndermiyordu
**Sebep:** ESP32'nin `CAMERA_ID` değişkeni boş veya yanlış formatta JSON oluşturuyordu

**Çözüm:**
- ESP32 firmware'de güvenli JSON payload oluşturma
- `camera_id` varsa ekle, yoksa IP adresi ile eşleşme
- API tarafında `camera_id → device_id` otomatik dönüşüm

---

## 📋 Gerekli Adımlar

### 1️⃣ ESP32 Firmware Güncelleme (ZORUNLU)

#### Arduino IDE'de:
```cpp
1. esp32-cam-cityv.ino dosyasını Arduino IDE'de açın
2. Tools → Board → ESP32 Arduino → AI-Thinker ESP32-CAM
3. Tools → Port → COM portu seçin
4. Upload butonuna basın
5. Serial Monitor'ü açın (115200 baud)
```

#### Yükleme sonrası kontroller:
```
✅ WiFi bağlandı mı?
✅ Camera ID set edildi mi? (Web panel: http://ESP32_IP/)
✅ Serial'de "📤 ONLINE: Veri gönderildi" görünüyor mu?
```

---

### 2️⃣ Business Kamera Kayıt Kontrolü

Vercel Dashboard → Postgres → SQL Editor:

```sql
-- 1. Business kameralarını kontrol et
SELECT 
  id, 
  business_user_id, 
  camera_name, 
  ip_address, 
  is_active,
  ai_enabled
FROM business_cameras
WHERE is_active = true;

-- 2. IoT analiz verilerini kontrol et (son 10 dakika)
SELECT 
  device_id,
  people_count,
  crowd_density,
  analysis_timestamp
FROM iot_crowd_analysis
WHERE analysis_timestamp >= NOW() - INTERVAL '10 minutes'
ORDER BY analysis_timestamp DESC
LIMIT 10;
```

**Beklenen Sonuç:**
- `business_cameras` tablosunda kayıt var
- `iot_crowd_analysis` tablosunda son 10 dakikada kayıt var
- `device_id` = camera'nın `id`'si (örnek: "1", "2", "3")

---

### 3️⃣ ESP32 Camera ID Ayarlama

#### Web Panel Üzerinden (Önerilen):
```
1. ESP32 IP adresine tarayıcıdan girin: http://192.168.1.xxx
2. Camera ID inputuna business_cameras.id değerini girin
   Örnek: Business kameranız id=5 ise → "5" yazın
3. Save Settings butonuna basın
4. ESP32 otomatik restart olacak
```

#### Serial Monitor Üzerinden:
```
1. Serial Monitor'de Camera ID gözükmeli
2. Eğer "Not Set" ise WiFiManager ile ayarlayın:
   - ESP32'yi reset edin
   - "CityV-AI-Camera" WiFi'sine bağlanın
   - 192.168.4.1 adresine girin
   - Camera ID'yi girin ve Save
```

---

### 4️⃣ Web Arayüzü Testi

#### City-V Ana Sayfa:
```
1. https://city-v-ercanergulers-projects.vercel.app/ açın
2. Sağ üst köşede Sidebar toggle'a tıklayın
3. "Canlı İşletme Verileri" bölümü açılmalı

BEKLENTİ:
✅ İşletme kartları görünüyor
✅ Kamera sayısı gösteriliyor
✅ Crowd level (empty/low/medium/high) görünüyor
✅ Son güncelleme zamanı var
✅ "🟢 Canlı" badge'i aktif
```

#### Debug Modu:
Eğer veri görünmüyorsa:
```javascript
// Browser Console (F12):
1. Console'a gidin
2. "📊 Business Live IoT Data API" mesajını arayın
3. "✅ X aktif business IoT cihazı bulundu" görmelisiniz
4. İlk kayıt örneğini kontrol edin:
   - camera_id var mı?
   - has_analysis: true mu?
```

---

## 🧪 Test Senaryosu

### Senaryo 1: ESP32 Bağımsız Çalışma
```
1. ESP32'yi WiFi'ye bağlayın
2. Serial Monitor'de veri akışını gözleyin:
   "📤 ONLINE: Veri gönderildi"
3. Tarayıcıyı KAPATIN
4. Serial Monitor HALA veri gönderiyor mu? ✅
5. 5 saniye aralıklarla POST yapmalı
```

### Senaryo 2: Web Arayüzü Açıkken
```
1. ESP32 IP'sine girin: http://192.168.1.xxx
2. Web panelini açık tutun
3. Aynı anda Serial Monitor'ü izleyin
4. Her ikisinde de veri akışı devam etmeli ✅

ÖNEMLI: loop() fonksiyonu hem web server hem AI analiz çalıştırır!
```

### Senaryo 3: Sidebar Canlı Veri
```
1. City-V ana sayfayı açın
2. F12 → Console açın
3. Sidebar'ı toggle edin
4. 10 saniye bekleyin (polling interval)
5. Console'da API çağrısını görmelisiniz
6. İşletme kartlarında canlı veriler güncellenmeli
```

---

## 🔍 Hata Ayıklama

### Problem: Serial'de "❌ ONLINE FAILED: 400"
```
SEBEP: camera_id veya ip_address eksik/hatalı

ÇÖZÜM:
1. CAMERA_ID değişkenini kontrol edin (Serial'de)
2. Web panelden Camera ID'yi yeniden ayarlayın
3. CAMERA_IP değişkenini kontrol edin (WiFi.localIP())
```

### Problem: Serial'de "⚠️ Eşleşen kamera bulunamadı"
```
SEBEP: business_cameras tablosunda kayıt yok

ÇÖZÜM:
1. Vercel Postgres'te business_cameras tablosunu kontrol edin
2. Kamera ekleyin:
   INSERT INTO business_cameras (
     business_user_id, camera_name, ip_address, is_active, ai_enabled
   ) VALUES (
     1, 'ESP32 Giriş Kamerası', '192.168.1.100', true, true
   );
3. id değerini not edin
4. ESP32'de Camera ID'yi bu id ile eşleyin
```

### Problem: Sidebar'da "Henüz canlı veri yok"
```
SEBEP: Son 5 dakikada iot_crowd_analysis kaydı yok

ÇÖZÜM:
1. ESP32 veri gönderiyor mu kontrol et (Serial)
2. API log'larını kontrol et (Vercel Dashboard → Logs)
3. SQL sorgusu çalıştır:
   SELECT COUNT(*) FROM iot_crowd_analysis
   WHERE analysis_timestamp >= NOW() - INTERVAL '5 minutes';
4. 0 ise → ESP32 veri göndermiyor, firmware kontrol et
5. >0 ise → device_id eşleşmesi yanlış, SQL JOIN kontrol et
```

---

## 📊 Başarılı Kurulum Kontrol Listesi

- [ ] ESP32 firmware yüklendi (esp32-cam-cityv.ino)
- [ ] ESP32 WiFi'ye bağlandı
- [ ] Camera ID atandı (Web panel veya WiFiManager)
- [ ] Serial Monitor'de "📤 ONLINE: Veri gönderildi" görünüyor
- [ ] business_cameras tablosunda kayıt var
- [ ] iot_crowd_analysis tablosunda son 5 dakikada kayıt var
- [ ] LiveCrowdSidebar açıldığında işletme kartları görünüyor
- [ ] Crowd level ve people count güncelleniyor
- [ ] Browser Console'da hata yok

---

## 🚀 Deployment Status

**Git Commit:** `842f5f7`  
**Vercel URL:** https://city-v-ercanergulers-projects.vercel.app/  
**Deployment:** Auto-triggered (master branch push)

**Değiştirilen Dosyalar:**
- ✅ `app/api/business/live-iot-data/route.ts` - Camera ID eşleşmesi
- ✅ `app/api/iot/crowd-analysis/route.ts` - Device ID mapping
- ✅ `esp32-cam-cityv.ino` - JSON payload güvenliği

---

## 💡 Teknik Detaylar

### Veri Akışı:
```
ESP32-CAM (camera_id: 5)
    ↓ POST /api/iot/crowd-analysis
    ↓ camera_id → device_id "5" (VARCHAR)
iot_crowd_analysis (device_id: "5")
    ↓ 
LiveCrowdSidebar API
    ↓ CAST(device_id AS INTEGER) = bc.id
business_cameras (id: 5) ✅ EŞLEŞME
    ↓
Sidebar Component
    ↓
Kullanıcı canlı veriyi görüyor 🎉
```

### SQL JOIN Mantığı:
```sql
LEFT JOIN LATERAL (
  SELECT people_count, crowd_density, current_occupancy, analysis_timestamp
  FROM iot_crowd_analysis
  WHERE CAST(device_id AS INTEGER) = bc.id  -- KEY CHANGE
    AND analysis_timestamp >= NOW() - INTERVAL '5 minutes'
  ORDER BY analysis_timestamp DESC
  LIMIT 1
) ca ON true
```

**Açıklama:**
- `device_id` VARCHAR (iot_crowd_analysis)
- `bc.id` INTEGER (business_cameras)
- `CAST(device_id AS INTEGER)` ile eşleşme sağlanıyor

---

## 🎬 Sonraki Adımlar

1. **ESP32 Firmware Yükle** (Arduino IDE)
2. **Camera ID Ayarla** (Web panel: http://ESP32_IP/)
3. **Veritabanı Kontrol** (business_cameras + iot_crowd_analysis)
4. **Sidebar Test** (City-V ana sayfa)
5. **Canlı Veri Akışını İzle** (10 saniye polling)

---

**HIZLI TEST:**
```bash
# 1. ESP32 Serial Monitor
"📤 ONLINE: Veri gönderildi"

# 2. Browser Console (City-V)
"✅ X aktif business IoT cihazı bulundu"

# 3. Sidebar
"🟢 Canlı" badge + Crowd level görünüyor

HEPSİ OK ise → SİSTEM ÇALIŞIYOR! ✅
```
