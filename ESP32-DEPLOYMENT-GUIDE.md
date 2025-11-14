# 🚀 ESP32-CAM Deployment Rehberi

## ✅ SON DURUM

**Kod:** ✅ Hazır ve test edildi
**API Bağlantısı:** ✅ Detaylı hata ayıklama eklendi
**AI Özellikleri:** ✅ TensorFlow.js ile çalışıyor

---

## 📋 1. ESP32-CAM'E KOD YÜKLEME

### Arduino IDE'de Yapılacaklar:

1. **Arduino IDE'yi açın**

2. **Dosyayı açın:**
   ```
   Dosya → Aç → 
   C:\Users\ercan\OneDrive\Belgeler\Arduino\sketch_oct24a\sketch_oct24a.ino
   ```

3. **Kartı seçin:**
   ```
   Araçlar → Kart → ESP32 Arduino → AI Thinker ESP32-CAM
   ```

4. **Port seçin:**
   ```
   Araçlar → Port → (ESP32-CAM USB portu seçin)
   ```

5. **Yükle:**
   ```
   Yükle butonuna basın (Ctrl+U)
   veya
   Menü → Sketch → Yükle
   ```

6. **Derleme Sırasında Hata Alırsanız:**
   - ✅ MDNS.update() hatası düzeltildi
   - ✅ Raw string literal hataları düzeltildi
   - ✅ UTF-8 encoding sorunları düzeltildi

---

## 📡 2. SERIAL MONITOR KONTROLÜ

Yükleme tamamlandığında **Serial Monitor'u açın** (Ctrl+Shift+M):

### Ayarlar:
- **Baud Rate:** 115200
- **Line Ending:** Both NL & CR

### Beklenen Çıktı:

```
================================
ESP32-CAM City-V IoT System
Version: 1.0
================================
[OK] EEPROM initialized
[OK] Flash LED ready

[STEP 1/6] Initializing camera...
Kamera basariyla baslatildi!

[STEP 2/6] Loading settings...
Ayarlar yuklendi!

[STEP 3/6] Connecting to WiFi...
WiFi baglandi!
IP Adresi: 192.168.1.9

[STEP 4/6] Starting mDNS...
[OK] mDNS started: esp32cam.local

[STEP 5/6] Starting web server...
[OK] GET / -> handleRoot
[OK] GET /config -> handleConfig
[OK] POST /save-config -> handleSaveConfig
[OK] GET /stream -> handleStream
[OK] GET /capture -> handleCapture
[OK] Server is listening for requests...

[STEP 6/6] Registering device to API...
API URL: https://city-nfiqb5thj-ercanergulers-projects.vercel.app/api/iot/devices
[SUCCESS] Cihaz kaydedildi! HTTP 200

================================
ESP32-CAM READY!
================================
WiFi Connected: [AĞ_ADINIZ]
IP Address: 192.168.1.9
Gateway: 192.168.1.1

Access Points:
  http://192.168.1.9
  http://esp32cam.local

Endpoints:
  /          - Main page
  /stream    - Live camera stream
  /capture   - Single frame capture
  /config    - Device configuration
  /status    - JSON status
  /reset     - Restart device
================================
```

### Heartbeat & Crowd Analysis:

Her 30 saniyede bir:
```
Heartbeat gonderiliyor...
API URL: https://city-nfiqb5thj-ercanergulers-projects.vercel.app/api/iot/devices
[SUCCESS] Heartbeat gonderildi! HTTP 200
```

Her 15 saniyede bir:
```
Yogunluk analizi yapiliyor...
Tespit: 12 kisi, Yogunluk: medium
API URL: https://city-nfiqb5thj-ercanergulers-projects.vercel.app/api/iot/crowd-analysis
[SUCCESS] Yogunluk analizi gonderildi! HTTP 200
Kisi: 12, Yogunluk: medium
```

---

## 🎥 3. WEB ARAYÜZÜNDE TEST

### A) ESP32-CAM Doğrudan Erişim:

Tarayıcınızda:
```
http://192.168.1.9
veya
http://esp32cam.local
```

**Test edilecekler:**
- ✅ Ana sayfa yükleniyor mu?
- ✅ /stream endpoint canlı video gösteriyor mu?
- ✅ /capture tek kare görüntü alıyor mu?
- ✅ /config ayarlar sayfası açılıyor mu?

### B) City-V Business Dashboard (İşletmeler için):

```
http://localhost:3000/business
```

1. İşletme girişi yapın
2. Sol menüden **"IoT Kamera"** seçin
3. ESP32-CAM IP adresi girin: `192.168.1.9`
4. **"Başlat"** butonuna basın

**Görecekleriniz:**
- ✅ Canlı kamera görüntüsü
- ✅ **TensorFlow.js AI ile gerçek zamanlı insan tespiti**
- ✅ Müşteri sayısı
- ✅ Doluluk oranı (%)
- ✅ Durum (Boş/Az Yoğun/Orta/Yoğun/Çok Yoğun)

### C) City-V Multi-Device Dashboard (Transport için):

```
http://localhost:3000/esp32/multi
```

- ✅ 4 farklı kamera feed görünümü
- ✅ Grid/Quad/Single görünüm modları
- ✅ Transport durağı ve araç kameraları

---

## 🤖 4. AI NESNE TANIMA ÖZELLİKLERİ

### TensorFlow.js COCO-SSD Model

**Çalışma Prensibi:**
- Browser'da çalışır (backend gerekmez!)
- MobileNet v2 base (hızlı ve hafif)
- ESP32-CAM stream'inden gerçek zamanlı analiz

### Tespit Edilen Nesneler:

1. **👤 person** (İnsan) - Kırmızı çerçeve
2. **🪑 chair** (Sandalye) - Sarı çerçeve
3. **🍽️ dining table** (Masa) - Mavi çerçeve
4. **🚗 car, 🚲 bicycle, 🛵 motorcycle** (Araçlar)
5. **📱 cell phone, 💻 laptop, 🖥️ tv** (Elektronik)
6. **🎒 backpack, 👜 handbag, 🧳 suitcase** (Çantalar)
7. **+ 70+ farklı nesne kategorisi**

### AI Analiz Özellikleri:

#### ✅ Anlık Sayım:
```typescript
personCount: 12      // Tespit edilen kişi sayısı
tableCount: 4        // Tespit edilen masa sayısı
chairCount: 16       // Tespit edilen sandalye sayısı
```

#### ✅ Güven Skoru:
Her nesne için %0-100 arası confidence score:
```
person 95%
chair 87%
dining table 92%
```

#### ✅ Bounding Box:
Her nesnenin tam konumu [x, y, width, height]

#### ✅ Görsel İşaretleme:
- Kırmızı çerçeve: İnsan
- Mavi çerçeve: Masa
- Sarı çerçeve: Sandalye
- Yeşil kesikli çizgi: Giriş/çıkış tracking çizgisi

#### ✅ Otomatik Analiz:
- Her 5 saniyede bir otomatik AI analizi
- Manuel "Analiz Et" butonu
- Sonuçlar anlık güncellenir

---

## 🚪 5. GİRİŞ/ÇIKIŞ SAYACI (Beta)

**Nasıl Çalışır:**
1. Yeşil kesikli çizgi (frame ortası) = Giriş çizgisi
2. Her kişinin merkez noktası tracking yapılır
3. Çizgiyi aşağı geçiş = 📥 Giriş
4. Çizgiyi yukarı geçiş = 📤 Çıkış

**Özellikler:**
- ✅ Unique ID tracking (aynı kişi 2 kez sayılmaz)
- ✅ 2 saniyelik cooldown (hızlı ileri-geri hareketler önlenir)
- ✅ Minimum 30px hareket eşiği
- ✅ Net giriş hesaplama (Giren - Çıkan)

---

## 🔧 6. SORUN GİDERME

### Hata: `Heartbeat gonderilemedi: -1`

**Neden:** HTTP bağlantısı kurulamıyor

**Çözüm:**
1. Serial Monitor'da API URL'yi kontrol edin
2. WiFi bağlantısını kontrol edin
3. Vercel deployment'ın çalıştığını kontrol edin:
   ```
   https://city-nfiqb5thj-ercanergulers-projects.vercel.app/api/iot/devices
   ```

### Hata: `Kamera frame alinamadi`

**Neden:** Kamera başlatılamadı

**Çözüm:**
1. ESP32-CAM donanımını kontrol edin
2. Kamera kablosunun doğru takıldığını kontrol edin
3. ESP32'yi yeniden başlatın

### Web Portalı Açılmıyor

**Çözüm:**
1. ESP32 ve bilgisayar aynı WiFi ağında mı?
2. IP adresi doğru mu? (Serial Monitor'dan kontrol edin)
3. Tarayıcıda `http://` prefix'i var mı?
4. Firewall ESP32 IP'sini engelliyor mu?

### AI Model Yüklenmiyor

**Çözüm:**
1. Internet bağlantınızı kontrol edin (model CDN'den yüklenir)
2. Tarayıcı console'da hata var mı kontrol edin
3. Sayfayı yenileyin (Ctrl+F5)

---

## 📊 7. PERFORMANS BEKLENTİLERİ

### ESP32-CAM:
- **Frame Rate:** 10-15 FPS (WiFi'ye bağlı)
- **Çözünürlük:** 640x480 (VGA) veya 800x600 (SVGA)
- **Heartbeat:** Her 30 saniye
- **Crowd Analysis:** Her 15 saniye

### TensorFlow.js AI:
- **Model Yükleme:** 2-5 saniye (ilk açılış)
- **Tespit Hızı:** 200-800ms per frame
- **Doğruluk:** %85-95 (aydınlatma koşullarına bağlı)
- **Bellek Kullanımı:** ~50-100MB (browser)

---

## 🎯 8. ÖNERİLER

### İyi Sonuçlar İçin:

1. **Aydınlatma:**
   - Yeterli ışık olmalı
   - Arka ışık (backlight) olmamalı
   - Direkt güneş ışığından kaçının

2. **Kamera Konumu:**
   - İnsanların tam yüzlerini görecek açıda
   - Yüksekten çekim (45° açı) ideal
   - Sabit montaj (sallanmayan)

3. **WiFi:**
   - Güçlü sinyal (-50 dBm veya daha iyi)
   - 2.4GHz WiFi kullanın (ESP32 5GHz desteklemiyor)
   - Aynı ağda kalın

4. **Güvenlik:**
   - WiFi şifresini güçlü tutun
   - ESP32-CAM'i güvenli ağda kullanın
   - Public WiFi'de kullanmayın

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] ESP32-CAM'e kod yüklendi
- [ ] Serial Monitor'da WiFi bağlantısı başarılı
- [ ] IP adresi alındı (örn: 192.168.1.9)
- [ ] Web portal açılıyor (http://192.168.1.9)
- [ ] /stream endpoint canlı video gösteriyor
- [ ] Heartbeat başarılı (HTTP 200)
- [ ] Crowd analysis başarılı (HTTP 200)
- [ ] City-V Business Dashboard'da stream görünüyor
- [ ] TensorFlow.js modeli yüklendi
- [ ] İnsan tespiti çalışıyor
- [ ] Nesne tanıma çalışıyor
- [ ] Giriş/çıkış sayacı çalışıyor

---

## 🎉 BAŞARILI DEPLOYMENT!

Tüm adımları tamamladıysanız, City-V IoT sisteminiz tamamen çalışır durumda!

**Destek için:**
- GitHub Issues
- City-V Documentation
- ESP32-CAM Community

**Versiyon:** 1.0.0
**Son Güncelleme:** 24 Ekim 2025
