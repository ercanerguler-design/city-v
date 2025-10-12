# 🌐 Sosyal Özellikler (Paket 3) - Test Rehberi

## 🎉 YENİ ÖZELLİKLER

### ✅ Eklenen Özellikler:
1. 💬 **Yorum Sistemi** - Lokasyonlara yorum yapma ve değerlendirme
2. ⭐ **5 Yıldız Rating** - Mekanları 1-5 yıldız ile değerlendirme
3. 📸 **Fotoğraf Paylaşımı** - Mekan fotoğrafları yükleme
4. 👍 **Beğeni Sistemi** - Yorumları ve fotoğrafları beğenme
5. 🏆 **Sosyal Rozetler** - Aktif kullanıcılara özel rozetler
6. 📊 **Katkı İstatistikleri** - Her kullanıcının sosyal aktiviteleri

---

## 🚀 BAŞLAMADAN ÖNCE

Server: **http://localhost:3000** adresinde çalışıyor.
Tarayıcıda **CTRL+SHIFT+R** ile hard refresh yapın.

**Önemli:** Sosyal özellikler için **giriş yapmanız** gerekiyor!

---

## ✅ TEST ADIMLARI

### 1️⃣ YENİ BUTON TESTİ

**Adımlar:**
1. Haritada bir mekan kartı gör
2. Kartın altındaki 3 buton olduğunu kontrol et:
   - **Git** (yeşil) - Rota oluştur
   - **Bildir** (mor) - Durum bildir
   - **Sosyal** (pembe) - YENİ! 💬

**Beklenen:**
- [ ] "Sosyal" butonu pembe-kırmızı gradient
- [ ] MessageCircle ikonu görünüyor
- [ ] Butona hover yapınca büyüyor

### 2️⃣ SOSYAL MODAL AÇMA

**Adımlar:**
1. Bir mekan kartında "Sosyal" butonuna tıkla
2. Modal pencere açılsın

**Beklenen:**
- [ ] Modal açılıyor
- [ ] Üstte mekan adı görünüyor
- [ ] 2 tab var: "💬 Yorumlar" ve "📸 Fotoğraflar"
- [ ] X butonu ile kapatılabiliyor

### 3️⃣ YORUM YAPMA TESTİ

**Adımlar:**
1. "Yorumlar" tabında ol
2. Yorum yazma formu gör
3. 5 yıldızdan bir değerlendirme seç (tıkla)
4. Yorum yaz: "Harika bir mekan! Çok beğendim."
5. "Yorum Gönder" butonuna tıkla

**Beklenen:**
- [ ] Yıldızlara tıklayınca renk değişiyor (sarı)
- [ ] Yorum alanı çalışıyor
- [ ] Toast bildirimi: "💬 Yorumunuz başarıyla eklendi!"
- [ ] Yorum listede görünüyor
- [ ] Kullanıcı adı ve profil resmi görünüyor
- [ ] "Az önce" yazısı görünüyor
- [ ] 5 yıldız rating görünüyor

### 4️⃣ YORUM BEĞENİ TESTİ

**Adımlar:**
1. Bir yorumun altındaki 👍 (ThumbsUp) butonuna tıkla
2. Beğeni sayısı artmalı
3. Tekrar tıkla (beğeniyi geri al)

**Beklenen:**
- [ ] İlk tıklamada beğeni sayısı 1 oldu
- [ ] Buton rengi maviye döndü
- [ ] İkinci tıklamada beğeni 0'a düştü
- [ ] Buton rengi griye döndü

### 5️⃣ YORUM SİLME TESTİ

**Adımlar:**
1. Kendi yorumunun altındaki "🗑️ Sil" butonunu gör
2. Butona tıkla
3. Yorum silinsin

**Beklenen:**
- [ ] Sadece kendi yorumlarında "Sil" butonu görünüyor
- [ ] Diğer kullanıcıların yorumlarında "Sil" butonu YOK
- [ ] Silme işlemi çalışıyor
- [ ] Toast: "Yorum silindi"

### 6️⃣ FOTOĞRAF YÜKLEME TESTİ

**Adımlar:**
1. "📸 Fotoğraflar" tabına geç
2. "Fotoğraf Yükle" butonuna tıkla
3. Bilgisayardan bir fotoğraf seç
4. Fotoğraf yüklensin

**Beklenen:**
- [ ] Fotoğraf yükleme butonu görünüyor
- [ ] Dosya seçici açılıyor
- [ ] Toast: "📸 Fotoğraf başarıyla eklendi!"
- [ ] Fotoğraf grid'de görünüyor
- [ ] Grid yapısı: 2 sütun (mobil), 3 sütun (desktop)

### 7️⃣ FOTOĞRAF BEĞENİ TESTİ

**Adımlar:**
1. Bir fotoğrafın üzerine hover yap
2. Overlay görünmeli (siyah transparan)
3. Alt kısımda kullanıcı adı ve 👍 butonu gör
4. Beğen butonuna tıkla

**Beklenen:**
- [ ] Hover yapınca overlay görünüyor
- [ ] Kullanıcı adı ve tarih görünüyor
- [ ] Beğeni butonu çalışıyor
- [ ] Beğeni sayısı artıyor

### 8️⃣ FOTOĞRAF SİLME TESTİ

**Adımlar:**
1. Kendi fotoğrafına hover yap
2. 🗑️ (Trash) ikonunu gör
3. Tıkla ve sil

**Beklenen:**
- [ ] Sadece kendi fotoğraflarında silme butonu var
- [ ] Silme işlemi çalışıyor
- [ ] Toast: "Fotoğraf silindi"

### 9️⃣ RATİNG GÖSTERİMİ (LOCATION CARD)

**Adımlar:**
1. Bir mekana yorum yap (örnek: 5 yıldız)
2. Modalı kapat
3. Mekan kartına bak

**Beklenen:**
- [ ] Kartın üstünde yeni bir bölüm var
- [ ] ⭐ 5.0 (1) şeklinde rating görünüyor
- [ ] Yorum sayısı görünüyor: 💬 1
- [ ] Fotoğraf varsa: 📸 1

### 🔟 SOSYAL İSTATİSTİKLER

**Adımlar:**
1. Farklı mekanlara toplam 5 yorum yap
2. Farklı mekanlara toplam 3 fotoğraf yükle
3. Diğer kullanıcıların yorumlarını beğen (50+ beğeni al)

**Beklenen:**
- [ ] Her yorum için console'da log görünüyor
- [ ] Her fotoğraf için console'da log görünüyor
- [ ] LocalStorage'da veriler kaydediliyor

---

## 🏆 SOSYAL ROZETLER

### Rozet 1: İlk Yorumcu (💬 Common)
**Koşul:** 1 yorum yap
**Ödül:** İlk yorumcu rozeti + Toast bildirimi

### Rozet 2: Aktif Yorumcu (💬 Rare)
**Koşul:** 10 yorum yap
**Ödül:** Aktif yorumcu rozeti + Toast bildirimi

### Rozet 3: Fotoğrafçı (📸 Epic)
**Koşul:** 5 fotoğraf yükle
**Ödül:** Fotoğrafçı rozeti + Toast bildirimi

### Rozet 4: Topluluk Lideri (👑 Legendary)
**Koşul:** 50 beğeni al
**Ödül:** Topluluk lideri rozeti + Toast bildirimi

**Test Et:**
- [ ] 1 yorum yap → "İlk Yorumcu" rozeti aç
- [ ] 10 yorum yap → "Aktif Yorumcu" rozeti aç
- [ ] 5 fotoğraf yükle → "Fotoğrafçı" rozeti aç
- [ ] 50 beğeni al → "Topluluk Lideri" rozeti aç

---

## 🎯 HIZLI TEST SENARYOSU (3 dakika)

1. **30 saniye:** Bir mekana git → "Sosyal" butonuna tıkla
2. **1 dakika:** 5 yıldız seç → Yorum yaz → Gönder → "İlk Yorumcu" rozetini aç
3. **30 saniye:** Fotoğraf yükle butonuna tıkla → Fotoğraf seç → Yükle
4. **30 saniye:** Kendi yorumunu beğen → Beğeni sayısını gör
5. **30 saniye:** Modalı kapat → Mekan kartında rating ve yorum sayısını gör

**Beklenen Sonuç:**
- ✅ 1 yorum eklendi
- ✅ 1 fotoğraf yüklendi
- ✅ "İlk Yorumcu" rozeti kazanıldı
- ✅ Mekan kartında ⭐ 5.0 (1) 💬 1 📸 1 görünüyor

---

## 📊 LOCATION RATING SİSTEMİ

### Ortalama Rating Hesaplama:
- 1 kullanıcı 5 yıldız → Ortalama: 5.0
- 2 kullanıcı: biri 5, biri 3 → Ortalama: 4.0
- 3 kullanıcı: 5, 4, 3 → Ortalama: 4.0

**Test:**
1. Mekan A'ya 5 yıldız ver → Rating: 5.0
2. Başka bir hesapla Mekan A'ya 3 yıldız ver → Rating: 4.0
3. Mekan kartında ⭐ 4.0 (2) görünmeli

---

## 🐛 HATA AYIKLAMA

### Console'da Görmek İstediğin Loglar:

```
💬 Yorumunuz başarıyla eklendi!
📸 Fotoğraf başarıyla eklendi!
🏆 Yeni Rozet: İlk Yorumcu!
🎮 Sosyal aktivite: +5 puan (opsiyonel)
```

### LocalStorage Kontrolü:

F12 → Application → Local Storage → http://localhost:3000

Ara: `social-storage`

JSON içinde:
```json
{
  "state": {
    "comments": [
      {
        "id": "comment-xxx",
        "locationId": "loc-1000",
        "userId": "user-123",
        "userName": "Ercan",
        "content": "Harika mekan!",
        "rating": 5,
        "likes": 2,
        "likedBy": ["user-456"],
        "createdAt": 1728740000000
      }
    ],
    "photos": [...],
    "ratings": {
      "loc-1000": {
        "locationId": "loc-1000",
        "totalRatings": 3,
        "averageRating": 4.33,
        "ratings": { "1": 0, "2": 0, "3": 1, "4": 1, "5": 1 }
      }
    },
    "contributions": {
      "user-123": {
        "userId": "user-123",
        "commentsCount": 10,
        "photosCount": 5,
        "totalLikesReceived": 50,
        "badges": ["first-comment", "active-commenter", "photographer"]
      }
    }
  }
}
```

---

## 🎨 UI/UX ÖZELLİKLERİ

### Sosyal Modal:
- ✨ Gradient header (indigo → purple → pink)
- 🎯 2 tab sistemi (yorumlar ve fotoğraflar)
- 📱 Responsive tasarım
- 🌙 Dark mode desteği
- ✨ Framer Motion animasyonlar
- 📏 Max yükseklik: 90vh (scroll edilebilir)

### Yorum Kartları:
- 👤 Kullanıcı avatarı veya initial badge
- ⭐ 5 yıldız rating gösterimi
- 📅 Zaman damgası (dinamik: "2 saat önce")
- 👍 Beğeni butonu (hover efekti)
- 🗑️ Silme butonu (sadece kendi yorumlarında)

### Fotoğraf Grid:
- 📐 Aspect ratio: square (1:1)
- 🖼️ Grid: 2 sütun (mobil), 3 sütun (desktop)
- 🎭 Hover overlay (siyah/50%)
- ℹ️ Kullanıcı bilgisi alt kısımda
- 👍 Beğeni butonu overlay içinde

### Location Card İyileştirmeleri:
- 📊 Sosyal stats bölümü eklendi
- ⭐ Rating, yorum ve fotoğraf sayısı
- 🎨 3 buton sistemi (Git, Bildir, Sosyal)
- 📏 Buttonlar daha kompakt (text-xs)

---

## ✨ BONUS ÖZELLİKLER

### Tarih Formatı:
- Az önce (< 1 dakika)
- 5 dakika önce
- 2 saat önce
- 3 gün önce
- Tarih (> 7 gün): "12 Ekim 2025"

### Yıldız Rating:
- Hover efekti (yıldızların üzerine gel)
- Tıklanan yıldız sarı oluyor
- Boş yıldızlar gri

### Beğeni Sistemi:
- İlk tıklama: Beğen → Renk maviye döner
- İkinci tıklama: Beğeniyi geri al → Renk griye döner
- Beğeni sayısı gerçek zamanlı güncellenir

---

## 🎊 BAŞARI KRİTERLERİ

Sistem başarılı sayılır eğer:

✅ **Yorum sistemi çalışıyor**
✅ **Fotoğraf yükleme çalışıyor**
✅ **Rating sistemi doğru hesaplanıyor**
✅ **Beğeni sistemi çalışıyor**
✅ **Sosyal rozetler açılıyor**
✅ **LocalStorage veriler korunuyor**
✅ **UI responsive ve dark mode uyumlu**
✅ **Toast bildirimleri görünüyor**

---

## 📝 TEST SONUÇLARINI RAPORLA

Test tamamlandığında şunları paylaş:

1. ✅ Başarılı testler (yeşil)
2. ❌ Başarısız testler (kırmızı)
3. 🐛 Bulunan hatalar
4. 📸 Sosyal modal ekran görüntüsü
5. 🎮 Kaç yorum yaptın, kaç fotoğraf yükledin
6. 🏆 Hangi sosyal rozetleri kazandın

---

## 🚀 SONRAKİ PAKETLER

Paket 3 tamamlandıktan sonra:

- **Paket 4**: 🤖 Akıllı Öneriler (AI-powered recommendations)
- **Paket 5**: 💼 Premium Özellikler (ad-free, advanced stats)
- **Paket 6**: 📱 PWA (offline mode, push notifications)
- **Paket 7**: 🗺️ Harita İyileştirmeleri (heatmap, clustering)
- **Paket 8**: 🎨 UI/UX Enhancements (parallax, glassmorphism)

**Hadi test et ve sosyal ol!** 🎉
