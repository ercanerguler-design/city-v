# 🌐 Uzaktan Kamera İzleme Sistemi

## Nasıl Çalışıyor?

```
📱 Herhangi Bir Cihazdan
    ↓
🌐 Business Dashboard → Kameralar
    ↓
👁️ "Canlı İzle" Butonu
    ↓
🔍 Bağlantı Modu Tespit Ediliyor...
    ↓
┌─────────────────────────────────────┐
│ Local Network (Aynı WiFi)           │
│ → Direct: http://192.168.1.100/stream│
│ → Hızlı, düşük latency              │
└─────────────────────────────────────┘
         VEYA
┌─────────────────────────────────────┐
│ Remote Access (Dışarıdan)           │
│ → Proxy: /api/cameras/stream-proxy │
│ → Port forwarding gerekli           │
└─────────────────────────────────────┘
```

---

## 🎯 Özellikler

### 1. Otomatik Bağlantı Modu Tespiti

**Local Network:**
- ✅ Kamera IP: 192.168.x.x veya 10.x.x.x
- ✅ Browser URL: localhost veya LAN IP
- ✅ Sonuç: **Direkt bağlantı** (hızlı, gecikme yok)

**Remote Access:**
- ✅ Kamera IP: 192.168.x.x (local)
- ✅ Browser URL: cityv.vercel.app (production)
- ✅ Sonuç: **Proxy üzerinden** (port forwarding gerekli)

### 2. AI Detection Overlay

```tsx
// Real-time person/object detection
- Person detection (yeşil box)
- Object detection (mavi box, Turkish labels)
- Confidence scores (%)
- FPS counter
```

### 3. Heat Map Overlay

```tsx
// Zone-based occupancy heat map
- 30 saniye decay
- Zone occupancy percentage
- Gradient colors (yeşil → kırmızı)
- Point-in-polygon detection
```

### 4. Calibration Line

```tsx
// Entry/Exit counting line
- Green point: Entry (giriş)
- Red point: Exit (çıkış)
- Dashed line overlay
- Responsive to stream size
```

### 5. Real-time Stats

```tsx
// Top overlay stats
- ↓ Giriş: 45 (yeşil)
- ↑ Çıkış: 32 (kırmızı)
- 👥 Şu An: 13 (mavi)
```

---

## 📱 Kullanım Senaryoları

### Senaryo 1: Evde Local Network

```bash
# Durum:
- Kafe sahibi: Evinde
- Kamera: İşyerinde (192.168.1.100)
- Browser: Evde laptop (cityv.vercel.app)

# Sorun:
❌ Local kamera, remote browser
❌ Direkt bağlantı mümkün değil (farklı network)

# Çözüm:
✅ Port forwarding (router'da)
✅ Proxy stream (/api/stream-proxy)
✅ Güvenli remote access

# Adımlar:
1. Router'a gir (192.168.1.1)
2. Port Forwarding:
   - External Port: 8080
   - Internal IP: 192.168.1.100
   - Internal Port: 80
3. Business Dashboard → Kamera Ayarları:
   - IP: [public IP]:8080
   - VEYA kamera'yı local IP ile tut, proxy otomatik çalışsın
```

### Senaryo 2: İşyerinde Local Network

```bash
# Durum:
- Kafe sahibi: İşyerinde
- Kamera: Aynı ağda (192.168.1.100)
- Browser: İşyeri PC (cityv.vercel.app VEYA localhost)

# Sonuç:
✅ Direkt bağlantı (aynı LAN)
✅ Hızlı stream (< 100ms latency)
✅ Proxy gerekmiyor

# Otomatik:
🏠 "Yerel Ağ" badge görünür
📹 http://192.168.1.100/stream direkt açılır
```

### Senaryo 3: Mobilde Remote

```bash
# Durum:
- Kafe sahibi: Dışarıda (4G/5G)
- Kamera: İşyerinde (port forwarding yapılmış)
- Browser: iPhone Safari (cityv.vercel.app)

# Sonuç:
✅ Proxy stream çalışır
✅ Port forwarding ile erişim
✅ AI detection aktif

# Badge:
🌐 "Uzaktan Erişim" badge görünür
📹 Proxy: /api/stream-proxy?url=...
```

---

## 🔧 Kurulum (İlk Kez)

### Adım 1: Kamera Ekle

```bash
Business Dashboard → Kameralar → "+ Kamera Ekle"

Kamera Adı: Ana Giriş Kamerası
IP Adresi: 192.168.1.100
Port: 80
Konum: Kafe Giriş Kapısı
```

### Adım 2: Kalibrasyon

```bash
Kamera kartında → "Kalibrasyon" butonu

1. Stream açılır
2. İlk nokta tıkla (yeşil) → Giriş
3. İkinci nokta tıkla (kırmızı) → Çıkış
4. "Kaydet"

✅ Calibration line kaydedildi
✅ Entry/Exit counting başladı
```

### Adım 3: Zone Çizimi

```bash
Kamera kartında → "Bölgeler" butonu

1. Bölge tipi seç (Oturma Alanı, Kasa, vb.)
2. İsim ver: "Masa 1"
3. Stream'de polygon çiz (4+ nokta)
4. "Polygon Tamamla"
5. "Kaydet"

✅ Zone kaydedildi
✅ Heat map aktif
```

### Adım 4: Canlı İzle

```bash
Kamera kartında → "👁️ Canlı İzle" butonu

✅ Full-screen modal açılır
✅ Stream + AI detection + Heat map
✅ Real-time stats
✅ Kalibrasyon çizgisi görünür
```

---

## 🌐 Port Forwarding (Remote Access için)

### Router Ayarları

**TP-Link Router:**
```
1. 192.168.1.1 → Admin panel
2. Forwarding → Virtual Servers
3. Add:
   - Service Port: 8080
   - IP Address: 192.168.1.100
   - Internal Port: 80
   - Protocol: TCP/UDP
   - Status: Enabled
4. Save
```

**ASUS Router:**
```
1. 192.168.1.1 → Advanced Settings
2. WAN → Port Forwarding
3. Enable UPnP: Yes
4. Port Forwarding List:
   - Service Name: ESP32-CAM
   - Port Range: 8080
   - Local IP: 192.168.1.100
   - Local Port: 80
5. Apply
```

**Huawei Router:**
```
1. 192.168.1.1 → Advanced
2. NAT → Port Mapping
3. Add:
   - External Port: 8080
   - Internal Host: 192.168.1.100
   - Internal Port: 80
   - Protocol: TCP & UDP
4. Save
```

### Public IP Bulma

```bash
# Windows PowerShell:
curl ifconfig.me

# Output:
78.172.45.123  ← Bu senin public IP'in

# Kamera URL (dışarıdan):
http://78.172.45.123:8080/stream
```

### Kamera Ayarlarını Güncelle

```bash
Business Dashboard → Kamera Ayarları

# Local IP yerine Public IP + Port:
IP Adresi: 78.172.45.123
Port: 8080
Stream URL: http://78.172.45.123:8080/stream

✅ Artık dışarıdan erişebilirsin!
```

---

## 🔒 Güvenlik

### 1. IP Whitelist (Proxy API)

```typescript
// /api/business/cameras/stream-proxy/route.ts

const ALLOWED_IP_RANGES = [
  /^192\.168\./,  // Local network
  /^10\./,        // Private network
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./
];

// Sadece local IP'lere izin verir
// Public IP'lere proxy yapmaz (güvenlik)
```

### 2. Token Authentication

```typescript
// Frontend her request'te token gönderir
const token = localStorage.getItem('business_token');

fetch('/api/business/cameras', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Backend token'ı verify eder
// Yanlış token = 401 Unauthorized
```

### 3. HTTPS Zorunluluğu

```
Production (Vercel):
✅ https://city-v-kopya-3.vercel.app
✅ SSL certificate (otomatik)
✅ Güvenli stream proxy

Development (Local):
⚠️ http://localhost:3000
⚠️ SSL yok (test için OK)
```

---

## 📊 Stream Performance

### Local Network

```
Latency: ~50-100ms
FPS: ~20-25 (ESP32-CAM limit)
Quality: MJPEG 640x480
Bandwidth: ~500 KB/s
```

### Remote Access (Proxy)

```
Latency: ~200-500ms (internet hızına bağlı)
FPS: ~15-20
Quality: MJPEG 640x480
Bandwidth: ~500 KB/s + proxy overhead
```

### Optimization Tips

```bash
# ESP32-CAM Firmware:
camera_config.jpeg_quality = 12; // (0-63, lower = better)
camera_config.frame_size = FRAMESIZE_VGA; // 640x480

# Bandwidth azaltma:
camera_config.jpeg_quality = 20; // Daha düşük kalite
camera_config.frame_size = FRAMESIZE_QVGA; // 320x240

# FPS artırma:
camera_config.fb_count = 2; // Double buffering
```

---

## 🐛 Troubleshooting

### ❌ Stream görünmüyor

**Kontrol Et:**
```bash
1. Kamera çalışıyor mu?
   → Browser'da direkt aç: http://192.168.1.100/stream

2. IP adresi doğru mu?
   → Dashboard'da kamera kartına bak

3. Port doğru mu?
   → ESP32-CAM default: 80

4. Aynı ağda mısın?
   → Phone WiFi = Kamera WiFi olmalı
```

**Çözüm:**
```bash
# Kamerayı yeniden başlat:
ESP32 Reset butonuna bas (2 saniye)

# Dashboard'da refresh:
Kamera kartında "Yenile" butonu

# Stream URL test et:
curl http://192.168.1.100/stream
```

### ❌ Remote access çalışmıyor

**Kontrol Et:**
```bash
1. Port forwarding yapıldı mı?
   → Router admin panelinde kontrol et

2. Public IP doğru mu?
   → curl ifconfig.me

3. Firewall port açık mı?
   → Windows: Control Panel → Firewall → Allow Port 8080

4. Kamera local IP'si değişmedi mi?
   → Router'da DHCP Reservation yap
```

**Çözüm:**
```bash
# Port forwarding test:
curl http://[public_ip]:8080/stream

# Başarılı ise: Stream data dönmeli
# Başarısız ise: Connection refused / timeout
```

### ❌ AI detection yavaş

**Kontrol Et:**
```bash
1. TensorFlow.js yüklendi mi?
   → npm list @tensorflow/tfjs

2. CPU kullanımı yüksek mi?
   → Browser DevTools → Performance

3. Detection interval uzun mu?
   → RemoteCameraViewer.tsx: interval = 3000ms
```

**Optimization:**
```typescript
// Detection interval artır (daha az AI, daha hızlı)
const detectionInterval = setInterval(() => {
  loadDetections();
}, 5000); // 3000ms → 5000ms

// Model confidence threshold yükselt (daha az false positive)
if (detection.confidence > 0.7) { // 0.6 → 0.7
  // Show detection
}
```

---

## 🚀 Test Senaryosu

### 1. Local Test (Aynı Ağda)

```bash
# Windows/Mac:
1. Business Dashboard aç: https://city-v-kopya-3.vercel.app/business/login
2. Login: email + password
3. Kameralar → "👁️ Canlı İzle"
4. Görülmeli: 🏠 "Yerel Ağ" badge

✅ Stream açılırsa: Local network çalışıyor!
❌ Hata varsa: Kamera IP/Port kontrol et
```

### 2. Remote Test (Farklı Ağdan)

```bash
# iPhone (4G) + PC (WiFi):
1. PC'de: Port forwarding yap
2. iPhone'da: Business dashboard aç
3. Kameralar → "👁️ Canlı İzle"
4. Görülmeli: 🌐 "Uzaktan Erişim" badge

✅ Stream açılırsa: Remote access çalışıyor!
❌ Hata varsa: Port forwarding kontrol et
```

### 3. AI Test

```bash
1. Stream açıldıktan sonra:
2. Kamera önünde hareket et
3. Görülmeli:
   - Yeşil box (person detection)
   - Mavi box (object detection)
   - Turkish labels (insan, sandalye, vb.)
   - FPS counter (sağ üst)

✅ AI çalışıyor!
```

### 4. Counting Test

```bash
1. Kalibrasyon çizgisi mevcut olmalı
2. Çizgiden geç (giriş yönü)
3. Stats güncellenmeli:
   - ↓ Giriş: +1
   - 👥 Şu An: +1
4. Ters yönde geç (çıkış)
   - ↑ Çıkış: +1
   - 👥 Şu An: -1

✅ Entry/Exit counting çalışıyor!
```

---

## 📖 API Endpoints

### Stream Proxy

```typescript
GET /api/business/cameras/stream-proxy?url=http://192.168.1.100/stream

Response:
- Content-Type: multipart/x-mixed-replace; boundary=frame
- Stream: MJPEG binary data (passthrough)
- Status: 200 (success) | 502 (camera error)
```

### Detection Data

```typescript
GET /api/business/cameras/:deviceId/detect

Response:
{
  success: true,
  detections: {
    objects: [
      { class: "person", confidence: 0.95, bbox: {...} },
      { class: "chair", confidence: 0.82, bbox: {...} }
    ]
  }
}
```

### Counting Stats

```typescript
GET /api/business/cameras/:deviceId/counting

Response:
{
  success: true,
  counting: {
    entries: 45,
    exits: 32,
    current: 13
  }
}
```

### Heatmap Data

```typescript
GET /api/business/cameras/:deviceId/heatmap

Response:
{
  success: true,
  heatmap: {
    zones: [
      { name: "Masa 1", occupancy: 75 },
      { name: "Kasa", occupancy: 30 }
    ]
  }
}
```

---

## 🎉 Sonuç

```
✅ Local network: Direkt stream (hızlı)
✅ Remote access: Proxy stream (port forwarding)
✅ AI detection: Real-time person/object
✅ Heat map: Zone-based occupancy
✅ Entry/Exit: Calibration line counting
✅ Multi-device: Phone, tablet, desktop
✅ Auto-detect: Connection mode (local vs remote)
```

**Artık herhangi bir cihazdan, herhangi bir yerden kameranı izleyebilirsin! 🚀📹**
