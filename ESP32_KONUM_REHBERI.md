# 📍 ESP32-CAM Konum Belirleme ve Test Rehberi

## 🎯 Yapılan Değişiklikler

### 1. İşletme Menüsü Kaldırıldı ✅
- Header'dan "İşletme" butonu kaldırıldı
- Mobil menüden "İşletme" butonu kaldırıldı  
- İşletme paneli ayrı sayfada: `/business`
- Yeni "IoT Cam" butonu eklendi (ESP32 Dashboard için)

### 2. Header Profesyonelleştirildi ✅
- Gereksiz butonlar temizlendi
- Daha düzenli görünüm
- Responsive tasarım iyileştirildi
- Sadece temel özellikler gösteriliyor

### 3. ESP32 Konum Belirleme Sistemi Eklendi ✅
- Harita üzerinden konum seçme
- Reverse geocoding ile adres alma
- Cihaz kartlarına "Konum Ayarla" butonu
- Koordinatların görüntülenmesi

## 🚀 ESP32-CAM Konum Belirleme Adımları

### Adım 1: Dashboard'da Cihaz Ekle
1. ESP32 dashboard'una git: `localhost:3001/esp32`
2. ESP32-CAM IP adresini gir (örn: `192.168.1.9`)
3. "Cihaz Ekle" butonuna tıkla

### Adım 2: Konum Seç
1. Otomatik olarak harita açılır
2. Harita üzerinde ESP32-CAM'in fiziksel konumuna tıkla
3. Koordinatlar ve adres otomatik görünür
4. "Konumu Onayla" butonuna tıkla

### Adım 3: Arduino Kodunu Güncelle
ESP32-CAM Arduino kodunda şu satırları değiştir:

```cpp
// Koordinatlar (kendi lokasyonunuzu girin)
JsonObject coordinates = doc.createNestedObject("coordinates");
coordinates["lat"] = 39.9334; // Dashboard'dan aldığın LAT
coordinates["lng"] = 32.8597; // Dashboard'dan aldığın LNG
```

**Örnek:**
Dashboard'da `39.925180, 32.836956` seçtiysen:

```cpp
coordinates["lat"] = 39.925180;
coordinates["lng"] = 32.836956;
```

### Adım 4: ESP32'yi Yeniden Yükle
1. Arduino IDE'de kodu düzenle
2. "Upload" butonuna tıkla
3. ESP32-CAM yeniden başlayacak
4. Seri monitörden kontrol et

## 🧪 Canlı Test Senaryoları

### Test 1: Direkt Bağlantı Testi
```
1. Tarayıcıda aç: http://192.168.1.9/stream
2. Kamera görüntüsü gelmeli
3. Görüntü geliyorsa ✅ ESP32 hazır
```

### Test 2: Status API Testi  
```
1. Tarayıcıda aç: http://192.168.1.9/status
2. JSON çıktısı görünmeli:
{
  "status": "online",
  "device_id": "esp32_cam_001",
  "ip": "192.168.1.9",
  "coordinates": {
    "lat": 39.925180,
    "lng": 32.836956
  }
}
3. JSON geliyorsa ✅ API çalışıyor
```

### Test 3: Dashboard'dan Stream Testi
```
1. localhost:3001/esp32 sayfasına git
2. Cihazı seç
3. "Başlat" butonuna tıkla
4. Stream görünmeli
5. Görüntü geliyorsa ✅ Proxy çalışıyor
```

### Test 4: Kalabalık Raporu Testi
```
1. Arduino Seri Monitörü aç (115200 baud)
2. Komut gir: test
3. ESP32 City-V API'sine rapor gönderecek
4. Başarılı mesajı görünmeli:
   "🎉 Rapor başarıyla gönderildi!"
5. Mesaj geliyorsa ✅ API entegrasyonu çalışıyor
```

### Test 5: Gerçek Zamanlı Kalabalık Analizi
```
1. ESP32 30 saniyede bir otomatik analiz yapar
2. Seri monitörden logları izle:
   "📸 Frame alındı: 640x480, 25600 bytes"
   "📊 Analiz detayı: koyu=45%, hareket=30%, açık=25%"
   "📊 Tespit edilen kalabalık seviyesi: moderate"
3. Analiz çalışıyorsa ✅ Kalabalık algılama aktif
```

## 🔧 Arduino Seri Monitör Komutları

### Kullanılabilir Komutlar:
```
status (s)   - Cihaz durumunu göster
test (t)     - Test raporu gönder
analyze (a)  - Anlık kalabalık analizi
restart (r)  - ESP32'yi yeniden başlat
wifi (w)     - WiFi'yi yeniden bağla
camera (c)   - Kamera testi
help (h/?)   - Yardım menüsü
```

## 📊 City-V API Rapor Formatı

ESP32-CAM şu format ile rapor gönderir:

```json
{
  "locationId": "Test Lokasyonu",
  "crowdLevel": "moderate",
  "timestamp": 125634,
  "deviceId": "esp32_cam_001",
  "source": "esp32cam",
  "version": "2.0",
  "coordinates": {
    "lat": 39.925180,
    "lng": 32.836956
  },
  "metadata": {
    "ip": "192.168.1.9",
    "rssi": -45,
    "uptime": 125634,
    "freeHeap": 245678
  },
  "camera": {
    "initialized": true,
    "framesize": 6,
    "quality": 15
  }
}
```

## 🎬 Kurulum Sırası (Özet)

1. ✅ ESP32-CAM'e Arduino kodunu yükle
2. ✅ WiFi bağlantısını kontrol et (Seri monitör)
3. ✅ IP adresini not al
4. ✅ Dashboard'da cihaz ekle
5. ✅ Haritadan konum seç
6. ✅ Arduino kodunda koordinatları güncelle
7. ✅ ESP32'yi yeniden yükle
8. ✅ Dashboard'dan stream test et
9. ✅ Kalabalık raporlarını izle

## 🐛 Sorun Giderme

### Stream Görünmüyor
```
1. http://ESP32_IP/stream direkt test et
2. ESP32 ve bilgisayar aynı ağda mı kontrol et
3. Firewall kurallarını kontrol et
4. Arduino kodunda CORS header var mı kontrol et
```

### API'ye Rapor Gitmiyor  
```
1. WiFi bağlantısını kontrol et: wifi komutunu gönder
2. cityv_host doğru mu kontrol et
3. HTTPS sertifika sorunları olabilir
4. test komutu ile manuel test et
```

### Kamera Başlamıyor
```
1. 5V/2A güç kaynağı kullan
2. Kamera kabloları sağlam mı kontrol et
3. GPIO0'ı çıkar (programlama modundan çık)
4. ESP32'yi yeniden başlat: restart komutu
```

## 🎉 Başarı Göstergeleri

✅ Seri monitörde: "ESP32-CAM BAŞARIYLA HAZIR!"
✅ Dashboard'da: Cihaz "Çevrimiçi" olarak görünüyor
✅ Stream çalışıyor ve görüntü net
✅ Her 30 saniyede kalabalık raporu gönderiliyor
✅ City-V API'si raporları alıyor

## 📚 Ek Kaynaklar

- ESP32-CAM Pinout: [AI-Thinker Model]
- Arduino Kütüphaneler: esp_camera, WiFi, HTTPClient, ArduinoJson
- City-V API Docs: /api/esp32/crowd-report
- Dashboard: localhost:3001/esp32

## 💡 İpuçları

1. **Güç**: ESP32-CAM'e en az 2A akım sağlayın
2. **Konum**: Haritada tam olarak kameranın olduğu yeri seçin
3. **Test**: Her değişiklikten sonra "test" komutu ile manuel test edin
4. **Log**: Seri monitörü sürekli açık tutun, hataları görebilirsiniz
5. **Koordinat**: Arduino kodunda koordinatları 6 ondalık basamak kullanın

---

**Hazırlayan:** City-V Development Team
**Tarih:** Ocak 2025
**Versiyon:** 2.0
