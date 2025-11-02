# Mixed Content Çözümü - Local Kamera Streaming

## Sorun
HTTPS siteden (city-v.com) HTTP kamera (192.168.1.2) görüntülenemez çünkü tarayıcılar Mixed Content'i engeller.

## Neden Proxy Çalışmıyor?
- Vercel sunucuları cloud'da (AWS/Google Cloud)
- Sizin kameranız local network'te (192.168.1.2)
- Cloud sunucusu local network'e erişemez ❌

## Çözüm: Mixed Content İzni

### Chrome/Edge (Önerilen)
1. Adres çubuğunun **solundaki kilit/uyarı ikonuna** tıklayın
2. "Site ayarları" veya "Permissions" seçin
3. "Insecure content" veya "Güvenli olmayan içerik" bulun
4. **İzin Ver** (Allow) seçin
5. Sayfayı **yenileyin** (F5)

**Veya Geliştirici Ayarları:**
1. Adres çubuğuna: `chrome://flags/`
2. Ara: "insecure content"
3. "Allow sites to load insecure content" → **Enabled**
4. Chrome'u yeniden başlat

### Firefox
1. Adres çubuğunun **solundaki kalkan ikonuna** tıklayın
2. "Korumayı şimdilik devre dışı bırak" seçin
3. Sayfayı yenileyin

**Veya Geliştirici Konsolu:**
1. F12 → Console
2. Uyarıda görünen "Load anyway" veya "Yine de yükle" butonuna tıklayın

### Safari (Mac)
Safari Mixed Content'e izin vermez. Çözüm:
- HTTP sitesini kullan: http://localhost:3000 (development)
- Veya ESP32-CAM'e HTTPS ekleyin (karmaşık)

## Test Etmek İçin
1. Vercel deployment tamamlandı (commit: f5f2eb4)
2. Sayfayı **hard refresh** yapın: `Ctrl + Shift + R`
3. Kameralar bölümüne gidin
4. Kameranızı açın
5. Sarı uyarı kutusunu göreceksiniz
6. Tarayıcı ayarlarından Mixed Content'e izin verin
7. Stream başlamalı ✅

## Beklenen Console Logları
```
🏠 Local kamera - Direkt bağlantı (Mixed Content expected)
✅ Stream yüklendi
```

## Alternatif Çözümler

### 1. Development Mode (localhost)
Local development'ta HTTP kullanın:
```bash
npm run dev
# http://localhost:3000 kullanın (HTTPS değil)
```
HTTP → HTTP bağlantısı sorunsuz çalışır.

### 2. Tunnel Service (Ngrok/LocalTunnel)
ESP32-CAM'i internete açın:
```bash
ngrok http 192.168.1.2:80
# Ngrok HTTPS URL'ini kullanın
```
Ama bu geçici URL verir.

### 3. VPN/Tailscale
Vercel sunucusunu local network'e bağlayın (karmaşık).

## Önerilen Yaklaşım
**Development:** HTTP localhost kullan  
**Production:** Mixed Content izni ver (güvenlik riski düşük, sadece kendi kameranız)  
**Profesyonel:** ESP32'ye domain + SSL sertifikası ekleyin

## Güvenlik Notu
⚠️ Mixed Content izni vermek **sadece sizin local kameranız için** sorun oluşturmaz.  
✅ Başka siteler için Mixed Content koruması aktif kalır.  
✅ Sadece city-v.com için geçerlidir.

## Sorun Devam Ederse
1. Browser console'u açın (F12)
2. Network tab'inde HTTP isteklerini kontrol edin
3. "blocked:mixed-content" görürseniz → tarayıcı ayarlarını tekrar kontrol edin
4. Başka bir tarayıcıda deneyin (Chrome en iyi sonuç verir)
