# 🔧 ESP32-CAM CORS Fix - Kamera Görüntüsü Sorunu

## ❌ Sorun

```
Access to image at 'http://192.168.1.2/stream' from origin 'http://localhost:3002' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

**Neden Oluyor?**
- Browser güvenlik politikası (Same-Origin Policy)
- ESP32-CAM CORS header'ı göndermiyor
- Canvas işleme için `crossOrigin="anonymous"` gerekli
- Ama kamera bunu desteklemiyor

## ✅ Çözüm 1: ESP32-CAM Firmware'ine CORS Ekle (ÖNERİLEN)

### Arduino Kodu (`esp32-cam-cityv.ino`)

```cpp
// Web server başlangıç kısmına ekle
void setupServer() {
  // CORS headers ekle
  server.enableCORS(true);
  
  // Veya manuel olarak:
  server.on("/stream", HTTP_GET, []() {
    // CORS headers
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    
    // Stream başlat
    WiFiClient client = server.client();
    streamJpg(&client);
  });
  
  // OPTIONS preflight request
  server.on("/stream", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(200);
  });
}
```

### ESP32 WebServer Kütüphanesi Kullanıyorsanız

```cpp
#include <WebServer.h>

WebServer server(80);

void handleStream() {
  // CORS headers
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Max-Age", "86400");
  
  // MJPEG stream
  WiFiClient client = server.client();
  
  server.setContentLength(CONTENT_LENGTH_UNKNOWN);
  server.send(200, "multipart/x-mixed-replace; boundary=frame");
  
  while (client.connected()) {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) continue;
    
    client.printf("--frame\r\n");
    client.printf("Content-Type: image/jpeg\r\n");
    client.printf("Content-Length: %d\r\n\r\n", fb->len);
    client.write(fb->buf, fb->len);
    client.printf("\r\n");
    
    esp_camera_fb_return(fb);
    delay(30); // ~30 FPS
  }
}

void setup() {
  // ...camera init...
  
  server.on("/stream", HTTP_GET, handleStream);
  
  // OPTIONS için
  server.on("/stream", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET");
    server.send(200);
  });
  
  server.begin();
}
```

### CameraWebServer Kullanıyorsanız

`app_httpd.cpp` dosyasını düzenle:

```cpp
static esp_err_t stream_handler(httpd_req_t *req) {
  // CORS headers ekle
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET");
  
  // Stream devam eder...
  httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  
  while (true) {
    fb = esp_camera_fb_get();
    // ... stream logic
  }
}
```

---

## ✅ Çözüm 2: Next.js API Proxy (GEÇİCİ)

ESP32-CAM'ı güncelleyemiyorsanız Next.js üzerinden proxy yapabilirsiniz.

### `app/api/camera-proxy/route.ts`

```typescript
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const streamUrl = searchParams.get('url');
  
  if (!streamUrl) {
    return new Response('Missing stream URL', { status: 400 });
  }

  try {
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'CityV-Proxy/1.0'
      }
    });

    // CORS headers ekle
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    headers.set('Cache-Control', 'no-cache');

    return new Response(response.body, {
      status: response.status,
      headers
    });
  } catch (error) {
    console.error('Camera proxy error:', error);
    return new Response('Proxy error', { status: 500 });
  }
}
```

### Component'te Kullan

```typescript
// ProfessionalCameraAnalytics.tsx
const proxyUrl = `/api/camera-proxy?url=${encodeURIComponent(streamUrl)}`;

<img
  src={proxyUrl}
  crossOrigin="anonymous" // Artık çalışır
/>
```

**Not:** Proxy sunucu yükünü artırır, production'da önerilmez!

---

## ✅ Çözüm 3: CORS Olmadan Çalış (MEVCUT)

CORS olmadan sadece görüntü göster, canvas işleme yapma.

```typescript
<img
  src={streamUrl}
  // crossOrigin KALDIR
/>
```

**Dezavantajlar:**
- ❌ Canvas'a drawImage() çalışmaz (tainted canvas)
- ❌ Gerçek AI analiz yapılamaz
- ✅ Simülasyon çalışır
- ✅ Görüntü gelir

**Mevcut Durum:** Bu şekilde çalışıyor şu an.

---

## 🧪 Test: CORS Çalışıyor mu?

### Browser Console:
```javascript
fetch('http://192.168.1.2/stream', { method: 'HEAD' })
  .then(r => console.log('CORS Headers:', r.headers))
  .catch(e => console.error('CORS Error:', e));
```

**Beklenen (Çalışıyorsa):**
```
CORS Headers: 
  access-control-allow-origin: *
```

**Hata (Çalışmıyorsa):**
```
CORS Error: Failed to fetch
```

---

## 📊 Çözüm Karşılaştırması

| Çözüm | Gerçek AI | Performans | Zorluk | Önerilen |
|-------|-----------|------------|--------|----------|
| ESP32 CORS | ✅ | ⭐⭐⭐ | Orta | **EN İYİ** |
| Next.js Proxy | ✅ | ⭐ | Kolay | Geçici |
| CORS Olmadan | ❌ Simülasyon | ⭐⭐⭐ | Çok Kolay | Demo için |

---

## 🚀 Uygulama Adımları

### 1. ESP32-CAM Firmware Güncelle

```bash
# Arduino IDE'de esp32-cam-cityv.ino aç
# CORS kodunu ekle (yukarıdaki örnekler)
# Upload et
```

### 2. Test Et

```bash
# Browser'da aç
http://192.168.1.2/stream

# Console'da CORS header kontrol et (F12 → Network → stream)
Access-Control-Allow-Origin: *
```

### 3. CityV'de Aktif Et

```typescript
// ProfessionalCameraAnalytics.tsx
<img
  src={streamUrl}
  crossOrigin="anonymous" // Artık çalışacak
  onLoad={() => setIsProcessing(true)} // AI analiz başlar
/>
```

---

## 💡 Pro Tips

1. **Wildcard yerine domain belirt (Güvenlik için):**
   ```cpp
   server.sendHeader("Access-Control-Allow-Origin", "http://localhost:3002");
   // Production:
   // server.sendHeader("Access-Control-Allow-Origin", "https://cityv.com");
   ```

2. **OPTIONS request'i unutma:**
   Browser preflight check yapar, OPTIONS'a 200 dön

3. **Cache-Control ekle:**
   ```cpp
   server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
   ```

4. **Stream sürekliliği:**
   MJPEG stream kopmamalı, `boundary=frame` formatı doğru olmalı

---

## 🔍 Debugging

### CORS Çalışmıyor:

```bash
# ESP32 Serial Monitor
INFO: CORS headers sent: Access-Control-Allow-Origin: *

# Browser Console
> Headers: { access-control-allow-origin: "*" }
```

### Stream Kesiliyorsa:

```cpp
// Timeout artır
server.setTimeout(30000); // 30 saniye

// Keep-alive ekle
server.sendHeader("Connection", "keep-alive");
```

---

## 📖 Kaynaklar

- [ESP32 WebServer CORS](https://github.com/espressif/arduino-esp32/issues/1789)
- [CameraWebServer Example](https://github.com/espressif/arduino-esp32/tree/master/libraries/ESP32/examples/Camera/CameraWebServer)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Sonuç:** ESP32-CAM firmware'ine CORS header ekleyerek tam AI analiz aktif edilecek! 🎯
