# 🌐 ESP32 Kamera Port Forwarding Rehberi

Bu rehber, ESP32 kameranızı internet üzerinden erişilebilir hale getirmek için modem/router port forwarding ayarlarının nasıl yapılacağını açıklar.

## 🎯 Amaç
Production HTTPS sitesinden (city-v.com) local ESP32 kameraya erişebilmek için gerekli.

## 📋 Gereksinimler
- ESP32-CAM cihazı (192.168.1.8:80)
- Router/Modem admin erişimi
- Public IP address (176.88.29.215)

## ⚙️ Router Ayarları

### 1️⃣ Router Admin Panel'e Giriş
```
• Tarayıcıda: 192.168.1.1 veya 192.168.0.1
• Admin kullanıcı/şifre ile giriş
• Port Forwarding veya Virtual Server bölümünü bulun
```

### 2️⃣ Port Forwarding Kuralı
```
Service Name: ESP32-CAM-Stream
Protocol: TCP
External Port: 8080         # Dışarıdan erişim portu
Internal IP: 192.168.1.8   # ESP32 kamera IP'si
Internal Port: 80          # ESP32 HTTP server port
Enable: ✅                  # Aktif et
```

### 3️⃣ Örnek Router Arayüzleri

#### Türk Telekom Modem:
```
Gelişmiş Ayarlar > NAT > Sanal Sunucu
- Servis Adı: ESP32-CAM
- Protokol: TCP
- Dış Port: 8080
- İç IP: 192.168.1.8  
- İç Port: 80
```

#### TP-Link Router:
```
Advanced > NAT Forwarding > Virtual Servers
- Service Type: Custom
- External Port: 8080
- Internal IP: 192.168.1.8
- Internal Port: 80
- Protocol: TCP
```

#### D-Link Router:
```
Setup > Port Forwarding
- Name: ESP32-CAM
- Public Port: 8080
- Private IP: 192.168.1.8
- Private Port: 80
- Traffic Type: TCP
```

## 🧪 Test Etme

### Local Test:
```bash
# Aynı network'ten test
curl http://192.168.1.8/stream
# veya tarayıcıda: http://192.168.1.8/stream
```

### Public Test:
```bash
# Internet'ten test
curl http://176.88.29.215:8080/stream
# veya tarayıcıda: http://176.88.29.215:8080/stream
```

### CityV Business Dashboard Test:
```
1. business.cityv.com/dashboard
2. Kameralar > Kamera Ekle
3. ✅ Public Internet Access
4. Public IP: 176.88.29.215
5. Public Port: 8080
6. Kaydet ve test et
```

## 🔒 Güvenlik Önlemleri

### ESP32 Auth Ekleme:
```cpp
// Arduino kodunda HTTP auth
server.on("/stream", HTTP_GET, [](AsyncWebServerRequest *request){
  if (!request->authenticate("admin", "password")) {
    return request->requestAuthentication();
  }
  // Stream kodu...
});
```

### Router Firewall:
```
• Sadece gerekli portları aç (8080)
• IP whitelisting kullan (mümkünse)
• DDoS protection aktif et
```

## 📱 Dynamic IP Sorunu

Eğer internet sağlayıcınız sabit IP vermiyorsa:

### No-IP Dynamic DNS:
```
1. no-ip.com'a kaydol
2. Hostname oluştur: kamera.no-ip.org
3. Router'da DDNS ayarını aktif et
4. CityV'de: kamera.no-ip.org:8080
```

### Cloudflare Tunnel (Ücretsiz):
```bash
# Cloudflare tunnel kurarak HTTPS endpoint
cloudflared tunnel --url http://192.168.1.8:80
# Çıktı: https://abc123.trycloudflare.com
```

## ❗ Sorun Giderme

### Port Erişim Testi:
```bash
# Port açık mı kontrol
telnet 176.88.29.215 8080
```

### ESP32 Bağlantı Kontrolü:
```bash
# Local network'te ping
ping 192.168.1.8

# HTTP yanıt kontrolü  
curl -I http://192.168.1.8/stream
```

### Router Log Kontrolü:
```
• Router admin panel > System Log
• Port forwarding trafiği loglarını kontrol et
• Firewall blocked connections varsa whitelist'e al
```

## 🎉 Başarılı Kurulum

Doğru kurulumda:
```
✅ Local: http://192.168.1.8/stream - ÇALIŞIR
✅ Public: http://176.88.29.215:8080/stream - ÇALIŞIR  
✅ CityV Production: city-v.com/business - KAMERA GÖRÜNÜR
```

## 📞 Destek

Kurulum sorunları için:
- ESP32 IP: `192.168.1.8` sabit olmalı
- Router model/versiyonunu belirtin
- Port forwarding test sonuçlarını paylaşın