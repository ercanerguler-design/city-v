# ESP32 IoT Veri Gönderme - Otomatik Device ID

## 🎯 Sistem Artık Otomatik Çalışıyor!

ESP32 kameralarınızın artık device_id bilmesine gerek yok. Sadece **camera_id** veya **ip_address** gönderin, sistem otomatik olarak eşleştirir.

## 📡 Veri Gönderme Örnekleri

### Yöntem 1: Camera ID ile (Önerilen)
```cpp
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Business dashboard'da kamera eklerken aldığınız ID
const int CAMERA_ID = 62; // Kamera kartındaki ID numarası

void sendIoTData(int peopleCount) {
  HTTPClient http;
  http.begin("https://city-v-ercanergulers-projects.vercel.app/api/iot/crowd-analysis");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["camera_id"] = CAMERA_ID;  // Sadece camera_id yeterli!
  doc["people_count"] = peopleCount;
  doc["crowd_density"] = peopleCount > 5 ? "high" : "low";
  doc["confidence_score"] = 0.85;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  int httpCode = http.POST(jsonData);
  
  if (httpCode == 200) {
    Serial.println("✅ Veri gönderildi");
  } else {
    Serial.printf("❌ Hata: %d\n", httpCode);
  }
  
  http.end();
}
```

### Yöntem 2: IP Adresi ile
```cpp
const char* MY_IP = "192.168.1.100"; // Kameranın IP'si

void sendIoTData(int peopleCount) {
  HTTPClient http;
  http.begin("https://city-v-ercanergulers-projects.vercel.app/api/iot/crowd-analysis");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["ip_address"] = MY_IP;  // IP ile otomatik eşleştirme
  doc["people_count"] = peopleCount;
  doc["crowd_density"] = "medium";
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  http.POST(jsonData);
  http.end();
}
```

### Yöntem 3: Device ID ile (Eski Yöntem - Opsiyonel)
```cpp
const char* DEVICE_ID = "CITYV-CAM-1763918698454-6L7V8GJJ0";

void sendIoTData(int peopleCount) {
  HTTPClient http;
  http.begin("https://city-v-ercanergulers-projects.vercel.app/api/iot/crowd-analysis");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["device_id"] = DEVICE_ID;
  doc["people_count"] = peopleCount;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  http.POST(jsonData);
  http.end();
}
```

## 🔄 Nasıl Çalışır?

1. **ESP32 veri gönderir** → `camera_id` veya `ip_address` ile
2. **Sistem otomatik eşleştirir** → Database'de kamerayı bulur
3. **Device ID yoksa oluşturur** → Otomatik `CITYV-CAM-xxx` ID atar
4. **Veriyi kaydeder** → `iot_crowd_analysis` tablosuna
5. **Dashboard'da gösterir** → Real-time analytics

## ✅ Avantajlar

- ❌ **Device ID bilmeye gerek yok**
- ✅ **Camera ID yeterli** (Business dashboard'dan görebilirsiniz)
- ✅ **IP adresi ile de çalışır** (Otomatik eşleştirme)
- ✅ **Firmware değişmez** (Her kamera aynı kodu kullanabilir)
- ✅ **Otomatik kurulum** (İlk veri gönderiminde device_id atanır)

## 📊 Gönderebileceğiniz Veriler

```json
{
  "camera_id": 62,              // ZORUNLU (veya ip_address)
  "people_count": 5,            // ZORUNLU
  "crowd_density": "medium",    // Opsiyonel: empty/low/medium/high/overcrowded
  "confidence_score": 0.85,     // Opsiyonel: 0-1 arası
  "entry_count": 12,            // Opsiyonel
  "exit_count": 7,              // Opsiyonel
  "current_occupancy": 5,       // Opsiyonel
  "temperature": 22,            // Opsiyonel
  "humidity": 45                // Opsiyonel
}
```

## 🎯 Hızlı Başlangıç

1. **Business dashboard'a git** → Cameras sekmesi
2. **Kamera ID'sini not al** → Kamera kartının üstünde (örn: #62)
3. **ESP32 koduna ekle:**
   ```cpp
   const int CAMERA_ID = 62;
   ```
4. **Veri göndermeye başla** → Sistem otomatik device_id atar
5. **Dashboard'dan takip et** → Real-time veriler gelmeye başlayacak

## 🐛 Sorun Giderme

**"Device ID bulunamadı" hatası alıyorsanız:**
- Camera ID'yi kontrol edin (Business dashboard'da doğru ID'yi kullanın)
- IP adresini kontrol edin (Doğru IP ile eşleşiyor mu?)
- Kameranın aktif olduğundan emin olun (Business dashboard'da yeşil görünmeli)

**Veriler gelmiyor:**
- ESP32 internet bağlantısını kontrol edin
- API endpoint'i kontrol edin (`https://city-v-ercanergulers-projects.vercel.app/api/iot/crowd-analysis`)
- Serial monitor'da HTTP response kodunu kontrol edin (200 = başarılı)

## 📞 Destek

Sorun yaşarsanız ESP32 Serial Monitor çıktısını kontrol edin:
```
✅ Veri gönderildi
🔍 Device ID yok, otomatik eşleştirme yapılıyor...
✅ Camera #62 device_id atandı: CITYV-CAM-1732384567890-ABC123XYZ
```

