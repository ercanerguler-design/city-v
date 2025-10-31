# ESP32-CAM Arduino IDE Setup Guide

## 🔧 Gerekli Ayarlar

### 1. Arduino IDE Board Manager
```
File → Preferences → Additional Board Manager URLs:
https://dl.espressif.com/dl/package_esp32_index.json
```

### 2. ESP32 Board Kurulumu
```
Tools → Board → Boards Manager → "esp32" ara → Install
```

### 3. Board Seçimi
```
Tools → Board → ESP32 Arduino → AI Thinker ESP32-CAM
```

### 4. Port Ayarları
```
Tools → Port → COM3 (veya görülen port)
Tools → Upload Speed → 115200
Tools → Flash Frequency → 80MHz
Tools → Flash Mode → QIO
Tools → Partition Scheme → Huge APP (3MB No OTA)
```

### 5. Gerekli Kütüphaneler
Arduino IDE'de bu kütüphaneleri yükleyin:
```
Tools → Manage Libraries:
- ArduinoJson (by Benoit Blanchon)
- WiFiManager (by tzapu)
```

### 6. Compilation Hatası Çözümü
Eğer hala fd_forward.h hatası alırsanız:

1. Arduino IDE'yi kapatın
2. C:\Users\[USERNAME]\Documents\Arduino\libraries klasörünü kontrol edin
3. ESP32 kütüphanelerini temizleyin:
```
File → Preferences → Show preferences file
Arduino15\packages\esp32 klasörünü silin
Arduino IDE'yi yeniden başlatın
ESP32 board package'ını yeniden yükleyin
```

### 7. WiFi Bağlantısı
ESP32-CAM ilk başlatılışında:
1. "ESP32-CAM-Setup" WiFi ağına bağlanın
2. Şifre: "cityv2024"
3. 192.168.4.1 adresine gidin
4. WiFi ayarlarınızı yapın

### 8. City-V API Bağlantısı
Cihaz otomatik olarak şu API endpoint'ine bağlanır:
```
https://city-nfiqb5thj-ercanergulers-projects.vercel.app/api
```

### 9. Web Interface
ESP32-CAM bağlandıktan sonra:
```
http://[ESP32_IP_ADDRESS]/        - Ana sayfa
http://[ESP32_IP_ADDRESS]/config  - Konfigürasyon
http://[ESP32_IP_ADDRESS]/stream  - Canlı video
http://[ESP32_IP_ADDRESS]/capture - Tek fotoğraf
```

## 🚨 Troubleshooting

### Compilation Error: fd_forward.h not found
```cpp
// Bu satırları koddan kaldırın:
#include "fd_forward.h"  // KALDIR
#include "fr_forward.h"  // KALDIR
```

### Upload Hatası
1. GPIO0'ı GND'ye bağlayın (program modu)
2. Reset butonuna basın
3. Upload başlatın
4. Upload tamamlandıktan sonra GPIO0 bağlantısını kesin
5. Reset yapın (normal çalışma modu)

### WiFi Bağlantı Sorunu
1. Serial Monitor'ü açın (115200 baud)
2. WiFi Manager açılana kadar bekleyin
3. ESP32-CAM-Setup ağına telefon/bilgisayardan bağlanın
4. Web sayfasında WiFi ayarlarını yapın

## ✅ Başarılı Setup Kontrol

Serial Monitor'da şu mesajları görmeli:
```
🚀 ESP32-CAM City-V IoT Sistemi Başlatılıyor...
📷 Kamera başlatılıyor...
✅ Kamera başarıyla başlatıldı!
📶 WiFi bağlantısı kuruluyor...
✅ WiFi bağlandı!
📡 IP Adresi: 192.168.x.x
🌐 Web server başlatıldı!
✅ ESP32-CAM hazır!
```

## 🎯 Demo Hazır!
Tüm setup tamamlandıktan sonra:
1. ESP32-CAM IP adresine web browser'dan bağlanın
2. City-V dashboard'da IoT sekmesinde cihazın görünmesini kontrol edin
3. Canlı video stream'i test edin
4. Crowd analysis verilerinin API'ye gönderildiğini kontrol edin