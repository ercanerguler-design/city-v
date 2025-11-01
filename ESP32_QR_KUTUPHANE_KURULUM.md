# 📚 ESP32QRCodeReader Kütüphanesi Kurulum

## ❌ Hata
```
fatal error: ESP32QRCodeReader.h: No such file or directory
```

Bu hata kütüphane yüklü olmadığı için oluşuyor.

---

## ✅ ÇÖZÜM - 2 Yöntem

### 🎯 YÖNTEM 1: Library Manager (ÖNERİLEN)

1. **Arduino IDE'yi Aç**

2. **Sketch** → **Include Library** → **Manage Libraries...**

3. Arama kutusuna yaz:
   ```
   ESP32QRCodeReader
   ```

4. **"ESP32QRCodeReader by alvarowolfx"** kütüphanesini bul

5. **Install** butonuna tıkla

6. Kurulum tamamlanınca **Close**

7. Kodu tekrar yükle (**Upload**)

---

### 🎯 YÖNTEM 2: Manuel Kurulum (Alternatif)

Eğer Library Manager'da bulamıyorsan:

1. **GitHub'dan İndir:**
   ```
   https://github.com/alvarowolfx/ESP32QRCodeReader
   ```
   
2. **"Code"** → **"Download ZIP"** tıkla

3. Arduino IDE'de:
   - **Sketch** → **Include Library** → **Add .ZIP Library...**
   - İndirdiğin ZIP dosyasını seç
   - **Open** tıkla

4. Kütüphane yüklendi!

---

## 🔍 Kontrol Et

Kurulumu doğrulamak için:

**File** → **Examples** → **ESP32QRCodeReader** klasörünü ara

Eğer görüyorsan kütüphane başarıyla yüklendi! ✅

---

## ⚠️ Dikkat Edilecekler

### Board Ayarı
**Tools** → **Board** → **ESP32 Arduino** → **AI Thinker ESP32-CAM**

### Bağımlılıklar
ESP32QRCodeReader otomatik olarak şunları da yükler:
- **quirc** (QR kod decode kütüphanesi)

Bunlar otomatik gelir, ekstra bir şey yapman gerekmez.

---

## 🚀 Kurulum Sonrası

Kütüphane yüklendikten sonra:

1. **esp32-cam-cityv.ino** dosyasını aç
2. **Verify/Compile** (✓ işareti) tıkla
3. Hata yoksa **Upload** (→ işareti) tıkla
4. Serial Monitor'ü aç (115200 baud)
5. Kameranın başladığını gör:
   ```
   =====================================
      CITYV PROFESSIONAL AI CAMERA
   =====================================
   [BONUS] 📱 Staff Recognition Starting...
   ✅ QR Code Scanner Ready!
   ```

---

## 🐛 Hala Hata Alıyorsan

### Hata 1: "Board not found"
**Çözüm:** ESP32 board paketini yükle
- **File** → **Preferences**
- **Additional Board Manager URLs** altına ekle:
  ```
  https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
  ```
- **Tools** → **Board** → **Boards Manager**
- "esp32" ara ve yükle

### Hata 2: "Port not found"
**Çözüm:** USB sürücüsünü yükle
- CH340 veya CP2102 USB-Serial driver indir
- Bilgisayarı yeniden başlat
- USB kablosunu değiştir (bazı kablolar sadece şarj yapar)

### Hata 3: Kütüphane görünmüyor
**Çözüm:** Arduino IDE'yi kapat ve tekrar aç
- Bazen restart gerekir

---

## 📞 Destek

Hala sorun yaşıyorsan Serial Monitor'den aldığın tam hatayı paylaş!

---

## ✅ Başarı Sonrası

Kütüphane yüklendikten sonra sistemin özellikleri:

✅ Real-time insan tespiti
✅ Kalabalık analizi  
✅ **QR kod okuma (YENİ!)**
✅ **Personel check-in/out (YENİ!)**
✅ LED geri bildirim
✅ WiFi Manager
✅ Web Server

Şimdi personel kartlarındaki QR kodları okutabilirsin! 🎉
