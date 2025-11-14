# 🎛️ ESP32-CAM Gelişmiş Ayarlar Rehberi

## 🚀 Yeni Özellikler

ESP32-CAM artık tam özellikli bir web arayüzüne sahip! Müşterileriniz her ayarı kolayca yönetebilir.

### ✨ Eklenen Özellikler:

1. **🎨 Modern Web Arayüzü**
   - Gradient renkler ve profesyonel tasarım
   - Responsive - mobil uyumlu
   - Real-time istatistikler

2. **🧠 AI Ayarları (Enable/Disable)**
   - ✅ Human Detection (İnsan Tespiti)
   - 👤 Person Tracking (Kişi Takibi)
   - 😊 Face Detection (Yüz Tanıma)
   - 👥 Crowd Analysis (Kalabalık Analizi)

3. **🌐 Network Ayarları**
   - 🔄 DHCP / Static IP Toggle
   - 📍 Static IP Address
   - 🚪 Gateway Address
   - 🔒 Subnet Mask
   - ✅ Ayarlar EEPROM'a kaydedilir (kalıcı)

4. **⚙️ Sistem Ayarları**
   - 💡 LED Indicator (Gösterge LED'i)
   - 🔄 Auto Restart (Günlük otomatik restart)
   - 📤 Data Upload (Veri gönderimi)
   - 🔄 Manual Restart (Manuel yeniden başlat)

## 📖 Kullanım

### 1️⃣ Web Arayüzüne Erişim

```
http://[ESP32-IP-ADDRESS]
```

**Örnek:**
- http://192.168.1.100
- http://10.0.0.50

### 2️⃣ Ana Sayfa Bölümleri

#### 📊 İstatistikler (Üst Kısım)
- **IP Address**: Mevcut IP adresi
- **WiFi Signal**: Sinyal gücü (dBm)
- **Detected**: Tespit edilen kişi sayısı
- **Density**: Yoğunluk yüzdesi

#### 📹 Quick Access
- **📺 Live Stream**: Canlı kamera görüntüsü
- **📊 AI Status**: AI sistemi durumu (JSON)
- **✅ Test Camera**: Kamera testini aç

#### 🧠 AI Detection Settings
Tüm toggle'lar gerçek zamanlı çalışır:

| Ayar | Açıklama | Varsayılan |
|------|----------|-----------|
| Human Detection | İnsan tespiti algoritması | ✅ ON |
| Person Tracking | Kişi takip sistemi | ❌ OFF |
| Face Detection | Yüz tanıma özelliği | ❌ OFF |
| Crowd Analysis | Kalabalık yoğunluk analizi | ✅ ON |

**Kullanım:**
1. Toggle'a tıkla (yeşil = açık, gri = kapalı)
2. Ayar otomatik kaydedilir
3. Alert ile onay gelir

#### 🌐 Network Settings

**DHCP Modu (Varsayılan):**
- Otomatik IP atar
- Router'dan IP alır
- Plug & play

**Static IP Modu:**
1. DHCP toggle'ını kapat
2. Statik IP form alanları açılır
3. Bilgileri doldur:
   - **Static IP Address**: 192.168.1.100
   - **Gateway**: 192.168.1.1
   - **Subnet Mask**: 255.255.255.0
4. **💾 Save Static IP** butonuna tıkla
5. Cihaz yeniden başlar
6. Yeni IP adresiyle erişim sağla

**Örnek Yapılandırma:**
```
IP Address:  192.168.1.100
Gateway:     192.168.1.1
Subnet:      255.255.255.0
```

#### ⚙️ System Settings

| Ayar | Açıklama | Kullanım |
|------|----------|----------|
| LED Indicator | WiFi durum LED'i | ON = WiFi bağlı, OFF = Bağlı değil |
| Auto Restart | Günlük otomatik yeniden başlat | ON = Her gün 03:00'da restart |
| Data Upload | Veri gönderimi | OFF = Sadece lokal çalışır |

**Butonlar:**
- **🔄 Reset WiFi**: WiFi ayarlarını sıfırlar, hotspot moduna döner
- **🔄 Restart Device**: Cihazı hemen yeniden başlatır

## 🔧 API Endpoints

### GET /
Ana sayfa - Gelişmiş ayarlar paneli

### GET /stream
MJPEG canlı video stream

### GET /status
AI sistem durumu (JSON)
```json
{
  "device": "CityV-AI-Professional-v4.0",
  "status": "PROFESSIONAL",
  "humans": 5,
  "density": 32.5,
  "sensitivity": 90,
  "resolution": 128,
  "uptime": 123456,
  "fps": 20
}
```

### GET /api/setting
Ayar güncelleme
```
/api/setting?type=human&enabled=1
/api/setting?type=tracking&enabled=0
/api/setting?type=face&enabled=1
/api/setting?type=crowd&enabled=1
/api/setting?type=led&enabled=1
/api/setting?type=restart&enabled=0
/api/setting?type=upload&enabled=1
```

**Parametreler:**
- `type`: human, tracking, face, crowd, led, restart, upload
- `enabled`: 1 (açık), 0 (kapalı)

### GET /api/static-ip
Statik IP yapılandırma
```
/api/static-ip?ip=192.168.1.100&gateway=192.168.1.1&subnet=255.255.255.0
```

**Parametreler:**
- `ip`: Statik IP adresi
- `gateway`: Gateway adresi
- `subnet`: Subnet mask

**Sonuç:** Ayarlar EEPROM'a kaydedilir ve cihaz restart atar.

### GET /api/restart
Cihazı yeniden başlat
```
/api/restart
```

### GET /reset-wifi
WiFi ayarlarını sıfırla
```
/reset-wifi
```

## 💾 EEPROM Yapısı

Tüm ayarlar kalıcı olarak EEPROM'a kaydedilir:

```cpp
struct CameraSettings {
  bool humanDetection = true;      // İnsan tespiti
  bool personTracking = false;     // Kişi takibi
  bool faceDetection = false;      // Yüz tanıma
  bool crowdAnalysis = true;       // Kalabalık analizi
  bool ledIndicator = true;        // LED göstergesi
  bool autoRestart = false;        // Otomatik restart
  bool dataUpload = true;          // Veri gönderimi
  bool useStaticIP = false;        // Statik IP kullan
  char staticIP[16] = "";          // Statik IP adresi
  char gateway[16] = "";           // Gateway adresi
  char subnet[16] = "";            // Subnet mask
};
```

**Kayıt Adresi:** EEPROM adres 100
**Boyut:** ~100 byte

## 🎯 Müşteri Kullanım Senaryoları

### Senaryo 1: Temel Kurulum (DHCP)
1. ESP32'yi prize tak
2. WiFi'ye bağlan (ilk kurulumda hotspot)
3. Web arayüzüne git
4. Live Stream'i kontrol et
5. Hazır! ✅

### Senaryo 2: Statik IP Kurulumu
```
Problem: IP adresi sürekli değişiyor
Çözüm: Static IP kullan

Adımlar:
1. Web arayüzüne git
2. Network Settings bölümü
3. DHCP toggle'ını kapat
4. IP bilgilerini gir:
   - IP: 192.168.1.100
   - Gateway: 192.168.1.1
   - Subnet: 255.255.255.0
5. Save Static IP
6. Cihaz restart atar
7. Yeni IP'den eriş: http://192.168.1.100
```

### Senaryo 3: Personel Tanıma Kapatma
```
Durum: Sadece kalabalık takibi isteniyor, yüz tanıma gerekmiyor

Adımlar:
1. Web arayüzüne git
2. AI Detection Settings
3. "Face Detection" toggle'ını kapat
4. "Person Tracking" toggle'ını kapat
5. Sadece "Human Detection" ve "Crowd Analysis" açık kalır
```

### Senaryo 4: LED Göstergesini Kapatma
```
Durum: LED ışığı müşterileri rahatsız ediyor

Adımlar:
1. Web arayüzüne git
2. System Settings
3. "LED Indicator" toggle'ını kapat
4. LED anında söner
```

## 🔒 Güvenlik

### Önerilen Ayarlar:
- 🔐 ESP32'yi sadece local network'te tut
- 🚫 İnternete doğrudan expose etme
- ✅ Strong WiFi password kullan
- 🔄 Düzenli firmware güncellemeleri

### Port Forwarding (İsteğe Bağlı):
Uzaktan erişim için router'da port forwarding yap:
```
External Port: 8080
Internal IP: 192.168.1.100
Internal Port: 80
Protocol: TCP
```

**Erişim:** http://[public-ip]:8080

## 🐛 Sorun Giderme

### Web Arayüzü Açılmıyor
**Sorun:** Tarayıcıda sayfa yüklenmiyor
**Çözüm:**
1. ESP32'nin IP adresini kontrol et
2. Aynı WiFi ağında olduğundan emin ol
3. Ping at: `ping 192.168.1.100`
4. Serial Monitor'dan IP'yi kontrol et

### Static IP Çalışmıyor
**Sorun:** Static IP ayarladım ama DHCP alıyor
**Çözüm:**
1. IP range'ini kontrol et (router'ın DHCP range'inin dışında olmalı)
2. Gateway ve subnet doğru mu kontrol et
3. Router'da IP rezervasyonu yap (MAC adresine göre)
4. Reset WiFi yap ve tekrar dene

### Ayarlar Kaydedilmiyor
**Sorun:** Ayar yapıyorum ama restart sonrası eski haline dönüyor
**Çözüm:**
1. EEPROM dolmuş olabilir - factory reset yap
2. Serial Monitor'dan "💾 Settings saved" mesajını kontrol et
3. EEPROM kapasitesini kontrol et (512 byte)

### LED Göstergesi Yanmıyor
**Sorun:** LED Indicator ON ama LED yanmıyor
**Çözüm:**
1. WiFi bağlantısını kontrol et (LED sadece WiFi bağlıyken yanar)
2. Flash LED pin'i kontrol et (GPIO 4)
3. Donanım arızası - LED fiziksel kontrol

## 📊 Performans

### Önerilen Ayarlar (Maksimum Performans):
```
✅ Human Detection: ON
❌ Person Tracking: OFF (CPU yoğun)
❌ Face Detection: OFF (CPU yoğun)
✅ Crowd Analysis: ON
✅ LED Indicator: ON
❌ Auto Restart: OFF (stabil sistemlerde gereksiz)
✅ Data Upload: ON
```

### Pil Tasarrufu Modu:
```
✅ Human Detection: ON
❌ Person Tracking: OFF
❌ Face Detection: OFF
❌ Crowd Analysis: OFF
❌ LED Indicator: OFF
❌ Data Upload: OFF (sadece local)
```

## 🎓 İleri Seviye

### Özel API İstekleri (JavaScript)
```javascript
// Ayar değiştir
fetch('/api/setting?type=human&enabled=1')
  .then(r => r.text())
  .then(d => console.log(d));

// Static IP ayarla
fetch('/api/static-ip?ip=192.168.1.100&gateway=192.168.1.1&subnet=255.255.255.0')
  .then(r => r.text())
  .then(d => console.log(d));

// Durumu oku
fetch('/status')
  .then(r => r.json())
  .then(d => console.log('Humans:', d.humans));
```

### Python Entegrasyonu
```python
import requests

# ESP32 IP
ESP32_IP = "192.168.1.100"

# Ayar değiştir
requests.get(f"http://{ESP32_IP}/api/setting?type=human&enabled=1")

# Durumu oku
status = requests.get(f"http://{ESP32_IP}/status").json()
print(f"Humans: {status['humans']}, Density: {status['density']}%")

# Static IP ayarla
requests.get(f"http://{ESP32_IP}/api/static-ip?ip=192.168.1.100&gateway=192.168.1.1&subnet=255.255.255.0")
```

## ✅ Checklist (Müşteriye Teslim)

- [ ] ESP32 WiFi'ye bağlandı
- [ ] Web arayüzü erişilebilir
- [ ] Live stream çalışıyor
- [ ] AI detection aktif
- [ ] Static IP yapılandırıldı (gerekirse)
- [ ] LED indicator ayarlandı
- [ ] Personel tanıma ayarlandı (ihtiyaca göre)
- [ ] Data upload ayarlandı
- [ ] Müşteriye kullanım eğitimi verildi

## 🎉 Tamamlandı!

ESP32-CAM artık müşteri dostu, tam özellikli bir IoT kamera sistemi! 

**Yeni Özelliklerin Listesi:**
✅ Modern web arayüzü
✅ Enable/Disable her özellik
✅ Statik IP desteği (kalıcı)
✅ EEPROM'da ayar saklama
✅ Real-time istatistikler
✅ LED kontrol
✅ Uzaktan restart
✅ WiFi reset

Müşterileriniz artık tüm ayarları web'den yönetebilir! 🚀
