# 🔧 ESP32-CAM Stream Sorun Giderme

## ✅ Yapılan Değişiklikler

### 1. ESP32 Firmware (esp32-cam-iot-cityv.ino)

#### CORS Desteği Eklendi
```cpp
// handleStream() - OPTIONS request desteği
if (server.method() == HTTP_OPTIONS) {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
  return;
}
```

#### Web Server Routes Güncellendi
```cpp
// Stream ve capture için hem GET hem OPTIONS
server.on("/stream", HTTP_GET, handleStream);
server.on("/stream", HTTP_OPTIONS, handleStream);
server.on("/capture", HTTP_GET, handleCapture);
server.on("/capture", HTTP_OPTIONS, handleCapture);
```

### 2. Frontend (MultiDeviceDashboard.tsx)

#### Stream Durumu Takibi
```tsx
const [streamStatus, setStreamStatus] = useState<'loading' | 'success' | 'error'>('loading');

<img
  src={camera.streamUrl}
  onLoad={() => setStreamStatus('success')}
  onError={() => setStreamStatus('error')}
  crossOrigin="anonymous"
/>
```

#### Hata Gösterimi
- Loading state: Yükleniyor animasyonu
- Success state: Stream gösteriliyor
- Error state: Hata mesajı ve çözüm önerileri

### 3. Debug Sayfası

**URL:** `http://localhost:3000/esp32/debug`

**Özellikler:**
- Tüm kameraları otomatik test eder
- Hangi kameraların çalıştığını gösterir
- Cihaz bilgilerini (device_id, RSSI, uptime) gösterir
- Canlı stream önizlemesi
- Hata mesajları ve çözüm önerileri

## 🚀 Kullanım Adımları

### 1. ESP32 Firmware Güncelleme

```bash
1. Arduino IDE'de esp32-cam-iot-cityv.ino dosyasını açın
2. Board: "AI Thinker ESP32-CAM"
3. Upload Speed: "115200"
4. Tools > Upload
```

### 2. Kamera Testi

**Test Sayfası:**
```
http://localhost:3000/esp32/debug
```

**Test edilecek şeyler:**
- ✅ Kamera açık mı?
- ✅ WiFi'ye bağlı mı?
- ✅ IP adresi doğru mu?
- ✅ Stream URL erişilebilir mi?

### 3. Manuel Test

**Tarayıcıdan:**
```
http://192.168.1.9/status   → JSON bilgi döner
http://192.168.1.9/stream   → Video akışı
http://192.168.1.9/capture  → Tek fotoğraf
```

**Terminal'den:**
```bash
# Windows PowerShell
curl http://192.168.1.9/status

# Çıktı:
{
  "device_id": "ESP32-001",
  "device_name": "ESP32-CAM-001",
  "wifi_rssi": -45,
  "ip_address": "192.168.1.9",
  "camera_ready": true
}
```

## 🔍 Sorun Giderme

### Problem: Kamera görüntüsü gelmiyor

**Çözüm 1: CORS Hatası**
```
Console'da "CORS policy blocked" hatası var mı?
→ ESP32'yi yeni firmware ile flashlayın
```

**Çözüm 2: IP Adresi Yanlış**
```
http://localhost:3000/esp32/debug
→ Hangi kameraların çalıştığını görün
→ Çalışan kameraların IP'lerini kullanın
```

**Çözüm 3: Cihaz Offline**
```
Serial Monitor (115200 baud):
- "WiFi baglandi!" mesajını görüyor musunuz?
- "IP Adresi: 192.168.1.X" ne gösteriyor?
→ Bu IP'yi kullanın
```

### Problem: Multi sayfa çalışmıyor

**Kontrol:**
```typescript
// MultiDeviceDashboard.tsx - IP ayarları
const [cameraIPs, setCameraIPs] = useState({
  'ESP32-001': '192.168.1.9',  // Doğru IP?
  'ESP32-002': '192.168.1.10', // Doğru IP?
  'ESP32-003': '192.168.1.11', // Doğru IP?
  'ESP32-004': '192.168.1.12'  // Doğru IP?
});
```

**Çözüm:**
1. `/esp32/multi` sayfasını açın
2. Settings (⚙️) butonuna tıklayın
3. Çalışan kameraların gerçek IP'lerini girin
4. Save butonuna basın

### Problem: Business IoT sayfası çalışmıyor

**Kontrol:**
```typescript
// app/business/iot/page.tsx
<BusinessLiveCrowd
  esp32Ip="192.168.1.9"  // Çalışan kameranın IP'si
  maxCapacity={50}
/>
```

**Test:**
```
1. http://localhost:3000/esp32/debug → Çalışan kamerayı bul
2. app/business/iot/page.tsx → esp32Ip'yi güncelle
3. http://localhost:3000/business/iot → Test et
```

## 📊 Başarı Kriterleri

### ✅ ESP32 Çalışıyor
- Serial Monitor'da "ESP32-CAM READY!" görünüyor
- `http://192.168.1.9/status` JSON dönüyor
- `http://192.168.1.9/stream` görüntü akıyor

### ✅ Multi Sayfa Çalışıyor
- http://localhost:3000/esp32/multi açılıyor
- Kameralar "🟢 ONLINE" gösteriyor
- Stream görüntüleri geliyor
- İstatistikler gerçek veri gösteriyor

### ✅ Business IoT Çalışıyor
- http://localhost:3000/business/iot açılıyor
- "Başlat" butonu çalışıyor
- Canlı kamera görüntüsü geliyor
- API'den crowd data çekiliyor

## 🎯 Hızlı Çözüm

**3 adımda düzelt:**

1. **ESP32'yi Flashla:**
   ```
   Arduino IDE → Upload → Seri monitörde IP'yi not et
   ```

2. **Test Et:**
   ```
   http://localhost:3000/esp32/debug
   → Yeşil olan kameraların IP'lerini kaydet
   ```

3. **IP'leri Güncelle:**
   ```
   /esp32/multi → Settings → IP'leri gir → Save
   /business/iot/page.tsx → esp32Ip değiştir
   ```

## 📝 Notlar

- ESP32 her başlatıldığında aynı IP'yi almalı (DHCP reservation önerisi)
- Router'da MAC address bazlı sabit IP ayarlayın
- Test sayfası her zaman ilk adım olmalı
- CORS hataları için ESP32'yi mutlaka flashlayın

## 🔗 Faydalı Linkler

- Debug Sayfası: `http://localhost:3000/esp32/debug`
- Multi Kamera: `http://localhost:3000/esp32/multi`
- Business IoT: `http://localhost:3000/business/iot`
- Stream Test: `http://localhost:3000/test-esp32-stream.html`
