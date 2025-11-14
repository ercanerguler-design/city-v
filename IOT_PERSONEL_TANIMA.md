# 🎥 IoT Personel Tanıma Sistemi - Kurulum Rehberi

## 📋 Genel Bakış

CityV'nin IoT personel tanıma sistemi, ESP32-CAM akıllı kameralarınız ile personeli otomatik olarak tanır ve vardiya kayıtlarını tutar.

## 🎯 Özellikler

### ✅ Otomatik Vardiya Kaydı
- Personel girişte tanınır, otomatik check-in
- Çıkışta otomatik check-out
- Toplam çalışma saati hesaplama
- Geç kalma, erken çıkış tespiti

### ✅ Gerçek Zamanlı Takip
- Personelin hangi bölgede olduğu anlık görülür
- Kamera bazlı konum takibi
- Vardiya süresince hareket analizi

### ✅ Güvenlik
- Yetkisiz personel tespiti
- Çalışma saati dışı giriş alarmı
- Güvenlik olayı kayıtları

## 🚀 Hızlı Başlangıç

### 1. Database Tablolarını Oluştur

```powershell
node database\create_staff_recognition_table.js
```

Bu komut 3 tablo oluşturur:
- `staff_face_profiles` - Personel yüz profilleri
- `iot_staff_detections` - Tespit kayıtları
- `staff_attendance` - Vardiya devam kayıtları

### 2. Personel Fotoğrafı Yükle

**Business Dashboard → Personel Yönetimi:**
1. Personel kartında "Yüz Profili Ekle" butonuna tıkla
2. Personelin net yüz fotoğrafını yükle (frontal, iyi ışık)
3. Sistem yüz verilerini işler ve kaydeder
4. Güven eşiği ayarla (varsayılan %85)

### 3. ESP32-CAM Firmware Güncelleme

#### A) Manuel Yöntem (Basit - Önerilen)

**QR Kod ile Tanıma:**

Personel Dashboard'dan:
1. Her personel için benzersiz QR kod oluşturulur
2. QR kod personele verilir (basılı veya telefon)
3. Personel giriş/çıkışta QR kodu kameraya gösterir
4. ESP32-CAM QR'ı okur ve API'ye gönderir

```cpp
// ESP32-CAM için QR okuma kodu
#include <ESP32QRCodeReader.h>

ESP32QRCodeReader qrReader(CAMERA_MODEL_AI_THINKER);

void setup() {
  qrReader.setup();
}

void loop() {
  if (qrReader.receiveQrCode()) {
    String qrData = qrReader.getQrCodeData();
    
    // API'ye gönder
    sendStaffDetection(qrData);
  }
}

void sendStaffDetection(String staffQR) {
  HTTPClient http;
  http.begin("https://your-domain.vercel.app/api/iot/staff-detection");
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"qr_code\":\"" + staffQR + "\",\"camera_id\":" + CAMERA_ID + ",\"detection_type\":\"qr_scan\"}";
  
  int httpCode = http.POST(payload);
  if (httpCode == 200) {
    Serial.println("✅ Personel kaydedildi");
  }
  
  http.end();
}
```

#### B) Yüz Tanıma Yöntemi (Gelişmiş)

ESP32 için hafif yüz tanıma kütüphanesi:

```cpp
#include "esp_camera.h"
#include "fd_forward.h"  // Face detection

// Yüz tespit edildiğinde
void detectFace() {
  camera_fb_t *fb = esp_camera_fb_get();
  
  // Yüz tespiti
  dl_matrix3du_t *image_matrix = dl_matrix3du_alloc(1, fb->width, fb->height, 3);
  fmt2rgb888(fb->buf, fb->len, fb->format, image_matrix->item);
  
  box_array_t *detected = face_detect(image_matrix, &mtmn_config);
  
  if (detected && detected->len > 0) {
    // Yüz bulundu - API'ye gönder
    sendFaceToAPI(fb->buf, fb->len);
  }
  
  dl_matrix3du_free(image_matrix);
  esp_camera_fb_return(fb);
}

void sendFaceToAPI(uint8_t *image, size_t len) {
  // Base64 encode
  String encodedImage = base64_encode(image, len);
  
  HTTPClient http;
  http.begin("https://your-domain.vercel.app/api/iot/face-recognition");
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"image\":\"" + encodedImage + "\",\"camera_id\":" + CAMERA_ID + "}";
  
  int httpCode = http.POST(payload);
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("Personel tanındı: " + response);
  }
  
  http.end();
}
```

## 🎮 Kullanım

### Business Dashboard'da

**1. Canlı Personel Takibi:**
```
Dashboard → Personel → Canlı Durum
- Vardiyada olanlar (yeşil)
- Tespit edilen kamera konumu
- Toplam çalışma süresi (real-time)
```

**2. Vardiya Raporları:**
```
Dashboard → Personel → Devamsızlık
- Günlük/haftalık/aylık raporlar
- Geç kalma istatistikleri
- Erken çıkış kayıtları
- Excel/PDF export
```

**3. IoT Ayarları:**
```
Dashboard → Ayarlar → IoT Personel
- Otomatik vardiya kaydı: Açık/Kapalı
- Güven eşiği: %85 (ayarlanabilir)
- Tespit bölgeleri: Giriş, Salon, Mutfak
- Alarm ayarları
```

## 📊 API Endpoints

### POST `/api/iot/staff-detection`
ESP32-CAM'den personel tespiti

**Body:**
```json
{
  "camera_id": 28,
  "staff_qr": "STAFF-123-ABC",  // QR kod için
  "face_image": "base64...",     // Yüz tanıma için
  "detection_type": "qr_scan",   // qr_scan veya face_recognition
  "location_zone": "Giriş"
}
```

**Response:**
```json
{
  "success": true,
  "staff": {
    "id": 5,
    "name": "Ahmet Yılmaz",
    "position": "Garson"
  },
  "action": "check_in",           // check_in veya check_out
  "attendance_id": 123,
  "message": "Vardiya başladı"
}
```

### GET `/api/business/staff-attendance?date=2025-11-01`
Günlük devamsızlık raporu

**Response:**
```json
{
  "success": true,
  "date": "2025-11-01",
  "total_staff": 12,
  "present": 10,
  "absent": 2,
  "late": 1,
  "records": [
    {
      "staff_id": 5,
      "name": "Ahmet Yılmaz",
      "check_in": "08:05:30",
      "check_out": "16:10:45",
      "total_hours": 8.09,
      "status": "late",
      "detected_by": "ESP32-CAM #28"
    }
  ]
}
```

## 🔔 Bildirimler

### Otomatik Bildirimler:
- ✅ Personel vardiyaya başladı
- ✅ Personel vardiya dışı tespit edildi
- ⚠️ Geç kalma bildirimi
- ⚠️ Tanınmayan kişi tespiti (güvenlik)
- ⚠️ Uzun süre hareketsizlik (sağlık)

## 🎨 Dashboard Görünümü

### Personel Kartlarında:
```
[Ahmet Yılmaz]         [🟢 Vardiyada]
Garson                 
                       
Giriş Saati: 08:05     📍 Konum: Salon (ESP32-28)
Çalışma: 5s 30dk       🎥 Son görülme: 2 dakika önce
                       
[Yüz Profili]  [Detaylar]  [Sil]
```

### İstatistik Kartları:
```
🟢 Vardiyada: 8/12
🔵 IoT Tanımlı: 8 personel
🟠 İzinli: 2 personel
🔴 Yoklama: 2 personel
```

## 🛠️ Sorun Giderme

### Personel Tanınmıyor
1. Fotoğraf kalitesini kontrol et (net, frontal, iyi ışık)
2. Güven eşiğini düşür (%85 → %75)
3. Kamera açısını ayarla
4. Yeni fotoğraf ekle (farklı açılardan)

### Kamera Bağlantı Hatası
1. WiFi bağlantısını kontrol et
2. API URL'sini kontrol et
3. Camera ID'nin doğru olduğundan emin ol

### Yanlış Tespit
1. Güven eşiğini yükselt (%85 → %90)
2. Benzer görünümlü personeller için farklı açılardan foto ekle
3. Test modunda manuel onay ekle

## 🎯 Önerilen Kamera Yerleşimi

1. **Giriş Kapısı**: Check-in/out için (zorunlu)
2. **Salon**: Çalışma alanı takibi
3. **Mutfak**: Gıda güvenliği için
4. **Kasa**: Güvenlik için
5. **Depo**: Stok takibi

## 📈 Gelişmiş Özellikler

### Planlanan:
- [ ] Duygu analizi (müşteri hizmeti için)
- [ ] Maske takma kontrolü
- [ ] Üniforma kontrolü
- [ ] Aktivite tanıma (çalışıyor/dinleniyor)
- [ ] Vardiya optimizasyonu AI önerileri

## 💡 İpuçları

1. **QR kod yöntemi daha kolay**: Yüz tanıma karmaşıksa QR ile başlayın
2. **Kamera açısı önemli**: 45° yukarıdan ideal
3. **Aydınlatma kritik**: Giriş kapısına ek ışık ekleyin
4. **Test edin**: İlk hafta manuel kontrolle paralel çalıştırın
5. **Backup**: Manuel vardiya kaydı seçeneğini açık tutun

## 🔐 Gizlilik & Güvenlik

- Yüz verileri şifreli saklanır
- KVKK uyumlu (açık rıza alınır)
- Personel istediği zaman yüz profilini silebilir
- Kamera görüntüleri 7 gün sonra otomatik silinir
- Sadece yetkililer vardiya kayıtlarını görebilir

## 📞 Destek

Sorun yaşarsanız:
1. `console.log` çıktılarını kontrol edin
2. `/api/business/staff-detection` endpoint'ini test edin
3. ESP32 seri port loglarını inceleyin

---

✨ **Başarılar!** IoT personel tanıma sisteminiz hazır!
