# 📶 ESP32-CAM WiFi Uzaktan Ayar Rehberi

## 🚀 ESP32-CAM Professional AI v4.0

### ✅ Özellikler:
- **🔄 Otomatik WiFi yönetimi** 
- **📱 Uzaktan WiFi sıfırlama**
- **⚙️ Web tabanlı ayar paneli**
- **🧠 AI analiz sistemi aktif**

---

## 🔧 İlk Kurulum

### 1️⃣ Cihazı Açın
- ESP32-CAM'ı güce bağlayın
- Serial Monitor'ü 115200 baud'da açın

### 2️⃣ WiFi Hotspot Modu
Eğer daha önce WiFi ayarı yapılmamışsa:
```
📶 Hotspot: CityV-AI-Camera
🔑 Şifre: cityv2024
🌐 Adres: http://192.168.4.1
```

### 3️⃣ WiFi Ayarı
1. **Telefonunuzla** `CityV-AI-Camera` WiFi'sine bağlanın
2. **Tarayıcıda** `http://192.168.4.1` adresini açın
3. **WiFi seçin** ve şifrenizi girin
4. **Save** butonuna basın
5. **Cihaz otomatik** yeniden başlar

---

## 🌐 Uzaktan WiFi Yönetimi

### 📡 Ana Web Panel
Cihaz WiFi'ye bağlandıktan sonra:
```
http://[ESP32-IP-ADRESI]/
```

### 🔄 WiFi Sıfırlama
1. Ana panelde **"WiFi Ayarlarını Sıfırla"** butonuna tıklayın
2. Onay verin
3. Cihaz yeniden başlar ve hotspot moduna geçer
4. Yeni WiFi ayarı yapabilirsiniz

---

## 📱 Kullanım Adımları

### 🎯 Senaryo 1: İlk Kurulum
```
1. ESP32'yi aç
2. "CityV-AI-Camera" WiFi'sine bağlan (cityv2024)
3. http://192.168.4.1 → WiFi seç ve kaydet
4. Cihaz yeniden başlar → Hazır!
```

### 🔄 Senaryo 2: WiFi Değiştirme
```
1. http://[cihaz-ip]/ sayfasını aç
2. "WiFi Ayarlarını Sıfırla" butonuna bas
3. Cihaz yeniden başlar (hotspot modu)
4. Yeni WiFi ayarını yap
```

### 📊 Senaryo 3: Sistem Kontrolü
```
Ana Panel: http://[cihaz-ip]/
Canlı İzleme: http://[cihaz-ip]/stream
AI Durumu: http://[cihaz-ip]/status
```

---

## 🚨 Sorun Giderme

### ❌ WiFi Bağlanmıyor
- **Reset tuşuna** 5 saniye basın
- Cihaz hotspot moduna geçer
- Yeniden WiFi ayarı yapın

### 📶 Zayıf Sinyal
- **Sinyal gücünü** kontrol edin: Serial Monitor
- **Cihazı** router'a yaklaştırın
- **Güçlü WiFi** ağı seçin

### 🔍 IP Bulamıyorum
Serial Monitor'de IP adresini görebilirsiniz:
```
✅ WiFi: YourNetworkName
📡 IP Adresi: 192.168.1.xxx
```

---

## ⚡ Teknik Özellikler

- **WiFi Manager**: Otomatik hotspot ve portal
- **Timeout**: 3 dakika (ayar yapılmazsa yeniden başlar)
- **Portal IP**: 192.168.4.1
- **EEPROM**: WiFi ayarları kalıcı olarak saklanır
- **Web Server**: 80 portu, CORS aktif

---

## 🎯 Önemli Notlar

✅ **Çalışan sistem** - Hiç sorun çıkarmaz
✅ **Uzaktan yönetim** - Web paneli ile tam kontrol  
✅ **Otomatik reconnect** - Bağlantı kopsa tekrar bağlanır
✅ **Mobile friendly** - Telefondan kolay ayar
✅ **Professional UI** - Güzel web arayüzü

**📞 Destek için:** Serial Monitor'ü takip edin, tüm işlemler loglanır!