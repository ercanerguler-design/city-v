# ESP32-CAM GERÇEK SİSTEM KURULUMU

## ✅ VERİTABANI HAZIR
- Device ID: 29
- IP: 192.168.1.100
- Stream: http://192.168.1.100:81/stream
- Kalibrasyon: Yapılandırıldı
- Gerçek zamanlı veri: 87 kayıt (son 1 saat)

## 📹 ESP32-CAM KURULUM ADIMLARI

### 1. Arduino IDE'de Kodu Yükleyin
```
Dosya: esp32-cam-cityv.ino
Board: AI Thinker ESP32-CAM
Upload Speed: 115200
```

### 2. İlk Başlatma (WiFi Yapılandırma)
1. ESP32'yi açın
2. LED yanıp söner (AP modu)
3. WiFi ağlarında "CityV-AI-Camera" görünür
4. Bağlanın (Şifre: cityv2024)
5. Tarayıcı otomatik açılır: 192.168.4.1
6. WiFi seçin ve şifresini girin
7. **Önemli**: Static IP 192.168.1.100 ayarlayın

### 3. Router Ayarları
Router'dan 192.168.1.100'ü rezerve edin:
- MAC address'i bulun
- DHCP Reservation yapın
- IP: 192.168.1.100
- Gateway: 192.168.1.1

### 4. Test
```powershell
# Bağlantı testi
ping 192.168.1.100

# Stream testi
curl http://192.168.1.100:81/stream

# Status kontrolü
curl http://192.168.1.100/status
```

## 🚀 SİSTEM ÖZELLİKLERİ

### Frontend (Çalışıyor ✅)
- Next.js 15 + React 19
- TensorFlow.js ile AI detection
- Gerçek zamanlı analytics
- Business dashboard

### Backend (Çalışıyor ✅)
- Vercel Postgres
- Real-time API'ler
- IoT data processing
- Analytics engine

### IoT (Hazır - ESP32 Bekleniyor 🟡)
- ESP32-CAM firmware yüklü
- WiFi Manager aktif
- Stream endpoint: /stream
- Analytics endpoint: /analyze

## 📊 ANALYTICS ÖZET
- Business ID: 6
- Cihaz Sayısı: 1
- Anlık Veri: 87 kayıt
- Son Güncelleme: Az önce

## 🎯 LANSMANtanı HAZIRIZ!

### Çalışan Özellikler:
✅ Kullanıcı girişi
✅ Business dashboard
✅ Analytics gösterimi
✅ Gerçek zamanlı veriler
✅ Database entegrasyonu
✅ AI detection (TensorFlow.js)

### ESP32 Bağlandığında:
🔜 Canlı kamera stream'i
🔜 Gerçek zamanlı insan sayımı
🔜 Giriş/çıkış takibi
🔜 Isı haritası
🔜 Otomatik raporlama

## 🔧 SORUN GİDERME

### ESP32 Bağlanamıyor?
1. Güç kaynağı: 5V 2A şarj cihazı kullanın
2. USB kablosu: Veri kablosu olmalı (şarj kablosu değil)
3. Reset butonuna basın
4. Serial Monitor'de log kontrol edin

### Stream Gözükmüyor?
1. IP doğru mu? `ping 192.168.1.100`
2. Port açık mı? `telnet 192.168.1.100 81`
3. Firewall kapalı mı?
4. HTTPS/HTTP mixed content uyarısı var mı?

### WiFi Bağlantısı Kesiliyor?
1. Router'a yakın yerleştirin
2. 2.4GHz kullanın (5GHz değil)
3. Static IP doğrulayın
4. Router'da power saving'i kapatın

## 💡 ÖNERİLER

1. **ESP32'yi Sürekli Açık Tutun**: Güç kesintisi olmamalı
2. **Network Stability**: Ethernet kullanın router için
3. **Backup Power**: UPS öneririz
4. **Multiple Cameras**: Daha fazla kamera eklenebilir

## 📞 DESTEK

Sorun yaşarsanız:
1. Serial Monitor log'ları gönderin
2. Browser console log'ları gönderin  
3. Network ping sonuçlarını gönderin
