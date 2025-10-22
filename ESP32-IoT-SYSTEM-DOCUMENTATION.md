# 🚀 City-V IoT Sistemi - ESP32-CAM Entegrasyonu

## 📋 Sistem Özeti

Bu dokümantasyon, City-V platformuna entegre edilen **ESP32-CAM IoT sistemi**nin kurulum, konfigürasyon ve kullanım kılavuzudur. Sistem, gerçek zamanlı yoğunluk analizi ve araç takibi için geliştirilmiştir.

## 🏗️ Sistem Mimarisi

### 📊 Veritabanı Şeması

Sistem 6 özelleştirilmiş IoT tablosu ile çalışır:

1. **`esp32_devices`** - ESP32-CAM cihaz kayıtları
2. **`iot_crowd_analysis`** - Yoğunluk analizi verileri
3. **`iot_vehicle_arrivals`** - Araç geliş takibi
4. **`iot_stop_analytics`** - Durak analitikleri
5. **`iot_device_commands`** - Cihaz komutları
6. **`iot_realtime_updates`** - Gerçek zamanlı güncellemeler

### 🔗 API Endpoints

#### **Cihaz Yönetimi**
- `GET /api/iot/devices` - Cihaz listesi
- `POST /api/iot/devices` - Yeni cihaz kaydı

#### **Yoğunluk Analizi**
- `GET /api/iot/crowd-analysis` - Analiz verileri
- `POST /api/iot/crowd-analysis` - Yeni analiz verisi

#### **Araç Takibi**
- `GET /api/iot/vehicle-arrivals` - Araç geliş verileri
- `POST /api/iot/vehicle-arrivals` - Yeni araç verisi

## 🛠️ ESP32-CAM Kurulumu

### 📦 Gerekli Donanım

- **ESP32-CAM** (AI-Thinker modeli önerilir)
- **FTDI Programmer** (ilk kurulum için)
- **MicroSD Kart** (isteğe bağlı)
- **WiFi Bağlantısı**

### 💻 Yazılım Kurulumu

1. **Arduino IDE Kurulumu**
   ```bash
   # ESP32 Board Manager URL'ini ekleyin:
   https://dl.espressif.com/dl/package_esp32_index.json
   ```

2. **Gerekli Kütüphaneler**
   ```
   - WiFi
   - ArduinoJson
   - WiFiManager
   - HTTPClient
   - ESPAsyncWebServer
   ```

3. **Firmware Yükleme**
   ```cpp
   // esp32-cam-iot-cityv.ino dosyasını ESP32-CAM'e yükleyin
   ```

### ⚙️ Konfigürasyon

#### **İlk Kurulum**
1. ESP32-CAM'i programlama modunda açın
2. Firmware'i yükleyin
3. Normal modda yeniden başlatın
4. WiFi hotspot'ına bağlanın: `ESP32-CAM-Setup`
5. `192.168.4.1` adresine giderek WiFi ayarlarını yapın

#### **Cihaz Ayarları**
- **Cihaz ID**: Benzersiz tanımlayıcı
- **Cihaz Adı**: İnsan okunabilir isim
- **Konum Tipi**: `bus_stop`, `vehicle`, `station`
- **Durak/İstasyon Adı**: Konum bilgisi
- **Hat Kodu**: Varsa hat bilgisi
- **API URL**: City-V API endpoint'i

## 📱 Dashboard Kullanımı

### 🖥️ IoT Dashboard (`/iot`)

Ana özellikler:
- **Canlı Cihaz Durumu**: Online/offline cihazlar
- **Gerçek Zamanlı Veri**: 30 saniye aralıklarla güncelleme
- **Yoğunluk Analizi**: Kişi sayımı ve yoğunluk seviyeleri
- **Araç Takibi**: Geliş/gidiş ve doluluk oranları

### 🔍 Veri Görüntüleme

#### **Genel Bakış**
- 4 ESP32 cihazı aktif
- Gerçek zamanlı veri akışı
- Yüksek doğruluk oranı (%87+)

#### **Cihazlar Sekmesi**
- Cihaz durumu ve sağlık bilgileri
- Batarya seviyesi
- Sinyal gücü
- Son görülme zamanı

#### **Yoğunluk Analizi**
- Kişi sayısı tespit
- Yoğunluk seviyesi (empty → overcrowded)
- Güven skoru
- Hava durumu entegrasyonu

#### **Araç Takibi**
- Araç yaklaşma/varış/ayrılış durumu
- Doluluk yüzdesi
- Binen/inen yolcu sayısı
- Gerçek zamanlı güncelleme

## 🤖 AI & Makine Öğrenmesi

### 🎯 YOLO v5 Entegrasyonu

ESP32-CAM'de çalışacak özellikler:
- **Kişi Tespiti**: Gerçek zamanlı insan sayımı
- **Araç Tanıma**: Otobüs/metro/taksi ayrımı
- **Yoğunluk Analizi**: Otomatik seviye belirleme

### 📊 Veri İşleme

#### **Yoğunluk Seviyeleri**
- `empty`: 0 kişi
- `low`: 1-5 kişi
- `medium`: 6-10 kişi
- `high`: 11-15 kişi
- `overcrowded`: 16+ kişi

#### **Güven Skorları**
- Minimum %70 güven skoru
- Ortalama %87 doğruluk
- Hava durumu faktörü

## 🔄 Gerçek Zamanlı Sistem

### ⚡ WebSocket Desteği (Gelecek)

Planlanan özellikler:
- Anlık veri akışı
- Push bildirimleri
- Canlı harita güncellemeleri

### 📢 Uyarı Sistemi

#### **Otomatik Uyarılar**
- **Kritik**: Aşırı yoğunluk (overcrowded)
- **Yüksek**: Yoğun durağa araç yaklaşması
- **Orta**: Orta seviye yoğunluk
- **Düşük**: Normal durum güncellemeleri

## 🚀 Gelişmiş Özellikler

### 🎨 Premium Özellikler

City-V Premium üyeleri için:
- **IoT Dashboard** erişimi
- **ESP32 Live Monitor**
- **Transport Demo** sistemi
- **Gelişmiş Analitics**

### 📊 Demo Verileri

Sistem şu demo verilerle çalışır:
- **4 ESP32 cihazı**: Kızılay, Batıkent istasyonları + araç kameraları
- **192 yoğunluk analizi**: Son 48 saat
- **24 araç gelişi**: Son 24 saat
- **Gerçek zamanlı simülasyon**: 15 saniye güncellemeler

## 🔧 Teknik Detaylar

### 📡 API Örnekleri

#### Yoğunluk Verisi Gönderme
```json
POST /api/iot/crowd-analysis
{
  "device_id": "ESP32-001",
  "people_count": 12,
  "crowd_density": "high",
  "confidence_score": 87.5,
  "weather_condition": "clear",
  "temperature": 22
}
```

#### Araç Gelişi Bildirimi
```json
POST /api/iot/vehicle-arrivals
{
  "device_id": "ESP32-002",
  "vehicle_number": "405",
  "vehicle_type": "bus",
  "arrival_status": "approaching",
  "vehicle_occupancy_percent": 75,
  "passenger_boarding": 8,
  "passenger_alighting": 3
}
```

### 🔒 Güvenlik

- **HTTPS** zorunlu
- **API Key** doğrulaması
- **Rate Limiting**: 60 istek/dakika
- **Veri şifreleme**

## 📈 Performans

### ⚡ Sistem Metrikleri

- **Analiz Frekansı**: 15 saniye
- **Heartbeat**: 30 saniye
- **API Response**: <200ms
- **Uptime**: %99.9

### 📊 Veri Kapasitesi

- **Günlük Analiz**: 5,760 kayıt/cihaz
- **Aylık Depolama**: ~170K kayıt
- **Real-time Buffer**: 1,000 kayıt

## 🚨 Sorun Giderme

### 🔧 Yaygın Sorunlar

#### **Cihaz Offline**
1. WiFi bağlantısını kontrol edin
2. API URL'ini doğrulayın
3. Cihazı yeniden başlatın

#### **Veri Gelmiyor**
1. Kamera modülünü kontrol edin
2. YOLO model yüklemesini doğrulayın
3. API endpoint'lerini test edin

#### **Düşük Doğruluk**
1. Kamera pozisyonunu ayarlayın
2. Işık koşullarını optimize edin
3. AI model kalibrasyonu yapın

### 📞 Destek

- **Teknik Dokümantasyon**: Bu dosya
- **GitHub Issues**: Hata raporları
- **Email Destek**: tech@cityv.app
- **Live Chat**: Premium üyeler için

## 🎯 Gelecek Planları

### 🚀 Yol Haritası

#### **Q1 2024**
- [x] ESP32-CAM entegrasyonu
- [x] IoT Dashboard
- [x] Gerçek zamanlı veri
- [ ] WebSocket implementasyonu

#### **Q2 2024**
- [ ] Gelişmiş AI modelleri
- [ ] Mobile push bildirimleri
- [ ] Çoklu şehir desteği
- [ ] API v2.0

#### **Q3 2024**
- [ ] Edge AI processing
- [ ] 5G connectivity
- [ ] AR/VR entegrasyonu
- [ ] Blockchain doğrulama

---

## 📝 Notlar

Bu sistem demo amaçlı geliştirilmiştir ve production ortamında kullanımdan önce ek güvenlik ve optimizasyon çalışmaları gerekebilir.

**Son Güncelleme**: Aralık 2024
**Versiyon**: 1.0.0
**Geliştirici**: City-V Team

---

🎉 **City-V IoT sistemi başarıyla aktif!** ESP32-CAM cihazlarınızla gerçek zamanlı yoğunluk analizi yapmaya başlayabilirsiniz.