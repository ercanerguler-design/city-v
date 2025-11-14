# 📹 Kamera Bağlantı Sorun Giderme

## ❌ Hata: "Kamera Bağlantı Hatası"

URL parse doğru ancak kamera bağlantısı kurulamıyor.

## ✅ Sorun Giderme Adımları

### 1️⃣ Kamera Çalışıyor mu?

**Test:** Ping at
```powershell
ping 192.168.1.2
```

**Beklenen:**
```
Reply from 192.168.1.2: bytes=32 time=2ms TTL=64
Reply from 192.168.1.2: bytes=32 time=1ms TTL=64
```

**Sorun Varsa:**
- ❌ "Request timed out" → Kamera kapalı veya ağda değil
- ❌ "Destination host unreachable" → IP yanlış veya farklı ağda

**Çözüm:**
- ESP32-CAM'ı yeniden başlat (reset butonu)
- Güç kablosunu kontrol et
- WiFi bağlantısını kontrol et
- Router'da cihaz listesine bak (doğru IP'yi bul)

---

### 2️⃣ Stream Aktif mi?

**Test:** Browser'da aç
```
http://192.168.1.2:80/stream
```

**Beklenen:**
- ✅ Canlı kamera görüntüsü (MJPEG stream)

**Sorun Varsa:**
- ❌ "This site can't be reached" → Port yanlış veya stream kapalı
- ❌ "404 Not Found" → Stream path yanlış (/stream, /live, /cam ?)
- ❌ Siyah ekran → Kamera sensörü sorunlu

**Çözüm:**
- ESP32-CAM web paneline gir: `http://192.168.1.2/`
- Stream ayarlarını kontrol et
- "Start Stream" butonuna bas
- Farklı path'leri dene: `/stream`, `/live`, `/cam`, `/mjpeg`

---

### 3️⃣ Aynı Ağda mısınız?

**Kontrol:**
```powershell
# Bilgisayarınızın IP'si
ipconfig
```

**Beklenen:**
```
IPv4 Address: 192.168.1.xxx  (aynı subnet)
```

**Sorun Varsa:**
- ❌ 192.168.0.xxx → Farklı subnet
- ❌ 10.0.0.xxx → Farklı ağ
- ❌ Hotspot/Mobile data → ESP32 LAN'da

**Çözüm:**
- Aynı WiFi'ye bağlan (kamera ile aynı)
- VPN kapalı olsun
- Firewall'u geçici kapat (test için)

---

### 4️⃣ Port Doğru mu?

**ESP32-CAM Varsayılan Portlar:**
```
Web Panel: 80
Stream:    80
RTSP:      554 (kullanma - browser desteklemez!)
```

**Test:**
```powershell
# Port açık mı kontrol et
Test-NetConnection -ComputerName 192.168.1.2 -Port 80
```

**Beklenen:**
```
TcpTestSucceeded : True
```

**Çözüm:**
- Port 80 kullan (varsayılan)
- 8080, 8081, 554 gibi farklı portlar deneme

---

### 5️⃣ Stream URL Format Kontrolü

**Doğru Formatlar:**
```
✅ http://192.168.1.2:80/stream
✅ http://192.168.1.2/stream (port 80 default)
✅ http://admin:12345@192.168.1.2:80/stream
```

**Yanlış Formatlar:**
```
❌ rtsp://192.168.1.2:80/stream (RTSP - browser desteklemez!)
❌ https://192.168.1.2/stream (SSL yok genellikle)
❌ 192.168.1.2/stream (protokol eksik)
❌ http://192.168.1.2:554/stream (yanlış port)
```

---

### 6️⃣ ESP32-CAM Özgü Kontroller

**A) WiFi Bağlantısı:**
- ESP32-CAM'ın LED'i yanıyor mu?
- Seri monitörde "WiFi connected" yazıyor mu?
- IP adresi görünüyor mu?

**B) Kamera Sensörü:**
- Web panelde görüntü geliyor mu?
- Resolution ayarı çok yüksek mi? (VGA yap)
- Flash LED yanıyor mu? (gece için)

**C) Firmware:**
- ESP32-CAM firmware güncel mi?
- CityV uyumlu firmware (`esp32-cam-cityv.ino`)
- OTA güncelleme yapıldı mı?

---

## 🔧 Hızlı Debug Console

CityV Business Dashboard → Kamera Analizi açıldığında Console'da:

```
❌ Kamera bağlantı hatası: http://192.168.1.2:80/live

💡 Sorun Giderme:
   1. Kamera çalışıyor mu? IP'ye ping atın: ping 192.168.1.2
   2. Stream aktif mi? Browser'da açın: http://192.168.1.2:80/live
   3. Ağda mı? Aynı WiFi/LAN'da olmalı
   4. Port doğru mu? ESP32-CAM varsayılan: 80
```

---

## 📊 Yaygın Senaryolar

### Senaryo 1: "Bu Sabah Çalışıyordu"
**Sebep:** IP değişmiş (DHCP)

**Çözüm:**
- Router'da cihaz listesine bak
- ESP32-CAM'ın yeni IP'sini bul
- Kamera ayarlarını güncelle
- Veya: Statik IP ata (router settings)

### Senaryo 2: "Başka Cihazda Çalışıyor"
**Sebep:** Ağ izinleri / Firewall

**Çözüm:**
- Windows Firewall'u geçici kapat
- Antivirus'ü durdur (test için)
- VPN'i kapat
- Tarayıcı önbelleğini temizle

### Senaryo 3: "Video Donuyor"
**Sebep:** Bant genişliği / WiFi zayıf

**Çözüm:**
- ESP32-CAM'ı router'a yaklaştır
- Resolution düşür (VGA → QVGA)
- Frame rate düşür (20fps → 10fps)
- Başka WiFi kanal kullan (router settings)

### Senaryo 4: "404 Not Found"
**Sebep:** Stream path yanlış

**Çözüm:**
```
Dene:
http://192.168.1.2/stream
http://192.168.1.2/live
http://192.168.1.2/cam
http://192.168.1.2/mjpeg
http://192.168.1.2:81/stream (farklı port)
```

---

## 🎯 Test Checklist

Bağlantı kurmadan önce kontrol et:

- [ ] Kamera fiziksel olarak çalışıyor (LED, güç)
- [ ] WiFi bağlı (seri monitör / web panel)
- [ ] IP adresini biliyorsun (router veya seri monitör)
- [ ] Ping başarılı (`ping 192.168.1.2`)
- [ ] Port 80 açık (`Test-NetConnection`)
- [ ] Browser'da stream görüntüsü geliyor
- [ ] Aynı ağdasınız (subnet kontrolü)
- [ ] HTTP protokolü (RTSP değil!)
- [ ] Firewall/VPN kapalı (test için)

---

## 🚀 Başarılı Bağlantı Örneği

### ESP32-CAM Setup:
```cpp
// WiFi credentials
const char* ssid = "MyWiFi";
const char* password = "12345678";

// HTTP server on port 80
WebServer server(80);

// Stream endpoint
server.on("/stream", handleStream);
```

### CityV Business:
```
Kamera Ekle:
- IP Adresi: 192.168.1.2/stream
- Port: 80
- Kamera Adı: "Giriş Kapısı"
- Konum: "Ana giriş - müşteri sayımı"

✅ Analizi Göster → Canlı görüntü + AI analiz
```

### Console Output:
```
✅ Kamera görüntüsü yüklendi: http://192.168.1.2:80/stream
🎯 Frame işleme başladı
👥 Tespit edilen kişi: 3
📊 Yoğunluk: Orta (%45)
🔥 En yoğun bölge: Merkez (2 kişi)
```

---

## 💡 Pro Tips

1. **Statik IP Kullan**
   - Router settings → DHCP Reservation
   - ESP32-CAM her zaman aynı IP alsın
   - IP değişiminden kurtul

2. **Güçlü WiFi Sinyal**
   - 5 GHz yerine 2.4 GHz kullan (menzil daha iyi)
   - Router'a yakın konumlandır
   - Metal duvarlardan uzak tut

3. **Resolution Optimize Et**
   - UXGA (1600x1200) → Çok yüksek, yavaş
   - VGA (640x480) → **Önerilen** ✅
   - QVGA (320x240) → Düşük kalite ama hızlı

4. **Test Modunda Başla**
   - İlk browser'da test et
   - Sonra CityV'ye ekle
   - AI analizini sonra aç

5. **Loglara Bak**
   - Browser Console (F12)
   - ESP32-CAM Serial Monitor
   - Router device list

---

**Hala çalışmıyor mu?**  
→ `esp32-cam-cityv.ino` firmware'ini yeniden yükle  
→ ESP32-CAM donanım sorunlu olabilir (kamera sensörü)  
→ GitHub Issues'da sor: github.com/ercanerguler-design/city-v/issues

