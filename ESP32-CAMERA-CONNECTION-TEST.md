# ESP32-CAM Bağlantı Testi - 192.168.1.3

## ❌ Sorun
Browser console'da: `❌ Stream hatası: {}` 
Kamera stream URL'i: `http://192.168.1.3:80/stream`

## ✅ Database Kontrolü
```json
{
  "id": 29,
  "camera_name": "ESP32-CAM HD - Giriş Kapısı",
  "ip_address": "192.168.1.3",
  "port": 80,
  "stream_url": "http://192.168.1.3:80/stream"
}
```
Database doğru ✅

## 🔍 Test Adımları

### 1. ESP32-CAM Açık mı?
- Kırmızı LED yanıyor mu?
- USB'ye bağlı mı veya power supply var mı?

### 2. WiFi'ye Bağlı mı?
**Serial Monitor'u Kontrol Et** (Arduino IDE):
```
Connecting to WiFi...
WiFi connected
IP Address: 192.168.1.3  ← Bu IP'yi kontrol et
Stream server started on port 80
```

### 3. Network'te Erişilebilir mi?
**PowerShell'de ping at**:
```powershell
ping 192.168.1.3
```
✅ Cevap alıyorsa: Network OK
❌ "Request timed out": Kamera erişilemiyor

### 4. Browser'da Stream Test Et
**Direkt tarayıcıda aç**:
```
http://192.168.1.3:80/stream
```
✅ Görüntü geliyorsa: Stream çalışıyor
❌ "Site unreachable": Port veya firewall sorunu

### 5. Aynı Ağda mısınız?
- ESP32-CAM: `192.168.1.3` → Router 1
- Bilgisayarınız: Farklı router?
- **Çözüm**: Her iki cihaz da aynı WiFi ağına bağlı olmalı

### 6. Firewall Kontrol Et
**Windows Firewall'u kapat** (geçici test için):
```powershell
# Admin PowerShell'de:
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```
Stream test et, sonra tekrar aç:
```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

## 🛠️ ESP32-CAM Yeniden Başlatma

### WiFi Ayarlarını Sıfırla
1. ESP32-CAM'i çalıştır
2. İlk 10 saniye içinde **BOOT butonuna** basılı tut
3. AP modu aktif olur: `CityV-AI-Camera`
4. WiFi listesinde bu AP'yi gör → Bağlan
5. Browser'da: `http://192.168.4.1` aç
6. WiFi Manager açılır → Kendi WiFi'ni seç
7. Yeni IP alacak (Serial Monitor'den kontrol et)

### Firmware Yeniden Yükle
```arduino
// esp32-cam-cityv.ino'yu Arduino IDE'de aç
// Tools → Board → ESP32-CAM (AI-Thinker)
// Tools → Port → COMx seç
// Upload tuşuna bas
```

## 📋 Detaylı Debug

### RemoteCameraViewer'da Gelişmiş Hata Logları
Console'da şunu ara:
```
📹 Camera Stream Debug: {
  camera_name: "ESP32-CAM HD - Giriş Kapısı",
  ip_address: "192.168.1.3",
  port: 80,
  stream_url: "http://192.168.1.3:80/stream",
  connectionMode: "local",  ← veya "remote"
  baseUrl: "http://192.168.1.3:80/stream"
}
```

### Network Tools
**Windows'ta route kontrol**:
```powershell
# IP routing tablosunu gör
route print

# ESP32-CAM subnet'inde misin?
ipconfig | findstr "IPv4"
```

## 🎯 Sık Sorunlar ve Çözümleri

| Sorun | Olası Sebep | Çözüm |
|-------|-------------|-------|
| `ERR_CONNECTION_REFUSED` | Port kapalı | ESP32-CAM'de `/stream` endpoint çalışıyor mu kontrol et |
| `ERR_CONNECTION_TIMED_OUT` | IP erişilemiyor | Ping at, aynı ağda olun |
| `ERR_NAME_NOT_RESOLVED` | DNS sorunu | IP direkt kullan (192.168.1.3) |
| `ERR_NETWORK_CHANGED` | WiFi değişti | ESP32-CAM'i yeniden başlat |
| `❌ Stream hatası: {}` | Image load failed | Browser'da direkt URL'i test et |

## ✅ Çalıştığında Göreceğin Şeyler

1. **Console Log**:
```
📹 Camera Stream Debug: { ... connectionMode: "local", baseUrl: "..." }
```

2. **RemoteCameraViewer**:
- Loading spinner kaybolur
- MJPEG stream görünür (HD 1600x1200)
- Stats panel güncellenir

3. **Network Tab** (F12):
```
GET http://192.168.1.3:80/stream?t=1699... 200 OK
Content-Type: multipart/x-mixed-replace; boundary=frame
```

## 📞 Hala Çalışmıyorsa

1. **Serial Monitor loglarını** buraya yapıştır
2. **Browser Console screenshot** al
3. **Ping sonuçlarını** paylaş
4. **Router IP range** (192.168.1.x?) kontrol et

---

**Güncellemeler**:
- ✅ Database stream_url düzeltildi
- ✅ RemoteCameraViewer detaylı error logging eklendi
- 🔧 ESP32-CAM network bağlantısı test edilecek
