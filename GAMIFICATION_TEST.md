# 🎮 Gamification Sistemi Test Rehberi

## 🚀 Başlamadan Önce

Server: **http://localhost:3001** adresinde çalışıyor.
Tarayıcıda **CTRL+SHIFT+R** ile hard refresh yapın ve **F12** ile Console'u açın.

---

## ✅ TEST ADIMLARI

### 1️⃣ HEADER BUTONU TESTİ
- [ ] Header'da sarı-turuncu "Oyuncu Profili" butonu görünüyor mu?
- [ ] Butona tıklayınca Gamification Dashboard açılıyor mu?
- [ ] Dashboard'da Seviye 1, 0 puan görünüyor mu?
- [ ] Tüm rozetler kilitli görünüyor mu?

### 2️⃣ KONUM ZİYARETİ TESTİ (Check-in +10 puan)
**Adımlar:**
1. "Konum Kullan" butonuna tıkla
2. Haritada bir mekan seç
3. "Buraya Git" butonuna tıkla

**Beklenen Sonuçlar:**
- [ ] Console'da: "⭐ +10 puan kazandın! Sebep: Konum ziyareti"
- [ ] Gamification Dashboard'da totalCheckIns: 1
- [ ] Total Points: 10
- [ ] İlk ziyarette "İlk Adım" rozeti açılmalı
- [ ] Toast bildirimi: "🎯 Yeni Rozet: İlk Adım!"
- [ ] Rozet puanı: +20 puan (Toplam 30 puan olmalı)

**10 farklı lokasyon ziyaret et:**
- [ ] 10. ziyarette "Kaşif" rozeti açılmalı (🗺️ Common)
- [ ] Toast: "🏆 Yeni Rozet: Kaşif!"
- [ ] +20 puan bonus

### 3️⃣ RAPOR GÖNDERME TESTİ (+15 puan)
**Adımlar:**
1. Bir lokasyona git
2. "Rapor Gönder" butonuna tıkla
3. Yoğunluk seviyesi seç ve formu doldur
4. Gönder

**Beklenen Sonuçlar:**
- [ ] Console'da: "⭐ +15 puan kazandın! Sebep: Rapor gönderme"
- [ ] Toast: "✅ Rapor başarıyla gönderildi"
- [ ] totalReports: 1

**5 rapor gönder:**
- [ ] 5. raporda "Muhabir" rozeti açılmalı (📰 Common)
- [ ] +20 puan bonus

### 4️⃣ ROTA OLUŞTURMA TESTİ (+5 puan)
**Adımlar:**
1. Haritada bir nokta seç
2. "Rota Oluştur" butonuna tıkla
3. Hedef nokta seç
4. Ulaşım yöntemi seç (yürüyüş/bisiklet/araba)
5. Rota Hesapla

**Beklenen Sonuçlar:**
- [ ] Console'da: "⭐ +5 puan kazandın! Sebep: Rota oluşturma"
- [ ] Toast: "✅ Rota başarıyla oluşturuldu"
- [ ] totalRoutes: 1

**10 rota oluştur:**
- [ ] 10. rotada "Navigatör" rozeti açılmalı (🧭 Rare)
- [ ] +50 puan bonus

### 5️⃣ FAVORİ EKLEME TESTİ (+3 puan)
**Adımlar:**
1. Bir lokasyon kartında kalp ikonuna tıkla
2. "❤️ ... favorilere eklendi!" mesajını gör

**Beklenen Sonuçlar:**
- [ ] Console'da: "⭐ +3 puan kazandın! Sebep: Favoriye ekleme"
- [ ] Toast: "❤️ [Mekan Adı] favorilere eklendi!"
- [ ] favoritesCount: 1

**20 favori ekle:**
- [ ] 20. favoride "Koleksiyoncu" rozeti açılmalı (❤️ Rare)
- [ ] +50 puan bonus

### 6️⃣ SEVİYE ATLAMA TESTİ
**100 puan toplayınca:**
- [ ] Seviye 2'ye atlama otomatik olmalı
- [ ] Toast: "🎉 Tebrikler! Seviye 2'e Atladın!"
- [ ] Dashboard'da Level: 2
- [ ] Progress bar sıfırlanmalı
- [ ] Console'da: "🎉 Seviye Atladın! Yeni seviye: 2"

**Hızlı puan toplama:**
- 10 konum ziyareti = 10 × 10 = 100 puan (Seviye 2)
- İlk Adım rozeti = +20 puan
- Kaşif rozeti = +20 puan
- **Toplam: 140 puan = Seviye 2**

### 7️⃣ STREAK TESTİ (Günlük Seri)
**Not:** Bu test gerçek zamanlı çalışır (24 saat beklemeli)

**Adımlar:**
1. Bugün bir lokasyon ziyaret et
2. Yarın tekrar giriş yap ve ziyaret et
3. 7 gün üst üste ziyaret et

**Beklenen Sonuçlar:**
- [ ] streak: 1, 2, 3... artmalı
- [ ] 7. günde "Kararlı" rozeti açılmalı (🔥 Epic)
- [ ] +100 puan bonus (Epic rozet)

### 8️⃣ BAŞARIM TESTLERİ

#### Başarım 1: Hoş Geldin (10 puan)
- [ ] İlk giriş yapınca otomatik açılmalı
- [ ] Toast: "🎯 Başarım Tamamlandı: Hoş Geldin!"

#### Başarım 2: Sosyal Kelebek (50 puan)
- [ ] 5 farklı kategori ziyaret et (cafe, bank, park, market, pharmacy)
- [ ] Başarım tamamlanmalı

#### Başarım 3: Usta Muhabir (100 puan)
- [ ] 20 rapor gönder
- [ ] Başarım tamamlanmalı

#### Başarım 4: Rota Ustası (150 puan)
- [ ] 50 rota oluştur
- [ ] Başarım tamamlanmalı

#### Başarım 5: Şehir Uzmanı (200 puan)
- [ ] Tüm kategorileri ziyaret et
- [ ] Başarım tamamlanmalı

### 9️⃣ DASHBOARD TESTİ

**Stats Cards:**
- [ ] Visits sayısı doğru
- [ ] Reports sayısı doğru
- [ ] Routes sayısı doğru
- [ ] Streak sayısı doğru (🔥 icon)

**Badge Grid:**
- [ ] 10 rozet görünüyor
- [ ] Açılan rozetler renkli border ile gösteriliyor
- [ ] Kilitli rozetler gri ve Lock icon ile gösteriliyor
- [ ] Hover'da tooltip çalışıyor

**Achievements:**
- [ ] 5 başarım listesi görünüyor
- [ ] Tamamlanan başarımlar yeşil border ile gösteriliyor
- [ ] Progress barlar doğru çalışıyor

**Fun Facts:**
- [ ] Toplam favori sayısı
- [ ] En uzun streak
- [ ] Kazanılan rozet sayısı
- [ ] Seviye başına ortalama puan

### 🔟 PERSISTENCE TESTİ (LocalStorage)

**Adımlar:**
1. Birkaç puan kazan (örnek: 30 puan)
2. Bir rozet aç
3. Tarayıcıyı kapat
4. Tekrar aç ve sayfayı yenile (F5)

**Beklenen Sonuçlar:**
- [ ] Tüm puanlar korunmuş olmalı
- [ ] Seviye değişmemiş olmalı
- [ ] Rozetler açık kalmalı
- [ ] Streak korunmuş olmalı
- [ ] Tüm istatistikler aynı olmalı

---

## 🎯 HIZLI TEST SENARYOSU (5 dakika)

**Hedef:** Tüm mekanikleri hızlıca test et

1. **30 saniye:** Header'da Oyuncu Profili butonuna tıkla → Dashboard'ı gör
2. **1 dakika:** 10 konum ziyaret et → "İlk Adım" ve "Kaşif" rozetlerini aç
3. **1 dakika:** 5 rapor gönder → "Muhabir" rozetini aç
4. **1 dakika:** 3 rota oluştur → Puan kazan
5. **1 dakika:** 10 mekan favorilere ekle → Puan kazan
6. **30 saniye:** Dashboard'a tekrar bak → Tüm istatistikleri kontrol et
7. **30 saniye:** Seviye 2'ye atladığını doğrula (100+ puan)

**Beklenen Toplam Puan:**
- 10 konum × 10 = 100 puan
- İlk Adım rozeti = +20 puan
- Kaşif rozeti = +20 puan
- 5 rapor × 15 = 75 puan
- Muhabir rozeti = +20 puan
- 3 rota × 5 = 15 puan
- 10 favori × 3 = 30 puan
- **TOPLAM: 280 puan = Seviye 3!** 🎉

---

## 🐛 HATA AYIKLAMA

### Console'da Görmek İstediğin Loglar:

```
⭐ +10 puan kazandın! Sebep: Konum ziyareti
🏆 Yeni rozet kazandın: İlk Adım
⭐ +20 puan kazandın! Sebep: İlk Adım rozeti
🎉 Seviye Atladın! Yeni seviye: 2
```

### Toast Bildirimleri:

- 🎯 "Yeni Rozet: [Rozet Adı]!" (Renkli gradient)
- 🎉 "Tebrikler! Seviye X'e Atladın!" (Mor gradient)
- 🎯 "Başarım Tamamlandı: [Başarım]!" (Pembe gradient)

### LocalStorage Kontrolü:

F12 → Application → Local Storage → http://localhost:3001

Ara: `gamification-storage`

JSON içinde:
```json
{
  "state": {
    "stats": {
      "level": 2,
      "totalPoints": 280,
      "totalCheckIns": 10,
      "totalReports": 5,
      "totalRoutes": 3,
      "favoritesCount": 10,
      "streak": 1
    },
    "badges": [...],
    "achievements": [...]
  }
}
```

---

## ✨ BONUS: ENDER ROZETLERİ AÇMA

### Gece Kuşu (🦉 Rare) - +50 puan
- Gece 00:00 - 06:00 arası 10 konum ziyaret et
- Bilgisayar saatini değiştir (test için)

### Efsane (👑 Legendary) - +200 puan
- Toplam 1000 puan kazan
- En değerli rozet!

### Dünya Gezgini (✈️ Epic) - +100 puan
- 100 farklı lokasyon ziyaret et

### Gezgin (🧳 Rare) - +50 puan
- 50 farklı lokasyon ziyaret et

---

## 🎊 BAŞARI KRİTERLERİ

Sistem başarılı sayılır eğer:

✅ **Tüm puanlar doğru hesaplanıyor**
✅ **Rozetler otomatik açılıyor**
✅ **Toast bildirimleri görünüyor**
✅ **Seviye atlama çalışıyor**
✅ **Dashboard tüm verileri gösteriyor**
✅ **LocalStorage veriler korunuyor**
✅ **Hiçbir console hatası yok**

---

## 📝 TEST SONUÇLARINI RAPORLA

Test tamamlandığında şunları paylaş:

1. ✅ Başarılı testler (yeşil)
2. ❌ Başarısız testler (kırmızı)
3. 🐛 Bulunan hatalar
4. 📸 Dashboard ekran görüntüsü
5. 🎮 Son durum: Level X, Y puan, Z rozet

**Hadi test et ve sonuçları bana bildir!** 🚀
