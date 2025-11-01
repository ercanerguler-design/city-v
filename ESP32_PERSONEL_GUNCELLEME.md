# 🔄 ESP32-CAM Personel Tanıma Güncellemesi

## ✅ Yapılan Değişiklikler

Mevcut **esp32-cam-cityv.ino** dosyasına **personel tanıma sistemi eklendi**. Tüm önceki özellikler korundu:

### 🎯 Korunan Özellikler
- ✅ Real-time insan tespiti
- ✅ Profesyonel kalabalık analizi
- ✅ Isı haritası (heat mapping)
- ✅ Akıllı nesne tanıma
- ✅ Yüksek performans işleme
- ✅ WiFi Manager
- ✅ Web Server
- ✅ API entegrasyonu

### 🆕 Yeni Eklenen Özellikler
- ✅ QR kod okuma (personel kartları)
- ✅ Otomatik check-in/check-out
- ✅ LED geri bildirimleri
- ✅ Personel tespit API'si
- ✅ Konum takibi (zone tracking)

---

## 📥 Kurulum Adımları

### 1. Kütüphane Yükleme
Arduino IDE → **Sketch** → **Include Library** → **Manage Libraries**

Aşağıdaki kütüphaneyi yükle:
```
ESP32QRCodeReader by Pablo Bacho
```

Diğer kütüphaneler zaten yüklü olmalı:
- WiFiManager by tzapu
- ArduinoJson by Benoit Blanchon
- ESP32 board support

### 2. Kod Yükleme
1. Arduino IDE'yi aç
2. **Tools** → **Board** → **ESP32 Arduino** → **AI Thinker ESP32-CAM**
3. **Tools** → **Port** → (COM portunu seç)
4. **esp32-cam-cityv.ino** dosyasını aç
5. **Upload** butonuna tıkla
6. Yükleme başarılı olduğunda Serial Monitor'ü aç (115200 baud)

### 3. İlk Ayar
Kamera açıldığında göreceksin:
```
=====================================
   CITYV PROFESSIONAL AI CAMERA
   PRODUCTION READY - HIGH PERFORMANCE
=====================================

[STEP 1/6] 🧠 AI Systems Starting...
[STEP 2/6] ⚙️ Loading Settings...
[STEP 3/6] 📶 WiFi Connecting...
[STEP 4/6] 📹 Camera Initializing...
[STEP 5/6] 🌐 Web Server Starting...
[STEP 6/6] 🔗 API Registration...
[BONUS] 📱 Staff Recognition Starting...

✅ CITYV AI CAMERA SYSTEM READY!
Stream URL: http://192.168.1.100/stream
AI Analysis: ACTIVE
Heat Mapping: ENABLED
Performance Mode: MAXIMUM
Staff Recognition: ENABLED
```

---

## 🎮 Kullanım

### Personel QR Kod Okutma
1. Business Dashboard'dan personel ekle
2. "QR Kod" butonuna tıkla
3. QR kodu yazdır veya telefonda göster
4. QR'ı ESP32-CAM'e yaklaştır (10-20cm mesafe)
5. LED sinyallerini izle:
   - **3 yanıp sön** → Check-in başarılı ✅
   - **5 yanıp sön** → Check-out başarılı ✅
   - **1 uzun yanma** → Zaten vardiyada 👍
   - **Hızlı yanıp sönme** → Hata ❌

### API Ayarları
Kod içinde değiştirebilirsin (satır 56-58):
```cpp
String API_BASE_URL = "http://your-domain.vercel.app/api";
int CAMERA_ID = 1; // Her kameraya benzersiz ID
String LOCATION_ZONE = "Giris"; // Giriş, Salon, Mutfak, vs.
```

---

## 📊 Sistem Akışı

```
1. Personel QR kodu kameraya gösterir
   ↓
2. ESP32-CAM QR'ı okur ve parse eder (STAFF-{id}-{hash})
   ↓
3. API'ye POST gönderir:
   {
     "camera_id": 1,
     "staff_qr": "STAFF-123-abcd",
     "detection_type": "qr_scan",
     "location_zone": "Giris"
   }
   ↓
4. API kontrol eder:
   - Personel var mı?
   - Aktif mi?
   - Bugün check-in yaptı mı?
   ↓
5. İşlem:
   - İlk tarama → Check-in (vardiyaya giriş)
   - İkinci tarama → Check-out (vardiyadan çıkış)
   - Sonraki taramalar → Presence (tespit kaydı)
   ↓
6. LED geri bildirimi + Serial log
```

---

## 🔍 Debug / Sorun Giderme

### Serial Monitor Kontrolleri
```cpp
// Başarılı QR okuma:
📱 QR Kod tespit edildi!
   Data: STAFF-123-abc123
📤 Personel tespiti API'ye gönderiliyor...
✅ HTTP Kodu: 200
🎉 BAŞARILI PERSONEL TESPİTİ!
   Personel: Ahmet Yılmaz
   İşlem: check_in
   Mesaj: Vardiyaya giriş yapıldı
```

### Yaygın Hatalar

**❌ "Geçersiz QR kod formatı!"**
- QR kod STAFF- ile başlamalı
- Dashboard'dan oluşturulan QR kodları kullan

**❌ "WiFi bağlı değil!"**
- WiFi bağlantısını kontrol et
- Serial Monitor'de IP adresini gör

**❌ "Personel bulunamadı"**
- Personel database'de var mı?
- ID doğru mu?
- Status "active" mi?

**❌ HTTP 404 veya 500**
- API URL'yi kontrol et (API_BASE_URL)
- Backend çalışıyor mu?
- CORS ayarları doğru mu?

---

## 🎛️ İleri Seviye Ayarlar

### QR Tarama Hızı
```cpp
const unsigned long QR_COOLDOWN = 3000; // 3 saniye bekleme
```
Daha hızlı tarama için düşür (minimum 1000ms önerilir)

### QR Taramayı Devre Dışı Bırakma
```cpp
bool qrScanEnabled = false; // Sadece AI analizi çalışır
```

### Çoklu Kamera Kurulumu
Her kameraya farklı ID ve konum ver:
```cpp
// Kamera 1 - Giriş
int CAMERA_ID = 1;
String LOCATION_ZONE = "Giris";

// Kamera 2 - Salon
int CAMERA_ID = 2;
String LOCATION_ZONE = "Salon";

// Kamera 3 - Mutfak
int CAMERA_ID = 3;
String LOCATION_ZONE = "Mutfak";
```

---

## 📈 Performans

- **QR Okuma Hızı**: ~0.5-1 saniye
- **AI Analiz Hızı**: 1 saniye (değişmedi)
- **API Response**: ~200-500ms
- **Toplam İşlem**: ~2-3 saniye

**Not**: QR okuma AI analizini yavaşlatmaz, paralel çalışır!

---

## 🔐 Güvenlik

- QR kodlar hash içerir (brute-force koruması)
- API'de personel doğrulaması yapılır
- Sadece aktif personel kabul edilir
- Her tespit loglanır (audit trail)

---

## 🚀 Sonraki Adımlar

1. ✅ QR kod okuma çalışıyor
2. 🔄 Yüz tanıma (gelecek)
3. 🔄 RFID kart okuma (gelecek)
4. 🔄 Parmak izi (gelecek)

Şimdilik QR kod sistemi en hızlı ve güvenilir yöntem! 🎉
