# 🚀 ESP32-CAM City-V Entegrasyonu Kurulum Rehberi

## � Firmware Versiyonu: **v3.0** (2025-10-15)

### ✨ v3.0 Yeni Özellikler:
- ✅ **Zone-based AI Analysis** (3x3 grid crowd detection)
- ✅ **Real-time Object Detection** (kişi, masa, sandalye)
- ✅ **CORS-enabled Streaming** (web entegrasyonu)
- ✅ **RESTful API** (/stream, /status, /analyze)
- ✅ **Auto-reconnect WiFi**
- ✅ **Brownout detector fix**

---

## �📦 Gerekli Malzemeler
- **ESP32-CAM modülü** (AI-Thinker versiyonu önerili)
- **USB-Serial adaptörü** (CP2102 veya CH340G)
- **Jumper kablolar**
- **Breadboard** (opsiyonel)

## 🔧 Arduino IDE Kurulumu

### 1. Arduino IDE İndirin
- [Arduino IDE](https://www.arduino.cc/en/software) sitesinden en son sürümü indirin
- Windows için `.exe` dosyasını çalıştırın

### 2. ESP32 Board Package'ini Ekleyin
1. Arduino IDE'yi açın
2. **File > Preferences** menüsüne gidin
3. **Additional Board Manager URLs** alanına şu URL'yi ekleyin:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. **Tools > Board > Boards Manager** menüsüne gidin
5. "esp32" araması yapın ve **ESP32 by Espressif Systems** paketini yükleyin

### 3. Gerekli Kütüphaneleri Yükleyin
**Tools > Manage Libraries** menüsünden şu kütüphaneleri yükleyin:
- **ArduinoJson** by Benoit Blanchon (v6.21.3 veya üzeri)
- **ESP32 Camera** (genellikle ESP32 board package ile birlikte gelir)

> ⚠️ **Önemli:** ArduinoJson v6 kullanın. v7 ile syntax farklılıkları olabilir.

## 🔌 Donanım Bağlantıları

### ESP32-CAM + USB-Serial Adaptör Bağlantısı

```
ESP32-CAM    →    USB-Serial Adaptör
---------         ------------------
5V           →    5V (veya 3.3V)
GND          →    GND  
U0T          →    RX
U0R          →    TX
GPIO0        →    GND (sadece programlama sırasında)
RST          →    (Bağlamayın)
```

### Programlama Modu
1. **GPIO0'ı GND'ye bağlayın**
2. ESP32-CAM'i güçlendiirin
3. Kodu yükleyin
4. **GPIO0 bağlantısını çıkarın**
5. ESP32-CAM'i yeniden başlatın

## 💻 Kod Konfigürasyonu

### 1. WiFi Ayarları
`esp32-cam-cityv.ino` dosyasında şu satırları düzenleyin:

```cpp
const char* ssid = "WiFi_Adi";              // WiFi ağ adınızı yazın
const char* password = "WiFi_Sifresi";      // WiFi şifrenizi yazın
```

### 2. City-V API Ayarları
```cpp
const char* cityv_host = "cityv.vercel.app";  // Kendi domain'inizle değiştirin
const char* device_id = "esp32_cam_001";       // Benzersiz cihaz ID'si
const char* location_name = "Test Lokasyonu"; // Lokasyon adı
```

### 3. Koordinat Ayarları
Lokasyonunuzun GPS koordinatlarını güncelleyin:
```cpp
doc["coordinates"] = {
  {"lat", 39.9334}, // Enlem (Ankara örneği)
  {"lng", 32.8597}  // Boylam
};
```

## 📤 Kod Yükleme

### 1. Board Ayarları
Arduino IDE'de şu ayarları yapın:
- **Board**: "AI Thinker ESP32-CAM"
- **CPU Frequency**: "240MHz (WiFi/BT)"
- **Flash Frequency**: "80MHz"  
- **Flash Mode**: "QIO"
- **Partition Scheme**: "Huge APP (3MB No OTA/1MB SPIFFS)"
- **Core Debug Level**: "None"

### 2. Kodu Yükleyin
1. ESP32-CAM'i programlama modunda bağlayın
2. Doğru **COM Port**'u seçin
3. **Upload** butonuna tıklayın
4. Yükleme tamamlandığında GPIO0 bağlantısını çıkarın
5. ESP32-CAM'i yeniden başlatın

## 🌐 Kullanım

### 1. Seri Monitor Kontrolü
- **Baud Rate**: 115200
- ESP32-CAM açıldığında şu mesajları göreceksiniz:
  ```
  🚀 ESP32-CAM City-V Entegrasyonu Başlıyor...
  ✅ WiFi bağlandı!
  📍 IP Adresi: 192.168.1.100
  ✅ Camera server başladı
  ```

### 2. Test Komutları
Seri monitöre şu komutları yazabilirsiniz:
- `status` - Cihaz durumunu görüntüle
- `test` - Test raporu gönder  
- `analyze` - Anlık kalabalık analizi yap
- `restart` - Cihazı yeniden başlat

### 3. Web Arayüzü Erişimi
- **Kamera Stream**: `http://ESP32_IP/stream`
- **Cihaz Durumu**: `http://ESP32_IP/status` 
- **City-V Dashboard**: `https://cityv.vercel.app/esp32`

## 🎯 City-V Dashboard Kullanımı

### 1. ESP32 Sayfasına Erişim
- City-V ana sayfasında **IoT** butonuna tıklayın
- Veya doğrudan `/esp32` sayfasına gidin

### 2. Cihaz Ekleme
1. ESP32-CAM'inizin IP adresini girin
2. **Cihaz Ekle** butonuna tıklayın
3. Cihaz listesinde görünecektir

### 3. Canlı İzleme
1. Listeden cihazınızı seçin
2. **Başlat** butonuna tıklayın
3. Canlı kamera görüntüsünü izleyin

## 🔧 Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

#### 1. Kamera Başlatma Hatası
```
❌ Kamera hatası: 0x20001
```
**Çözüm**: 
- Kamera modülünün doğru bağlandığından emin olun
- Güç kaynağının yeterli olduğunu kontrol edin (5V/2A önerili)

#### 2. WiFi Bağlantı Sorunu
```
❌ WiFi bağlantısı başarısız!
```
**Çözüm**:
- WiFi ağ adı ve şifresini kontrol edin
- 2.4GHz ağına bağlandığınızdan emin olun (5GHz desteklenmiyor)

#### 3. Upload Hatası
```
Failed to connect to ESP32: Timed out waiting for packet header
```
**Çözüm**:
- GPIO0'ın GND'ye bağlı olduğunu kontrol edin
- RST butonuna basarak ESP32'yi sıfırlayın
- COM port ayarlarını kontrol edin

#### 4. Düşük Stream Kalitesi
**Çözüm**:
- PSRAM'li ESP32-CAM kullanın
- Frame size ayarlarını optimize edin
- WiFi sinyal gücünü artırın

## 📊 Performans Optimizasyonu

### 1. Kamera Ayarları
```cpp
// Yüksek kalite için
config.frame_size = FRAMESIZE_UXGA;  // 1600x1200
config.jpeg_quality = 8;             // Düşük değer = yüksek kalite

// Hızlı stream için  
config.frame_size = FRAMESIZE_VGA;   // 640x480
config.jpeg_quality = 15;            // Yüksek değer = düşük kalite
```

### 2. Kalabalık Analizi Optimizasyonu
```cpp
// Analiz sıklığını ayarlayın
const unsigned long reportInterval = 30000; // 30 saniye

// Piksel analiz sayısını artırın/azaltın
for(int i = 0; i < totalPixels && i < 10000; i += 50) // Her 50. piksel
```

## 🚀 Gelişmiş Özellikler

### 1. Çoklu Cihaz Desteği
Birden fazla ESP32-CAM için farklı device_id kullanın:
```cpp
const char* device_id = "esp32_cam_002";  // Her cihaz için benzersiz
```

### 2. OTA (Over-The-Air) Update
```cpp
#include <ArduinoOTA.h>
// OTA konfigürasyonunu setup() fonksiyonuna ekleyin
```

### 3. Hareket Algılama
```cpp
// Gelişmiş hareket algılama algoritması eklenebilir
bool detectMotion() {
  // Önceki frame ile karşılaştırma
  return motionDetected;
}
```

## 📋 Teknik Özellikler

### ESP32-CAM Özellikleri
- **İşlemci**: Dual-core Tensilica LX6 (240MHz)
- **RAM**: 520KB SRAM + 4MB PSRAM
- **WiFi**: 802.11 b/g/n (2.4GHz)
- **Kamera**: OV2640 (2MP, JPEG çıkış)
- **GPIO**: 9 adet (sınırlı)

### Desteklenen Çözünürlükler
- **QQVGA**: 160x120
- **QCIF**: 176x144  
- **HQVGA**: 240x176
- **QVGA**: 320x240
- **CIF**: 400x296
- **VGA**: 640x480
- **SVGA**: 800x600
- **XGA**: 1024x768
- **SXGA**: 1280x1024  
- **UXGA**: 1600x1200

## 🎯 Sonraki Adımlar

1. **Makine Öğrenmesi Entegrasyonu**
   - TensorFlow Lite kullanarak nesne tanıma
   - Yüz tanıma ve insan sayma

2. **Sensör Eklentileri**  
   - PIR hareket sensörü
   - Ses seviyesi sensörü
   - Sıcaklık/nem sensörü

3. **Gelişmiş Analitik**
   - Zaman serisi analizi
   - Heatmap oluşturma
   - Trend tahminleri

4. **Mobile App Entegrasyonu**
   - React Native app
   - Push notifications
   - Offline mode

## � Sorun Giderme

### Yaygın Derleme Hataları

#### 1. Stray '\' in program hatası
```cpp
// ❌ Yanlış: Double backslash
String json = "{\\"key\\":\\"value\\"}";

// ✅ Doğru: Single backslash
String json = "{\"key\":\"value\"}";
```

#### 2. JSON Object oluşturma hatası
```cpp
// ❌ Yanlış: Brace-enclosed initializer
doc["coordinates"] = {{"lat", 39.9334}, {"lng", 32.8597}};

// ✅ Doğru: createNestedObject kullanın
JsonObject coordinates = doc.createNestedObject("coordinates");
coordinates["lat"] = 39.9334;
coordinates["lng"] = 32.8597;
```

#### 3. ArduinoJson versiyon hatası
- ArduinoJson v6.21.3 kullanın
- Library Manager'dan eski versiyonları kaldırın
- IDE'yi yeniden başlatın

### Bağlantı Sorunları

#### WiFi Bağlanamıyor
1. SSID ve şifrenizi kontrol edin
2. 2.4GHz ağ kullandığınızdan emin olun
3. Seri monitöründe WiFi durumunu izleyin

#### City-V API'ye erişilemiyor
1. İnternet bağlantısını kontrol edin
2. API endpoint'ini doğrulayın
3. Firewall ayarlarını kontrol edin

## �📞 Destek

Herhangi bir sorunla karşılaştığınızda:
1. Seri monitor çıktısını kontrol edin
2. GitHub Issues açın
3. Community forumlarını ziyaret edin

**İyi kodlamalar! 🚀**