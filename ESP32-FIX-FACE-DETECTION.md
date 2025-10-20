# 🔧 ESP32-CAM Face Detection Hatası Çözümü

## ❌ Hata:
```
fatal error: fd_forward.h: No such file or directory
```

## 🎯 Çözüm Seçenekleri:

### ✅ ÇÖZÜM 1: Yüz Tanımayı Kaldır (ÖNERİLEN)
City-V projesi için yüz tanıma gerekmiyor. Kalabalık analizi için gerekli değil.

**Arduino kodunuzu açın ve şu satırları SİLİN veya YORUM SATIRINA ALIN:**

```cpp
// SİLİN:
#include "fd_forward.h"
#include "fr_forward.h"
#include "fr_flash.h"

// Yüz tanıma ile ilgili tüm fonksiyonları da silin
```

**Yerine City-V'nin AI-Thinker ESP32-CAM kodunu kullanın:**

📁 Dosya: `esp32-cam-cityv.ino` (proje klasöründe mevcut)

### ✅ ÇÖZÜM 2: ESP32 Kütüphanesini Güncelle

Eğer mutlaka yüz tanıma gerekiyorsa:

1. **Arduino IDE → Boards Manager**
2. **"esp32" ara**
3. **Espressif Systems ESP32**'yi güncelle (minimum v2.0.0)
4. **Yeniden yükle**

### ✅ ÇÖZÜM 3: Partition Scheme Değiştir

1. **Arduino IDE → Tools → Partition Scheme**
2. **"Huge APP (3MB No OTA/1MB SPIFFS)"** seç
3. **Upload**

## 🚀 Hızlı Çözüm (Kopyala-Yapıştır)

City-V için hazır, çalışan ESP32-CAM kodu:

```bash
# Proje klasöründeki dosyayı kullanın:
esp32-cam-cityv.ino
```

**Özellikler:**
- ✅ Yüz tanıma YOK (gerekmiyor)
- ✅ Kalabalık analizi VAR
- ✅ WiFi Manager VAR
- ✅ MJPEG Stream VAR
- ✅ City-V API entegrasyonu VAR
- ✅ Zone-based analiz VAR

## 📋 Arduino IDE Ayarları

```
Board: AI Thinker ESP32-CAM
Upload Speed: 115200
Flash Frequency: 80MHz
Flash Mode: QIO
Partition Scheme: Huge APP (3MB No OTA)
Core Debug Level: None
```

## 🔌 Upload Modu

1. **GPIO0'ı GND'ye bağlayın**
2. **Reset butonuna basın**
3. **Upload butonuna tıklayın**
4. **Upload bittikten sonra GPIO0'ı çıkarın**
5. **Reset butonuna tekrar basın**

## ✅ Test

```
Serial Monitor → 115200 baud
```

Şunu görmelisiniz:
```
🎥 ESP32-CAM City-V v3.0
📡 WiFi bağlanıyor...
✅ Bağlandı!
🌐 IP Adresi: 192.168.1.XXX
📹 Kamera başlatılıyor...
✅ Kamera hazır!
🚀 Server başlatıldı
```

## 🌐 Test URL'leri

```
http://[ESP32-IP]/stream    → Video stream
http://[ESP32-IP]/status    → Durum kontrolü
http://[ESP32-IP]/analyze   → Manuel analiz
```

## 💡 Ekstra İpuçları

**Brownout Detector Hatası:**
```cpp
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Brownout detector disable
}
```

**Kamera Başlatma Hatası:**
- 5V güç kaynağı kullanın (USB değil)
- SD kartı çıkarın
- Reset yapın

**WiFi Bağlanamıyor:**
- SSID ve password kontrol edin
- 2.4GHz ağ kullanın (5GHz desteklenmez)
- Router yakınında test edin

## 📞 Destek

Hala sorun mu var?
- Email: sce@scegrup.com
- Dökümantasyon: ESP32-CAM-KURULUM.md
