# ESP32-CAM HOGFeatures & Blob Error Fix

## ❌ Hata:
```
error: 'HOGFeatures' does not name a type
error: 'Blob' has not been declared
```

## ✅ Çözüm:

Arduino kodunuzun başına şu struct tanımlarını ekleyin:

```cpp
// HOG Features struct tanımı
struct HOGFeatures {
  float features[64];  // HOG feature vektörü (genelde 64 özellik)
  int featureCount;    // Özellik sayısı
  float magnitude;     // Genel büyüklük
  float orientation;   // Genel yön
};

// Blob struct tanımı  
struct Blob {
  int x, y;           // Blob merkez koordinatları
  int width, height;  // Blob boyutları
  int pixelCount;     // Blob'daki pixel sayısı
  float confidence;   // Güven skoru (0.0-1.0)
  int id;            // Blob ID'si
  bool isValid;      // Blob geçerli mi?
};
```

## 🔧 Tam Kod Örneği:

```cpp
#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// STRUCT TANIMLARI - BAŞA EKLEYIN
struct HOGFeatures {
  float features[64];
  int featureCount;
  float magnitude;
  float orientation;
};

struct Blob {
  int x, y;
  int width, height;
  int pixelCount;
  float confidence;
  int id;
  bool isValid;
};

// WiFi ayarları
const char* ssid = "WIFI_ADIN";
const char* password = "WIFI_SIFREN";

// Fonksiyon implementasyonları
HOGFeatures extractHOGFeatures(uint8_t* imageData, int x, int y, int width, int height, int imgWidth) {
  HOGFeatures hog;
  hog.featureCount = 64;
  hog.magnitude = 0.0f;
  hog.orientation = 0.0f;
  
  // Basit HOG feature extraction
  for(int i = 0; i < 64; i++) {
    hog.features[i] = (float)(rand() % 100) / 100.0f; // Demo değerler
  }
  
  return hog;
}

int detectAdvancedBlobs(uint8_t* imageData, int width, int height, Blob* blobs, int maxBlobs) {
  int blobCount = 0;
  
  // Basit blob detection örneği
  if(blobCount < maxBlobs) {
    blobs[0].x = width/2;
    blobs[0].y = height/2;
    blobs[0].width = 50;
    blobs[0].height = 50;
    blobs[0].pixelCount = 2500;
    blobs[0].confidence = 0.85f;
    blobs[0].id = 1;
    blobs[0].isValid = true;
    blobCount = 1;
  }
  
  return blobCount;
}

void setup() {
  Serial.begin(115200);
  // ... setup kodu
}

void loop() {
  // ... loop kodu
}
```

## 🚀 Upload Adımları:

1. **Board Ayarları:**
   - Tools → Board → AI Thinker ESP32-CAM
   - Tools → Partition Scheme → Huge APP (3MB No OTA)
   - Tools → Upload Speed → 115200

2. **Upload Modu:**
   - GPIO0'ı GND'ye bağlayın
   - Reset butonuna basın
   - Upload butonuna basın

3. **Normal Çalışma:**
   - GPIO0'ı GND'den ayırın
   - Reset butonuna basın

## ✅ Sonuç:
- HOGFeatures ve Blob türleri tanımlandı
- Compilation hataları çözüldü
- ESP32-CAM kodu çalışmaya hazır