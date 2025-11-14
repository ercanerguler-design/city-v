# 🚀 IoT Personel Tanıma - Hızlı Test Rehberi

## ✅ Sistem Hazır!

Tüm database tabloları oluşturuldu:
- ✅ `staff_face_profiles` - Yüz profilleri
- ✅ `iot_staff_detections` - Tespit kayıtları  
- ✅ `staff_attendance` - Vardiya devamsızlık

## 🎮 5 Dakikada Test Et

### 1. Personel Ekle (Business Dashboard)

```
Business Dashboard → Personel Yönetimi → Personel Ekle

Ad Soyad: Ahmet Yılmaz
Email: ahmet@test.com
Pozisyon: Garson
Vardiya: Sabah (08:00-16:00)

[Ekle] butonuna tıkla
```

### 2. QR Kod Oluştur

Personel kartında:
```
[QR Kod] butonuna tıkla
→ QR kod pop-up'ta gösterilir
→ Telefona screenshot al veya yazdır
```

QR kod formatı:
```
STAFF-{id}-{hash}
Örnek: STAFF-1-YWhtZXRAdGVzdC5jb20=
```

### 3. ESP32-CAM ile Test (Simülasyon)

**Postman/cURL ile:**

```bash
curl -X POST https://your-domain.vercel.app/api/iot/staff-detection \
  -H "Content-Type: application/json" \
  -D '{
    "camera_id": 28,
    "staff_qr": "STAFF-1-YWhtZXRAdGVzdC5jb20=",
    "detection_type": "qr_scan",
    "location_zone": "Giriş"
  }'
```

**Response (Check-in):**
```json
{
  "success": true,
  "staff": {
    "id": 1,
    "name": "Ahmet Yılmaz",
    "position": "Garson"
  },
  "action": "check_in",
  "attendance_id": 1,
  "message": "Ahmet Yılmaz vardiyaya başladı! 🎉",
  "location": "Giriş",
  "timestamp": "2025-11-01T08:05:30.123Z"
}
```

### 4. Check-out Testi

Aynı QR kodu tekrar tara (birkaç saniye sonra):

```bash
# Aynı isteği tekrarla
```

**Response (Check-out):**
```json
{
  "success": true,
  "staff": {
    "id": 1,
    "name": "Ahmet Yılmaz",
    "position": "Garson"
  },
  "action": "check_out",
  "attendance_id": 1,
  "message": "Ahmet Yılmaz vardiyayı tamamladı! Toplam: 0.1 saat",
  "location": "Giriş"
}
```

### 5. Dashboard'da Kontrol

```
Business Dashboard → Personel Yönetimi

Personel kartında göreceksin:
- Durum: 🟢 Vardiyada (check-in sonrası)
- Son görülme: 2 dakika önce
- Konum: Giriş (ESP32-28)
```

## 📱 Gerçek ESP32-CAM Kodu (Basit)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "WIFI_ADINIZ";
const char* password = "WIFI_SIFRENIZ";
const int CAMERA_ID = 28;
const char* API_URL = "https://your-domain.vercel.app/api/iot/staff-detection";

// QR kod okuyucu bağlı değilse manuel test
String testQR = "STAFF-1-YWhtZXRAdGVzdC5jb20=";

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("WiFi bağlanıyor...");
  }
  Serial.println("✅ WiFi bağlı!");
}

void loop() {
  // Buton basınca QR kod gönder (test için)
  if (digitalRead(BUTTON_PIN) == LOW) {
    sendStaffDetection(testQR, "Giriş");
    delay(5000); // 5 saniye bekle
  }
}

void sendStaffDetection(String qrCode, String zone) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{";
    payload += "\"camera_id\":" + String(CAMERA_ID) + ",";
    payload += "\"staff_qr\":\"" + qrCode + "\",";
    payload += "\"detection_type\":\"qr_scan\",";
    payload += "\"location_zone\":\"" + zone + "\"";
    payload += "}";
    
    int httpCode = http.POST(payload);
    
    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("✅ API Response:");
      Serial.println(response);
    } else {
      Serial.println("❌ HTTP Error: " + String(httpCode));
    }
    
    http.end();
  }
}
```

## 🎯 Beklenen Sonuçlar

### Database Kayıtları

**staff_attendance tablosu:**
```sql
SELECT * FROM staff_attendance WHERE date = CURRENT_DATE;

| staff_id | check_in_time       | check_out_time      | total_hours | status  |
|----------|---------------------|---------------------|-------------|---------|
| 1        | 2025-11-01 08:05:30 | 2025-11-01 16:10:45 | 8.09        | present |
```

**iot_staff_detections tablosu:**
```sql
SELECT * FROM iot_staff_detections WHERE staff_id = 1 ORDER BY detection_time DESC LIMIT 5;

| staff_id | camera_id | location_zone | detection_type | detection_time       |
|----------|-----------|---------------|----------------|----------------------|
| 1        | 28        | Giriş         | qr_scan        | 2025-11-01 16:10:45  |
| 1        | 28        | Giriş         | qr_scan        | 2025-11-01 08:05:30  |
```

## 🐛 Sorun Giderme

### "Personel bulunamadı"
- QR kod formatını kontrol et: `STAFF-{id}-{hash}`
- Personel ID'sinin doğru olduğundan emin ol
- Personel durumu "active" olmalı

### "Camera ID gerekli"
- camera_id parametresini gönderdiğinden emin ol
- business_cameras tablosunda kamera kaydı olmalı

### WiFi bağlantı sorunu
```cpp
// ESP32'de serial monitor'ü kontrol et
Serial.println(WiFi.localIP()); // IP adresini görmeli
```

## 📊 Gelişmiş Testler

### Çoklu Personel Testi
```bash
# Personel 1 check-in
curl -X POST .../api/iot/staff-detection -d '{"camera_id":28, "staff_qr":"STAFF-1-..."}'

# Personel 2 check-in  
curl -X POST .../api/iot/staff-detection -d '{"camera_id":28, "staff_qr":"STAFF-2-..."}'

# Personel 1 check-out
curl -X POST .../api/iot/staff-detection -d '{"camera_id":28, "staff_qr":"STAFF-1-..."}'
```

### Farklı Kameralar
```bash
# Giriş kamerası (ID: 28)
curl ... -d '{"camera_id":28, "location_zone":"Giriş"}'

# Salon kamerası (ID: 29)
curl ... -d '{"camera_id":29, "location_zone":"Salon"}'
```

## 🎉 Başarı Kriterleri

✅ Personel eklendi
✅ QR kod oluşturuldu
✅ Check-in başarılı
✅ Check-out başarılı  
✅ Vardiya süresi hesaplandı
✅ Dashboard'da durum güncellendi

## 🚀 Sonraki Adımlar

1. **Birden fazla personel ekle** - Test için 3-5 personel
2. **Birden fazla kamera ekle** - Farklı bölgeler
3. **Gerçek ESP32-CAM bağla** - QR okuyucu modülü ile
4. **Raporları test et** - Günlük/haftalık devamsızlık
5. **Bildirimleri aktif et** - Geç kalma alarmları

---

💡 **İpucu:** İlk hafta manuel vardiya kaydı ile paralel çalıştır, sistemin doğruluğunu test et!
