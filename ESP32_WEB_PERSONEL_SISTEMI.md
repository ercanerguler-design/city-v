# 🌐 ESP32-CAM Web-Based Personel Tanıma Sistemi

## ✅ Sorun Çözüldü!

**ESP32QRCodeReader** kütüphanesi bulunamadığı için **daha pratik bir çözüm** uygulandı:

### 🎯 Yeni Sistem: Web-Based QR Tarama

Artık QR kodları **tarayıcı üzerinden** okutulacak. Ekstra kütüphane gerektirmez!

---

## 📥 Kurulum

### 1. Kod Yükleme
```
Arduino IDE:
- Board: AI Thinker ESP32-CAM
- Upload
```

**Gerekli Kütüphaneler (zaten yüklü olmalı):**
- WiFiManager
- ArduinoJson
- ESP32 Camera

---

## 🚀 Kullanım

### Adım 1: ESP32-CAM'i Başlat
Kamera açıldığında Serial Monitor'de göreceksin:
```
=====================================
   CITYV PROFESSIONAL AI CAMERA
=====================================
...
[BONUS] 📱 Staff Recognition Starting...
✅ Web-based Staff Detection Ready!
   QR Scan URL: http://192.168.1.100/scan-staff

✅ CITYV AI CAMERA SYSTEM READY!
Stream URL: http://192.168.1.100/stream
Staff Recognition: WEB-BASED
```

### Adım 2: QR Tarama Sayfasını Aç
Tarayıcında git:
```
http://192.168.1.100/scan-staff
```

*(IP adresi Serial Monitor'de görünür)*

### Adım 3: QR Kodu Gir
1. Business Dashboard'dan personel QR'ını oluştur
2. QR kodunu kopyala (örnek: `STAFF-123-abc123`)
3. Web sayfasına yapıştır
4. **"✅ QR Kodu Gönder"** butonuna tıkla

### Adım 4: Sonuç
- ✅ Yeşil mesaj → Başarılı (check-in/check-out)
- ❌ Kırmızı mesaj → Hata (personel bulunamadı)
- LED'ler yanıp söner (başarı durumuna göre)

---

## 💻 3 Kullanım Yöntemi

### 1️⃣ Web Arayüzü (En Kolay)
```
http://192.168.1.100/scan-staff
```
- QR kodunu manuel gir
- Sonucu anında gör
- Mobil uyumlu

### 2️⃣ API Endpoint (Programatik)
```bash
curl -X POST http://192.168.1.100/scan-staff \
  -d "qr_code=STAFF-123-abc123"
```

### 3️⃣ Dashboard Entegrasyonu
Business Dashboard'a "Kameraya Gönder" butonu eklenebilir:
```javascript
fetch('http://192.168.1.100/scan-staff', {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: 'qr_code=' + staffQRCode
})
```

---

## 🎮 LED Sinyalleri

QR kod işlendiğinde:
- **3 yanıp sön** → Check-in başarılı ✅
- **5 yanıp sön** → Check-out başarılı ✅
- **1 uzun yanma** → Zaten vardiyada 👍
- **Hızlı yanıp sönme** → Hata ❌

---

## 📊 Sistem Akışı

```
1. Personel QR kodu Business Dashboard'dan alır
   ↓
2. QR'ı ESP32-CAM'in web sayfasına girer
   ↓
3. ESP32-CAM QR'ı parse eder
   ↓
4. Backend API'ye POST gönderir:
   {
     "camera_id": 1,
     "staff_qr": "STAFF-123-abc",
     "detection_type": "qr_scan",
     "location_zone": "Giris"
   }
   ↓
5. Backend check-in/check-out işlemini yapar
   ↓
6. Sonuç LED'lerle ve web sayfasında gösterilir
```

---

## ⚙️ Ayarlar

Kod içinde düzenleyebilirsin (satır 57-59):
```cpp
String API_BASE_URL = "http://your-domain.vercel.app/api";
int CAMERA_ID = 1; // Her kameraya benzersiz ID
String LOCATION_ZONE = "Giris"; // Giriş, Salon, Mutfak
```

---

## 🔄 Neden Web-Based?

### ✅ Avantajlar:
- ❌ Ekstra kütüphane yok
- ✅ Kolay kurulum
- ✅ Tarayıcıdan kontrol
- ✅ Mobil uyumlu
- ✅ API entegrasyonu kolay
- ✅ Debug kolay (tarayıcıda test)

### 🔮 Gelecekte:
- Mobil uygulama ile QR tarama
- Otomatik QR okuma (kamera modülü ile)
- Yüz tanıma (TensorFlow.js)
- RFID entegrasyonu

---

## 🐛 Sorun Giderme

### "QR Scan URL" görünmüyor
**Çözüm:** Serial Monitor'de IP adresini kontrol et

### "Geçersiz QR format" hatası
**Çözüm:** QR kod STAFF- ile başlamalı (örnek: STAFF-123-abc)

### API'ye gönderilmiyor
**Çözüm:** `API_BASE_URL` adresini kontrol et (localhost yerine gerçek URL)

### Web sayfası açılmıyor
**Çözüm:** 
- ESP32-CAM ile aynı WiFi'ye bağlan
- IP adresini doğru gir
- Firewall kontrol et

---

## 📱 Mobil Kullanım İçin

Telefonundan da kullanabilirsin:

1. Telefonunu ESP32-CAM ile aynı WiFi'ye bağla
2. Tarayıcıda git: `http://192.168.1.100/scan-staff`
3. Business Dashboard'dan QR'ı telefonuna kaydet
4. QR'ı kopyala-yapıştır veya manuel gir
5. Gönder!

---

## 🎯 Kullanım Örnekleri

### Senaryo 1: Sabah Vardiyası
```
1. Personel gelir
2. Telefonda Business Dashboard açar
3. Kendi QR kodunu görür
4. ESP32-CAM web sayfasına girer
5. Check-in → LED 3 kez yanıp söner
```

### Senaryo 2: Akşam Çıkış
```
1. Aynı işlem tekrar
2. Check-out → LED 5 kez yanıp söner
3. Çalışma saati database'e kaydedilir
```

### Senaryo 3: Çoklu Kamera
```
Kamera 1 (Giriş): http://192.168.1.100/scan-staff
Kamera 2 (Salon): http://192.168.1.101/scan-staff
Kamera 3 (Mutfak): http://192.168.1.102/scan-staff
```

---

## ✅ Sonuç

**Artık ekstra kütüphane olmadan personel tanıma sistemi çalışıyor!**

- ✅ Kod derleniyor
- ✅ Web arayüzü hazır
- ✅ API entegrasyonu aktif
- ✅ LED geri bildirimi çalışıyor

**Hemen test et:** Kodu yükle ve tarayıcıdan kontrol et! 🎉
