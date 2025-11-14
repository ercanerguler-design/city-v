# 🔍 Stream Sorun Giderme Rehberi

## ✅ Yapılanlar

1. **ESP32 Firmware**: CORS desteği eklendi
2. **Frontend**: Debug log'ları eklendi
3. **MultiDeviceDashboard**: Stream durumu takibi
4. **BusinessLiveCrowd**: Debug paneli eklendi

## 🧪 Test Adımları

### 1. Debug Sayfası ile Başla
```
http://localhost:3000/esp32/debug
```
- ✅ Yeşil işaretli kameralar çalışıyor
- ❌ Kırmızı işaretli kameralar offline
- IP adreslerini not edin

### 2. Business IoT Sayfası
```
http://localhost:3000/business/iot
```

**Console'u açın** (F12 → Console):
```
▶️ Starting stream...
📹 ESP32 IP: 192.168.1.9
🌐 Stream URL: http://192.168.1.9/stream
✅ Stream src set
```

**Hata varsa:**
```
❌ Stream image error
Error event: ...
Image src: http://192.168.1.9/stream
```

**Debug panelinde kontrol edin:**
- ESP32 IP doğru mu?
- Stream URL erişilebilir mi?
- Connection status ne gösteriyor?

### 3. Multi Kamera Sayfası
```
http://localhost:3000/esp32/multi
```

**Console'da şunları göreceksiniz:**
```
🔍 Fetching device data from API...
📡 API devices: [...]
📹 Camera 1: ESP32-001 at 192.168.1.9
📹 Camera 2: ESP32-002 at 192.168.1.10
...
```

veya

```
🎭 Using mock camera data
📌 Camera IPs: { ESP32-001: "192.168.1.9", ... }
✅ Mock cameras created: [...]
```

**Stream hataları için:**
```
❌ Stream error for Kamera 1: http://192.168.1.9/stream
```

## 🔧 Çözümler

### Problem: Stream yüklenmiyor

**1. IP Adresini Kontrol Et:**
```
Debug sayfası → Hangi kamera yeşil?
→ O IP'yi kullan
```

**2. Business IoT:**
```typescript
// app/business/iot/page.tsx
<BusinessLiveCrowd
  esp32Ip="192.168.1.9"  // ← Çalışan kameranın IP'si
  maxCapacity={50}
/>
```

**3. Multi Kamera:**
```
/esp32/multi → Settings ⚙️ → IP'leri gir → Save
```

### Problem: CORS hatası

**Console:**
```
Access to image at 'http://192.168.1.9/stream' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Çözüm:**
```
ESP32'yi yeni firmware ile flashlayın
Arduino IDE → Upload
```

### Problem: Connection refused

**Console:**
```
GET http://192.168.1.9/stream net::ERR_CONNECTION_REFUSED
```

**Çözüm:**
```
1. ESP32 açık mı?
2. WiFi'ye bağlı mı?
3. IP adresi doğru mu?
```

**Test:**
```bash
# PowerShell
curl http://192.168.1.9/status

# Çalışıyorsa:
{
  "device_id": "ESP32-001",
  "camera_ready": true,
  ...
}
```

## 📊 Beklenen Davranış

### Business IoT Sayfası

**Başlat butonuna bastığınızda:**
```
Console:
▶️ Starting stream...
📹 ESP32 IP: 192.168.1.9
🌐 Stream URL: http://192.168.1.9/stream
✅ Stream src set
✅ Stream image loaded successfully

Ekran:
- Bağlantı durumu: 🟢 Bağlı
- Canlı kamera görüntüsü akıyor
- İstatistikler güncelleniyor
```

### Multi Kamera Sayfası

**Sayfa açıldığında:**
```
Console:
🔍 Fetching device data from API...
📡 API devices: [...]
📹 Camera 1: ESP32-001 at 192.168.1.9
✅ Stream loaded: Kamera 1 - http://192.168.1.9/stream

Ekran:
- 4 kamera grid görünüyor
- Çalışan kameralar stream gösteriyor
- Çalışmayan kameralar "Stream Hatası" gösteriyor
```

## 🎯 Hızlı Kontrol Listesi

- [ ] ESP32 açık ve WiFi'ye bağlı
- [ ] Serial Monitor'da IP adresi görünüyor
- [ ] `http://192.168.1.9/status` JSON dönüyor
- [ ] Debug sayfasında kamera yeşil
- [ ] Console'da CORS hatası yok
- [ ] Business sayfasında doğru IP kullanılıyor
- [ ] Multi sayfasında Settings ile IP güncellendi

## 💡 Pro Tips

**1. LocalStorage Temizle:**
```javascript
// Console
localStorage.clear();
location.reload();
```

**2. Hard Refresh:**
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

**3. ESP32 IP Sabitle:**
```
Router → DHCP Reservation
MAC: [ESP32 MAC] → IP: 192.168.1.9
```

**4. Serial Monitor:**
```
Arduino IDE → Tools → Serial Monitor (115200)
→ IP adresini buradan öğren
```

## 📞 Sorun Devam Ediyorsa

1. **Console'u temizle** ve sayfayı yenile
2. **Tüm log mesajlarını** kopyala
3. **Network tab'ı** aç (F12 → Network)
4. **Başlat butonuna** bas
5. **Başarısız request'i** bul
6. **Headers ve Response** göster

## 🎉 Başarı Göstergeleri

### Business IoT
- ✅ Debug paneli doğru IP gösteriyor
- ✅ Connection: connected
- ✅ Canlı görüntü akıyor
- ✅ Console'da hata yok

### Multi Kamera
- ✅ Mock camera data log'u var
- ✅ Stream URL'ler doğru
- ✅ En az 1 kamera stream gösteriyor
- ✅ Settings ile IP değiştirilebiliyor
