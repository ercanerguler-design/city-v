# 🏢 Business Üyesi İçin City-V Entegrasyon Rehberi

## 🎯 Özet
İşletmenizi City-V anasayfasında göstermek için bu adımları takip edin. Çalışma saatlerinize göre **"AÇIK"** veya **"KAPALI"** durumu otomatik olarak güncellenecek.

## ✅ Adım Adım Rehber

### 1. Dashboard'a Giriş Yapın
- Business hesabınızla giriş yapın
- Ana sayfada "Dashboard" sekmesine tıklayın

### 2. İşletme Bilgilerini Doldurun
Gerekli bilgiler:
- ✅ İşletme adı
- ✅ İşletme türü (restoran, cafe, market, vb.)
- ✅ Adres
- ✅ **Konum (Enlem/Boylam)** - Haritadan seçebilirsiniz
- ✅ Telefon
- ✅ E-posta
- ⭐ Website (opsiyonel)
- ⭐ Logo (opsiyonel)

### 3. Çalışma Saatlerini Ayarlayın

**Ayarlar → City-V Anasayfa Entegrasyonu** bölümüne gidin.

#### Günlük Saatler
Her gün için:
1. **Açık/Kapalı** toggle'ını seçin
2. Açılış saati girin (örn: 09:00)
3. Kapanış saati girin (örn: 18:00)

#### Hızlı Ayar: Tümüne Uygula
- Bir günün saatlerini ayarlayın
- "Tümüne Uygula" butonuna tıklayın
- Tüm günler aynı saatleri alır

**Örnek Senaryolar:**

**Senaryo 1: Hafta içi açık, hafta sonu kapalı**
```
Pazartesi - Cuma: 09:00 - 18:00 (Açık)
Cumartesi - Pazar: Kapalı
```

**Senaryo 2: Cafe/Restoran (haftasonu farklı)**
```
Pazartesi - Perşembe: 08:00 - 23:00 (Açık)
Cuma - Cumartesi: 08:00 - 01:00 (Açık)
Pazar: 09:00 - 23:00 (Açık)
```

**Senaryo 3: 24 Saat Açık**
```
Tüm günler: 00:00 - 23:59 (Açık)
```

### 4. Görünürlük Ayarları

**Haritada Göster:**
- ✅ Aktif: İşletmeniz City-V haritasında görünür
- ❌ Pasif: İşletmeniz haritada görünmez

**Otomatik Senkronizasyon:**
- ✅ Aktif: Değişiklikler otomatik City-V'ye yansır
- ❌ Pasif: Manuel güncelleme gerekir

### 5. Kaydet ve Doğrula

1. **"Kaydet"** butonuna tıklayın
2. Başarı mesajı bekleyin: "✅ Çalışma saatleri başarıyla güncellendi"
3. Sync durumunu kontrol edin:
   - 🟢 **Yeşil banner:** "İşletmeniz City-V'de görünüyor"
   - 🟠 **Turuncu banner:** "İşletmeniz henüz City-V'de görünmüyor"

### 6. City-V'de Kontrol Edin

1. https://cityv.app (veya http://localhost:3000) adresine gidin
2. Haritada işletmenizi bulun
3. İşletme kartında şunları göreceksiniz:
   - 🟢 **AÇIK** badge'i (çalışma saatlerindesiniz)
   - 🔴 **KAPALI** badge'i (çalışma saatleriniz dışında)
   - ⏰ Çalışma saatleri programı

## 🔄 Otomatik Özellikler

### Otomatik Location ID
İşletme adınız ve şehrinizden otomatik URL oluşturulur:
- Örnek: "Kahve Dünyası Ankara" → `kahve-dunyasi-ankara`
- Türkçe karakterler otomatik çevrilir (ğ→g, ü→u, ş→s)
- Aynı isim varsa sayı eklenir (kahve-dunyasi-ankara-2)

### Otomatik Kategori Eşleştirme
İşletme türünüz City-V kategorisine otomatik eşleştirilir:
- Restaurant → Restaurant
- Cafe → Cafe
- Shopping → Alışveriş
- Hospital → Sağlık
- Bank → Banka
- Gym → Spor
- vb.

### Real-Time Güncellemeler
- Çalışma saatleri her gün otomatik kontrol edilir
- AÇIK/KAPALI durumu anlık güncellenir
- IoT kamera verileriniz varsa, kalabalık seviyesi gösterilir
- Kampanyalarınız anasayfada öne çıkar

## 📱 City-V'de Nasıl Görünürsünüz?

### Harita Marker'ı
- İşletme türünüze özel ikon
- İsminiz
- Mevcut durumunuz (AÇIK/KAPALI)

### İşletme Kartı
Kullanıcılar marker'a tıkladığında:
- 📸 Logo/Fotoğraflar
- 📍 Adres
- 📞 Telefon
- 🌐 Website
- ⏰ Çalışma saatleri
- 👥 Anlık kalabalık (IoT kameranız varsa)
- ⭐ Değerlendirmeler
- 🎯 Aktif kampanyalar

### Durum Badge'leri
- 🟢 **AÇIK** - Yeşil, çalışma saatlerindesiniz
- 🔴 **KAPALI** - Kırmızı, çalışma saatleriniz dışında
- 🔴 **KAPALI (Bugün çalışmıyor)** - Bugün kapalısınız

## ⚠️ Dikkat Edilmesi Gerekenler

### Konum Bilgisi ZORUNLU
- Latitude (Enlem) ve Longitude (Boylam) mutlaka girilmeli
- Google Maps'ten konum seçebilirsiniz
- Yanlış konum = Haritada yanlış yerde görünürsünüz

### Çalışma Saatleri Güncel Tutun
- Özel günlerde (bayram, tatil) saatleri güncelleyin
- Geçici kapatma durumunda "Haritada Göster" toggle'ını kapatın
- Mevsimsel değişiklikler için saatleri ayarlayın

### Test Edin
- Kaydetmeden önce saatleri iki kez kontrol edin
- City-V anasayfasında işletmenizi görün
- AÇIK/KAPALI durumunun doğru olduğundan emin olun

## 🆘 Sorun Giderme

### Sorun: İşletmem haritada görünmüyor
**Çözüm:**
1. Konum bilgisi girilmiş mi?
2. "Haritada Göster" aktif mi?
3. Kaydet butonuna tıklandı mı?
4. Sync durumu yeşil mi?
5. Sayfayı yenileyin (F5)

### Sorun: AÇIK/KAPALI yanlış gösteriliyor
**Çözüm:**
1. Çalışma saatlerini tekrar kontrol edin
2. Doğru günü seçtiğinizden emin olun
3. Saatlerin doğru formatta olduğunu kontrol edin (HH:MM)
4. Kaydedin ve 30 saniye bekleyin

### Sorun: Değişiklikler yansımıyor
**Çözüm:**
1. "Otomatik Senkronizasyon" aktif mi?
2. İnternet bağlantınızı kontrol edin
3. Tarayıcı cache'ini temizleyin
4. Kaydet butonuna tekrar tıklayın

## 💡 İpuçları

### Daha Fazla Görünürlük
- ✅ Logo ve fotoğraf ekleyin
- ✅ Detaylı açıklama yazın
- ✅ Website linki verin
- ✅ ESP32 kamera entegrasyonu yapın (anlık kalabalık)
- ✅ Kampanya oluşturun
- ✅ Düzenli olarak bilgileri güncelleyin

### Müşteri Deneyimi
- Doğru çalışma saatleri = Müşteri memnuniyeti
- Kampanyalarınızı güncel tutun
- Fotoğraflarınızı düzenli güncelleyin
- Yorumlara cevap verin

### SEO ve Keşfedilebilirlik
- Location ID'niz URL'de kullanılır: `cityv.app/location/kahve-dunyasi-ankara`
- Doğru kategori seçimi = Doğru filtreler
- Detaylı bilgi = Daha üst sıralarda

## 📞 Destek

Sorularınız için:
- 📧 E-posta: support@cityv.app
- 💬 Canlı destek: Dashboard → Yardım
- 📚 Dökümanlar: cityv.app/docs

## 🎉 Başarılı Entegrasyon!

Artık işletmeniz City-V ekosisteminin bir parçası! Kullanıcılar sizi:
- 🗺️ Haritada bulabilir
- ⏰ Açık olduğunuzda görebilir
- 📍 Kolayca yol tarifi alabilir
- 👥 Anlık kalabalık görebilir
- 🎯 Kampanyalarınızı keşfedebilir

**Hoş geldiniz!** 🚀
