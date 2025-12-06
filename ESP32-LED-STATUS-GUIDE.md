# 💡 ESP32-CAM LED Status Guide
## Visual Feedback System

---

## 📍 LED Pinleri

### LED_BUILTIN (GPIO 4)
- **Konum**: Flash LED (kamera yanında beyaz LED)
- **Kullanım**: WiFi durumu, detection feedback, sistem mesajları
- **Parlaklık**: Çok parlak (fotoğraf flaşı)

### LED_STATUS (GPIO 33)
- **Konum**: Yerleşik kırmızı LED (bazı modellerde)
- **Kullanım**: Detection durumu, kalibrasyon
- **Parlaklık**: Normal (gösterge LED'i)

---

## 🎯 LED SINYALLERI

### 🔵 Boot Sequence (İlk Açılış)
```
⚪⚪⚪ (3 kez yavaş yanıp sönme, 200ms)
```
**Anlamı**: ESP32-CAM başarıyla boot oldu

---

### 📡 WiFi Durumu

#### ✅ WiFi Bağlı
```
⚪ (LED sürekli yanık - LOW state)
```
**LED_BUILTIN**: Sabit yanık  
**Anlamı**: WiFi bağlantısı aktif ve stabil

#### ❌ WiFi Bağlı Değil (AP Modu)
```
⚪____⚪____⚪____ (yavaş yanıp sönme, 1 saniye)
```
**LED_BUILTIN**: 1 saniyede bir yanıp sönüyor  
**Anlamı**: WiFi bağlantısı yok veya AP modunda  
**Aksiyon**: `CityV-Professional-CAM` ağına bağlan

#### 🔄 WiFi Reconnecting
```
⚪_⚪_⚪_⚪_ (hızlı yanıp sönme)
```
**Anlamı**: WiFi bağlantısı kesildi, yeniden bağlanıyor

---

### 🔧 Kalibrasyon

#### Kalibrasyon Başlıyor
```
⚪___⚪___⚪___ (3 kez yavaş, 200ms)
```
**Anlamı**: Otomatik kalibrasyon başladı  
**Süre**: ~5 saniye

#### ✅ Kalibrasyon Başarılı
```
⚪⚪ (2 kez hızlı, 100ms)
```
**Anlamı**: Kalibrasyon tamamlandı, sistem hazır

#### ❌ Kalibrasyon Hatası
```
⚪⚪⚪⚪⚪ (5 kez çok hızlı, 50ms)
```
**Anlamı**: Kamera hatası veya kalibrasyon başarısız

---

### 👥 Detection (İnsan Tespiti)

#### 0 Kişi (Boş Alan)
```
⚪ (tek kısa blink, 50ms)
```
**Anlamı**: Alan boş, kimse yok

#### 1-9 Kişi (Az Kalabalık)
```
⚪⚪ (2 kez yanıp sön, 100ms)
```
**Anlamı**: Az sayıda insan tespit edildi  
**Yoğunluk**: LOW

#### 10-29 Kişi (Orta Kalabalık)
```
⚪⚪⚪ (3 kez yanıp sön, 100ms)
```
**Anlamı**: Orta seviye kalabalık  
**Yoğunluk**: MEDIUM

#### 30+ Kişi (Yoğun Kalabalık)
```
⚪⚪⚪⚪⚪ (sürekli yanık 500ms)
```
**Anlamı**: Yoğun kalabalık tespit edildi  
**Yoğunluk**: HIGH / OVERCROWDED

---

### 📤 Veri Gönderimi

#### ✅ Neon DB'ye Başarılı
```
⚪ (tek hızlı blink, 50ms)
```
**Anlamı**: Veri başarıyla Neon Database'e gönderildi  
**Sıklık**: Her 5 saniyede bir (detection sonrası)

#### ❌ Gönderim Hatası
```
⚪⚪⚪⚪⚪ (5 kez çok hızlı, 50ms)
```
**Anlamı**: HTTP hatası, veri SD karta kaydedildi  
**Aksiyon**: WiFi kontrol et veya API URL doğrula

---

### ⚠️ Validation Hataları

#### Validation Failed
```
⚪⚪⚪⚪⚪ (5 kez hızlı, 50ms)
```
**Anlamı**: Detection validation başarısız  
**Sebepler**:
- Düşük confidence (<60%)
- Mantık dışı sayım
- İşlem süresi çok uzun

---

## 🌐 Web Panel LED Kontrolleri

### LED Açma/Kapatma
**URL**: `http://[ESP32-IP]/led-toggle`

**Buton**: 💡 LED ON/OFF

**Durum Renkleri**:
- 🟣 Mor: LED aktif
- ⚫ Gri: LED kapalı

**Kullanım**: Gece çekimlerinde LED'i kapat

---

### LED Test Sequence
**URL**: `http://[ESP32-IP]/led-test`

**Buton**: ✨ Test LED

**Test Dizisi**:
1. 5 kez normal blink (100ms)
2. Başarı pattern (2x fast)
3. Hata pattern (5x fast)
4. Kalibrasyon pattern (3x slow)

**Süre**: ~5 saniye

**Amaç**: LED'in çalıştığını doğrula

---

## 🔧 TROUBLESHOOTING

### Problem: LED Hiç Yanmıyor

**Kontrol Listesi**:
1. ✅ GPIO pinleri doğru mu?
   - LED_BUILTIN = 4 (Flash LED)
   - LED_STATUS = 33 (Status LED)
2. ✅ `ledEnabled = true` mi? (kod içinde)
3. ✅ Power supply yeterli mi? (5V 2A)
4. ✅ Web panel → Test LED denendi mi?

**Çözüm**:
```cpp
// Pin değiştir (bazı modellerde GPIO 33 yerine GPIO 4)
#define LED_BUILTIN 4
#define LED_STATUS 4  // İkisi de aynı LED kullanabilir
```

---

### Problem: LED Çok Parlak (Rahatsız Edici)

**Çözüm 1**: Web panelden kapat
```
http://[IP]/led-toggle
```

**Çözüm 2**: Kodda kapat
```cpp
bool ledEnabled = false; // true → false
```

**Çözüm 3**: PWM ile parlaklığı azalt
```cpp
void ledBlink(int pin, int times, int delayMs = 100) {
  for (int i = 0; i < times; i++) {
    analogWrite(pin, 50);  // 0-255 (50 = düşük parlaklık)
    delay(delayMs);
    analogWrite(pin, 0);
    delay(delayMs);
  }
}
```

---

### Problem: LED Sadece WiFi Durumunu Gösteriyor

**Sebep**: Detection LED'i (GPIO 33) yok veya bağlı değil

**Çözüm**: İkisi de aynı LED kullanabilir
```cpp
#define LED_STATUS 4  // LED_BUILTIN ile aynı
```

---

### Problem: LED Sinyalleri Çok Hızlı/Yavaş

**Ayar**: `ledBlink()` delay'lerini değiştir
```cpp
// Daha yavaş
ledBlink(LED_BUILTIN, 3, 300); // 300ms (varsayılan 200ms)

// Daha hızlı
ledBlink(LED_BUILTIN, 3, 50);  // 50ms (varsayılan 200ms)
```

---

## 📊 LED PATTERN TABLOSU

| Durum | Pattern | Blink | Delay | Anlamı |
|-------|---------|-------|-------|--------|
| **Boot** | ⚪⚪⚪ | 3 | 200ms | Sistem başladı |
| **WiFi OK** | ⚪ | Sürekli | - | Bağlı |
| **WiFi Yok** | ⚪____⚪____ | ∞ | 1000ms | Bağlantı yok |
| **Kalibrasyon** | ⚪___⚪___⚪___ | 3 | 200ms | Kalibre ediliyor |
| **Başarı** | ⚪⚪ | 2 | 100ms | İşlem tamam |
| **Hata** | ⚪⚪⚪⚪⚪ | 5 | 50ms | Hata oluştu |
| **0 Kişi** | ⚪ | 1 | 50ms | Boş |
| **1-9 Kişi** | ⚪⚪ | 2 | 100ms | Az |
| **10-29 Kişi** | ⚪⚪⚪ | 3 | 100ms | Orta |
| **30+ Kişi** | ⚪⚪⚪⚪⚪ | Sürekli | 500ms | Yoğun |
| **Veri Gönder** | ⚪ | 1 | 50ms | DB'ye gönderildi |

---

## 🎓 LED FEEDBACK NASIL ÇALIŞIR?

### Detection Loop (Her 5 Saniye)

```
1. 📷 Camera capture
   └─ LED: Yok (sessiz)

2. 🧠 Detection (3 algorithm)
   └─ LED: Yok (processing)

3. ✅ Validation
   ├─ Başarılı → ledDetection(count)
   └─ Başarısız → ledError()

4. 📤 Send to Neon DB
   ├─ HTTP 200/201 → ledBlink(1x)
   └─ HTTP Error → ledError()

5. ⏱️ 5 saniye bekle
   └─ loop tekrar
```

### WiFi Status (Continuous)

```
loop() içinde sürekli:
if (WiFi.status() == WL_CONNECTED) {
  digitalWrite(LED_BUILTIN, LOW); // Yanık
} else {
  // Yavaş yanıp sönme
  static unsigned long lastBlink = 0;
  if (millis() - lastBlink > 1000) {
    toggle LED
  }
}
```

---

## 🔐 GÜVENLİK & GIZLILIK

### LED ve GDPR

**Soru**: LED kişisel veri mi?

**Cevap**: HAYIR

LED sadece sayısal veri gösterir:
- ✅ Kaç kişi var (anonim)
- ✅ Sistem durumu
- ❌ Kimlik bilgisi YOK
- ❌ Yüz tanıma YOK
- ❌ Tracking YOK

### Gece Modu

Gece çekimlerinde LED kamera görüntüsünü etkileyebilir:

**Çözüm**: Web panelden kapat
```
💡 LED OFF
```

Veya kodda otomatik:
```cpp
// Karanlık ortamda LED'i kapat
if (calibration.lightingLevel < 30) {
  ledEnabled = false;
  Serial.println("🌙 Night mode: LED disabled");
}
```

---

## 📱 UZAKTAN İZLEME

### Web Panel Status Card

```
📊 System Status
├─ LED Status: ✅ Enabled / ❌ Disabled
├─ Last Blink: 2 seconds ago
└─ Pattern: Detection (3x)
```

### JSON Status API

```bash
curl http://192.168.1.100/status
```

```json
{
  "led_enabled": true,
  "led_status": "active",
  "last_pattern": "detection",
  "blink_count": 3
}
```

---

## 🎉 ÖZET

### LED Durumları (Hızlı Referans)

**Normal Çalışma**:
```
⚪ (sürekli) - WiFi bağlı
⚪⚪ (her 5 saniye) - 1-9 kişi tespit edildi
⚪ (tek blink) - Veri gönderildi
```

**Sorun Var**:
```
⚪____⚪____ (yavaş) - WiFi bağlantısı yok
⚪⚪⚪⚪⚪ (hızlı) - Hata oluştu
```

**Bakım**:
```
⚪___⚪___⚪___ (3x yavaş) - Kalibrasyon
⚪⚪⚪ (3x orta) - Boot sequence
```

### LED Kapatma

**Neden?**
- Gece çekimleri
- Parlaklık rahatsız ediyor
- Güç tasarrufu
- Production deployment (sessiz mod)

**Nasıl?**
1. Web panel → 💡 LED OFF
2. Kod → `ledEnabled = false`
3. Auto night mode (lighting < 30)

---

**Document Version**: 1.0  
**Date**: December 6, 2025  
**LED System**: ✅ Fully Implemented  
**Web Control**: ✅ Available  
**Test Mode**: ✅ Ready
