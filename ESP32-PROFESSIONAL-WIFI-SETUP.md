# 📡 ESP32-CAM Professional WiFi Setup Guide
## CityV Court-Approved Detection System

---

## 🌟 PROFESYONEL WİFİ ÖZELLİKLERİ

### ✅ Dahil Olan Özellikler

1. **WiFiManager ile Kolay Kurulum**
   - İlk açılışta otomatik AP (Access Point) modu
   - Web tabanlı WiFi ayarları
   - SSID/Password kaydetme
   - Otomatik bağlantı

2. **Statik IP Desteği**
   - İsteğe bağlı statik IP konfigürasyonu
   - Gateway, subnet, DNS ayarları
   - Network yöneticileri için ideal

3. **OTA (Over-The-Air) Güncellemeler**
   - Kablosuz firmware güncelleme
   - Arduino IDE'den direkt upload
   - Uzaktan bakım desteği

4. **Web Yönetim Paneli**
   - Gerçek zamanlı status dashboard
   - Sistem metrikleri görüntüleme
   - Uzaktan recalibration
   - WiFi reset
   - Offline data senkronizasyonu

5. **mDNS Desteği**
   - Kolay erişim: `http://cityv-cam-pro.local`
   - IP adresi ezberlemek gerekmez

6. **API Konfigürasyonu**
   - Custom API URL ayarlama
   - Device/Camera ID yönetimi
   - Preferences ile kalıcı saklama

---

## 🔧 İLK KURULUM

### Adım 1: Gerekli Kütüphaneler

Arduino IDE → Tools → Manage Libraries:

```
1. WiFiManager by tzapu (v2.0.16-rc.2+)
2. ArduinoJson by Benoit Blanchon (v6.21+)
3. ESP32 Camera (by Espressif - Core'da dahil)
```

### Adım 2: ESP32 Kart Ayarları

Arduino IDE → Tools:
```
Board: "AI Thinker ESP32-CAM"
CPU Frequency: "240MHz (WiFi/BT)"
Flash Frequency: "80MHz"
Flash Mode: "QIO"
Flash Size: "4MB (32Mb)"
Partition Scheme: "Huge APP (3MB No OTA/1MB SPIFFS)"
Core Debug Level: "None"
Erase All Flash: "Disabled"
Port: [ESP32'nizin bağlı olduğu port]
```

### Adım 3: Kod Yükleme

1. `esp32-professional-detection.ino` dosyasını açın
2. **ÖNEMLİ**: Camera initialization kısmını `esp32-cam-cityv.ino`'dan kopyalayın (setup() içinde TODO bölümü)
3. Upload butonuna basın
4. GPIO0'ı GND'ye bağlayın (boot mode)
5. RESET butonuna basın
6. Upload tamamlandığında GPIO0 bağlantısını çıkarın
7. RESET butonuna tekrar basın

---

## 📱 İLK BAGLANTI (AP MODU)

### Adım 1: AP'ye Bağlanın

ESP32 açıldığında otomatik olarak AP moduna geçer:

```
SSID: CityV-Professional-CAM
Password: cityv2025
```

**Telefonunuz/Bilgisayarınızdan:**
1. WiFi ayarlarını açın
2. "CityV-Professional-CAM" ağını bulun
3. Şifre girin: `cityv2025`
4. Bağlantı kurulunca otomatik portal açılır

### Adım 2: WiFi Ayarları

Portal açılmazsa tarayıcınızda: `http://192.168.4.1`

**Ayarlar:**
1. "Configure WiFi" butonuna tıklayın
2. WiFi ağınızı seçin (veya manuel girin)
3. WiFi şifresini girin

**Opsiyonel Ayarlar:**
- **API URL**: `https://city-v.vercel.app` (varsayılan)
- **Device ID**: `ESP32-CAM-PRO-001` (varsayılan)
- **Camera ID**: `CAM-PROF-60` (varsayılan)

4. "Save" butonuna tıklayın
5. ESP32 otomatik olarak WiFi'ye bağlanır

---

## 🌐 STATIK IP YAPLANDIRMASI

### Kodda Statik IP Aktif Etme

`esp32-professional-detection.ino` dosyasında (satır ~65):

```cpp
// DEĞIŞTIRILECEK SATIR:
bool useStaticIP = false; // false → true yapın

// IP ADRESLERİNİ ÖZELLEŞTİRİN:
IPAddress staticIP(192, 168, 1, 100);  // ESP32'nin IP'si
IPAddress gateway(192, 168, 1, 1);     // Router IP
IPAddress subnet(255, 255, 255, 0);    // Subnet mask
IPAddress dns1(8, 8, 8, 8);            // Birincil DNS
IPAddress dns2(8, 8, 4, 4);            // İkincil DNS
```

### Network Yöneticisi İçin Notlar

**Önerilen IP Aralığı:**
- Router: `192.168.1.1`
- ESP32 Cihazlar: `192.168.1.100-199`
- Örnek: CAM-01 → .100, CAM-02 → .101, etc.

**Güvenlik Duvarı Ayarları:**
- İzin ver: Port 80 (Web server)
- İzin ver: Port 3232 (OTA updates)
- İzin ver: HTTPS çıkış (Neon DB için)

**DHCP Rezervasyonu Alternatifi:**
- Router'da MAC adresine göre IP rezerve edin
- Kodda `useStaticIP = false` bırakın
- Daha esnek, yönetimi kolay

---

## 🖥️ WEB YÖNETİM PANELİ

### Erişim Yöntemleri

**1. IP Adresi ile:**
```
http://192.168.1.100
```
(IP adresinize göre değişir)

**2. mDNS ile (tavsiye edilen):**
```
http://cityv-cam-pro.local
```

### Dashboard Özellikleri

#### 📊 System Status Card
- Device ID
- Camera ID
- IP Address
- WiFi Signal Strength (dBm)
- System Uptime

#### 🎯 Detection Status Card
- Detection Mode (Conservative/Balanced/Sensitive)
- Calibration Status
- Lighting Level
- Total Synced Records
- Offline Queue Size

#### 🔗 API Configuration Card
- API Base URL
- IoT Endpoint
- Mall Mode Status
- Mall/Floor/Zone Info (eğer aktifse)

#### 🛠️ Actions (Butonlar)
- **🔧 Recalibrate**: Manuel kalibrasyon başlat
- **📡 Reset WiFi**: WiFi ayarlarını sıfırla (AP moduna dön)
- **💾 Sync Offline Data**: SD karttaki veriyi senkronize et

### JSON Status API

Programatik erişim için:
```bash
curl http://192.168.1.100/status
```

Örnek response:
```json
{
  "device_id": "ESP32-CAM-PRO-001",
  "camera_id": "CAM-PROF-60",
  "ip": "192.168.1.100",
  "rssi": -52,
  "uptime": 3672,
  "mode": "balanced",
  "calibrated": true,
  "lighting": 145,
  "synced_count": 428,
  "offline_count": 0
}
```

---

## 🔄 OTA (OVER-THE-AIR) GÜNCELLEME

### Arduino IDE ile OTA

**Adım 1: Network Port Seçimi**

Arduino IDE → Tools → Port:
```
Network Ports:
  cityv-cam-pro at 192.168.1.100 (ESP32-CAM)
```

**Adım 2: Upload**

1. Kodu düzenleyin
2. Upload butonuna basın
3. OTA şifresi istenirse: `cityv2025`
4. Güncelleme başlar
5. ESP32 otomatik restart olur

### OTA Güvenlik

**Şifre Değiştirme:**

`setupOTA()` fonksiyonunda:
```cpp
ArduinoOTA.setPassword("cityv2025"); // Burası değiştirin
```

**Güvenlik Tavsiyeleri:**
- Prodüksiyon ortamında güçlü şifre kullanın
- OTA'yı sadece güvenli networklerde aktif edin
- Firewall ile port 3232'yi koruyun

---

## 🎯 API URL YÖNETİMİ

### Varsayılan URL

```cpp
String API_BASE_URL = "https://city-v.vercel.app";
```

### URL Değiştirme Yöntemleri

#### 1. Web Portal ile (Tavsiye Edilen)

1. `http://192.168.4.1` (AP modu) veya WiFi reset yap
2. Configure WiFi → API URL alanı
3. Yeni URL'yi girin
4. Save

#### 2. Kodda Değiştir

```cpp
String API_BASE_URL = "https://your-custom-domain.com";
```

#### 3. Serial Monitor ile (Gelişmiş)

TODO: Serial command interface eklenebilir

### Çoklu Ortam Desteği

**Development:**
```cpp
String API_BASE_URL = "http://192.168.1.50:3000"; // Local Next.js
```

**Staging:**
```cpp
String API_BASE_URL = "https://city-v-staging.vercel.app";
```

**Production:**
```cpp
String API_BASE_URL = "https://city-v.vercel.app";
```

---

## 🏢 MALL (AVM) MOD YAPLANDIRMASI

### Mall Zone Aktif Etme

Kod içinde:
```cpp
MallZone currentZone = {
  .mallId = 1,              // Neon DB'deki mall ID
  .floorId = 2,             // Bodrum=-1, Zemin=0, 1.Kat=1, 2.Kat=2
  .zoneName = "Ana Koridor", // Zone adı
  .zoneType = "corridor",    // corridor, entrance, food_court, escalator
  .isActive = true           // false → true yap
};
```

### Endpoint Otomatik Değişimi

Mall modu aktifse:
```
POST /api/mall/{mallId}/analytics
```

Mall modu kapalıysa:
```
POST /api/iot/crowd-analysis
```

### Çoklu Kamera Kurulumu

**Senaryo: 5 katlı AVM, her katta 3 kamera**

| Kamera | Mall ID | Floor | Zone | Zone Type |
|--------|---------|-------|------|-----------|
| CAM-01 | 1 | -1 | Otopark | entrance |
| CAM-02 | 1 | 0 | Ana Giriş | entrance |
| CAM-03 | 1 | 0 | Kasa Hattı | corridor |
| CAM-04 | 1 | 1 | Moda Koridor | corridor |
| CAM-05 | 1 | 2 | Food Court | food_court |
| CAM-06 | 1 | 2 | Yürüyen Merdiven | escalator |

**Her ESP32 için ayrı yapılandırma:**
```cpp
// CAM-01 için:
CAMERA_ID = "CAM-01";
currentZone = {1, -1, "Otopark", "entrance", true};

// CAM-05 için:
CAMERA_ID = "CAM-05";
currentZone = {1, 2, "Food Court", "food_court", true};
```

---

## 🔍 SORUN GİDERME

### Problem: AP Modu Açılmıyor

**Çözüm 1: Hard Reset WiFi**
```cpp
// setup() içine geçici ekle:
wifiManager.resetSettings();
delay(100);
ESP.restart();
```

**Çözüm 2: Erase Flash**

Arduino IDE → Tools → Erase Flash: "All Flash Contents" → Upload

### Problem: WiFi'ye Bağlanamıyor

**Kontrol Listesi:**
- [ ] WiFi SSID doğru mu?
- [ ] Şifre doğru mu?
- [ ] 2.4GHz ağ mı? (ESP32 sadece 2.4GHz destekler)
- [ ] Router görünür mü? (Hidden SSID sorunlu olabilir)
- [ ] MAC filtresi aktif mi?

**Debug:**
```cpp
Serial.println("SSID: " + WiFi.SSID());
Serial.println("RSSI: " + String(WiFi.RSSI()));
Serial.println("Status: " + String(WiFi.status()));
```

### Problem: Statik IP Çalışmıyor

**Kontrol:**
1. IP aralığı router'ın subnet'inde mi?
2. Gateway IP router IP'si mi?
3. IP başka cihaz tarafından kullanılıyor mu?
4. DHCP rezervasyonu çakışıyor mu?

**Test:**
```bash
ping 192.168.1.100
arp -a | grep 192.168.1.100
```

### Problem: OTA Görmüyor

**Arduino IDE Kontrol:**
- Tools → Port → Birkaç saniye bekleyin
- Network portlar listelenmiyor mu?

**Çözüm:**
1. ESP32 ve bilgisayar aynı network'te mi?
2. Firewall port 3232'yi engelliyor mu?
3. mDNS desteği var mı? (Windows: Bonjour Service)
4. ESP32 reboot ettikten sonra 30 saniye bekleyin

### Problem: Web Paneline Erişemiyorum

**1. IP Adresini Kontrol:**
```
Serial Monitor'dan bakın: "IP Address: 192.168.1.xxx"
```

**2. mDNS Test:**
```bash
ping cityv-cam-pro.local
```

**3. Port Test:**
```bash
curl http://192.168.1.100/status
```

**4. Firewall:**
- Windows Defender → Port 80'i aç
- Router firewall → Local LAN izin ver

---

## 📊 NETWORK PERFORMANS OPTİMİZASYONU

### WiFi Sinyal Kalitesi

**RSSI Değerleri:**
- **-30 dBm**: Mükemmel (çok yakın)
- **-50 dBm**: Harika (ideal çalışma mesafesi)
- **-60 dBm**: İyi (stabil çalışır)
- **-70 dBm**: Orta (aralıklı bağlantı kesilmeleri)
- **-80 dBm**: Zayıf (sık bağlantı sorunu)
- **-90 dBm**: Çok Zayıf (kullanılamaz)

**İyileştirme Önerileri:**
1. **Antena Yönü**: ESP32-CAM'ın PCB anteni yukarı baksın
2. **Metal Kasa**: Metal kutuda ise anten dışarıda olmalı
3. **WiFi Extender**: Güçlendirici kullanın
4. **5GHz Router**: 2.4GHz bandı sadece ESP32 için ayırın
5. **Kanal Değiştir**: Router'da en az yoğun kanalı seçin

### Bandwidth Yönetimi

**Veri Gönderimi:**
- Her 5 saniyede 1 POST request
- ~512 byte JSON payload
- Aylık veri: ~2.6 MB/camera

**Network Requirements:**
- Minimum: 1 Mbps down, 256 Kbps up
- Önerilen: 5 Mbps down, 1 Mbps up
- Latency: <500ms
- Uptime: 99%+

### Çoklu Kamera Network Planlaması

**10 Kamera için:**
- Toplam bandwidth: ~10 Mbps (safety margin ile)
- DHCP pool: 192.168.1.100-110 rezerve edin
- VLAN (opsiyonel): IoT cihazları için ayrı network
- QoS: ESP32 trafiğine öncelik verin

---

## 🔐 GÜVENLİK EN İYİ PRATİKLERİ

### 1. Varsayılan Şifreleri Değiştir

**AP Şifresi:**
```cpp
#define AP_PASSWORD "cityv2025" // Değiştirin!
```

**OTA Şifresi:**
```cpp
ArduinoOTA.setPassword("cityv2025"); // Değiştirin!
```

### 2. Network Segmentation

- IoT cihazları ayrı VLAN'da
- Guest network'ten izole edin
- Firewall rules ile sınırlandırın

### 3. HTTPS Kullanımı

API endpoints zaten HTTPS:
```cpp
String API_BASE_URL = "https://city-v.vercel.app"; // ✅
```

### 4. Fiziksel Güvenlik

- ESP32-CAM'ı kilitli kutuda tutun
- USB portuna erişimi kısıtlayın
- RESET butonunu koruyun

### 5. Firmware İmzalama (Gelişmiş)

TODO: Secure Boot implementasyonu

---

## 📋 ÜRETİM DAĞITIMI KONTROL LİSTESİ

### Donanım Hazırlığı
- [ ] ESP32-CAM test edildi
- [ ] SD kart takıldı (min 8GB)
- [ ] Güç kaynağı stabil (5V 2A)
- [ ] Montaj aparatı hazır
- [ ] Kablo yönetimi yapıldı

### Yazılım Yapılandırması
- [ ] Firmware yüklendi
- [ ] Camera çalışıyor
- [ ] WiFi bağlantısı test edildi
- [ ] API endpoint doğrulandı
- [ ] Device/Camera ID unique
- [ ] Mall zone ayarlandı (eğer gerekli)
- [ ] Statik IP yapılandırıldı (eğer gerekli)
- [ ] OTA şifresi değiştirildi

### Test Aşaması
- [ ] Empty room (0 kişi) test ✅
- [ ] Single person (1 kişi) test ✅
- [ ] Group (5-10 kişi) test ✅
- [ ] Crowd (20+ kişi) test ✅
- [ ] Lighting changes test ✅
- [ ] Network failure test ✅
- [ ] SD card fallback test ✅
- [ ] Web panel erişimi test ✅
- [ ] OTA update test ✅

### Dokümantasyon
- [ ] Network bilgileri kaydedildi
- [ ] IP adresleri dokümante edildi
- [ ] Şifreler güvenli yerde
- [ ] Montaj konumu not edildi
- [ ] Müşteriye teslim belgesi

### Müşteri Eğitimi
- [ ] Web panel kullanımı gösterildi
- [ ] Recalibration anlatıldı
- [ ] WiFi reset prosedürü
- [ ] Sorun giderme rehberi verildi
- [ ] Destek iletişim bilgileri

---

## 🆘 ACİL DURUM PROSEDÜRLERI

### ESP32 Yanıt Vermiyor

1. **Hard Reset**: RESET butonuna 5 saniye basın
2. **Power Cycle**: Gücü kes, 10 saniye bekle, aç
3. **Factory Reset**: GPIO0 + RESET ile boot mode
4. **Reflash**: Firmware'i yeniden yükle

### WiFi Bağlantısı Kesildi

```cpp
// Otomatik reconnect loop() içinde var:
if (WiFi.status() != WL_CONNECTED) {
  WiFi.reconnect();
}
```

**Manuel müdahale:**
- Web panel → Reset WiFi
- Veya hard reset → AP modu

### Neon Database Erişim Hatası

1. **Kontrol**: https://city-v.vercel.app erişilebilir mi?
2. **SD Queue**: Otomatik olarak SD karta kaydedilir
3. **Manuel Sync**: Web panel → Sync Offline Data
4. **API URL**: Doğru mu kontrol et

### Yanlış Sayım Yapıyor

1. **Recalibrate**: Web panel → Recalibrate butonu
2. **Mode Değiştir**: Conservative moda geç (kod)
3. **Lighting Check**: Aydınlatma değişti mi?
4. **Camera Clean**: Lens temizle
5. **Position Check**: Kamera açısı değişti mi?

---

## 📞 DESTEK & BAKIM

### Düzenli Bakım Takvimi

**Haftalık:**
- [ ] Web panel status kontrolü
- [ ] WiFi signal strength (>-60 dBm)
- [ ] SD card space kontrolü

**Aylık:**
- [ ] Lens temizliği
- [ ] Firmware güncellemesi (eğer varsa)
- [ ] Calibration refresh
- [ ] Network performans raporu

**3 Aylık:**
- [ ] Tam sistem testi
- [ ] Backup yapılandırma
- [ ] Şifre değişimi
- [ ] Donanım fiziksel kontrol

### Log Toplama (Debug için)

**Serial Monitor Log:**
1. Arduino IDE → Serial Monitor aç (115200 baud)
2. 5 dakika çalışmasını izle
3. Output'u kaydet

**Status JSON Export:**
```bash
curl http://192.168.1.100/status > status.json
```

**Network Diagnostics:**
```bash
ping -c 10 192.168.1.100
traceroute 192.168.1.100
```

### İletişim

- **Email**: support@cityv.ai
- **GitHub**: github.com/cityv/esp32-pro
- **Documentation**: city-v.vercel.app/docs
- **Emergency**: +90 XXX XXX XXXX

---

## 📚 EK KAYNAKLAR

### Kütüphane Dökümantasyonu

- **WiFiManager**: https://github.com/tzapu/WiFiManager
- **ArduinoJson**: https://arduinojson.org/
- **ESP32 Arduino Core**: https://docs.espressif.com/

### Video Tutorials

- ESP32-CAM WiFiManager Setup: [YouTube Link]
- OTA Update Guide: [YouTube Link]
- Professional Network Configuration: [YouTube Link]

### Topluluk

- **Discord**: discord.gg/cityv
- **Forum**: forum.cityv.ai
- **Stack Overflow**: Tag: [esp32-cam-cityv]

---

**Document Version**: 2.0 Professional WiFi  
**Last Updated**: December 6, 2025  
**Author**: CityV Development Team  
**Status**: ✅ Production Ready  
**Tested**: ESP32-CAM AI-Thinker Module

