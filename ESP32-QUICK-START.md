# 🎥 ESP32-CAM Hızlı Başlangıç

## 📍 Dosya Konumu
```
C:\Users\ercan\OneDrive\Masaüstü\Proje Cityv\city-v\esp32-cam-cityv.ino
```

## ⚡ 3 Adımda Başlat

### 1️⃣ Arduino IDE'de Aç
- Arduino IDE'yi başlat
- `esp32-cam-cityv.ino` dosyasını aç
- **Tools → Board → AI Thinker ESP32-CAM** seç

### 2️⃣ WiFi Ayarları (Satır 80-85)
```cpp
const char* ssid = "WIFI_ADI_BURAYA";          // 📡 Kendi WiFi'niz
const char* password = "WIFI_SIFRESI_BURAYA";  // 🔒 Şifreniz
```

### 3️⃣ Yükle!
1. **GPIO0 → GND** bağla (jumper ile)
2. **RESET** butonuna bas
3. Arduino IDE'de **Upload** (➡️)
4. Yükleme bitince **GPIO0 jumper'ını çıkar**
5. **RESET** butonuna tekrar bas

## 🌐 Kullanım

### Serial Monitor'den IP Öğren
```
✅ WiFi bağlandı!
🌐 IP Adresi: 192.168.1.9  ← BU IP'Yİ KOPYALA
```

### Dashboard'u Aç
1. Tarayıcı: **http://localhost:3000/esp32**
2. IP gir: **192.168.1.9**
3. "Canlı İzlemeyi Başlat" tıkla
4. AI analizi otomatik başlar! 🤖

## 🎯 Özellikler

- 🔴 **Canlı Stream**: Real-time MJPEG video
- 🤖 **AI Detection**: Kişi, masa, sandalye tespiti
- 📊 **Crowd Analysis**: Zone-based yoğunluk analizi
- 🎨 **Visual Marking**: Renkli bounding box'lar
- 📱 **Responsive**: Mobil uyumlu dashboard

## 🔗 API Endpoints

```http
GET http://192.168.1.9/stream   → Canlı video stream
GET http://192.168.1.9/status   → Cihaz durumu (JSON)
GET http://192.168.1.9/analyze  → Manuel analiz tetikle
```

## ❓ Sorun mu var?

**Detaylı kurulum:** `ESP32-CAM-KURULUM.md` dosyasına bakın

**Sık sorunlar:**
- ❌ Kamera başlamıyor → Güç kaynağını kontrol et (5V 2A)
- ❌ WiFi bağlanmıyor → SSID/şifre doğru mu? 2.4GHz mi?
- ❌ Upload hatası → GPIO0 → GND bağlı mı?
- ❌ Stream açılmıyor → Aynı ağda mısınız?

## 📄 Versiyon: v3.0 (2025-10-15)

**✨ Lansmana hazır! Başarılar! 🚀**
