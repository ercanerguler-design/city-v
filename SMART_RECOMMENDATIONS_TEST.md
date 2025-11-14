# 🤖 Akıllı Öneriler (Paket 4) - Test Rehberi

## 🎯 YENİ ÖZELLİKLER

### ✅ Eklenen Özellikler:
1. 🤖 **Yapay Zeka Destekli Öneriler** - Kullanıcı davranışlarına göre akıllı öneriler
2. 📊 **Akıllı Puanlama Sistemi** - 100 üzerinden uygunluk puanı
3. ⏰ **Zaman Bazlı Tahminler** - Gelecek saatler için yoğunluk tahmini
4. 🎯 **Kişiselleştirilmiş Filtreler** - Favori kategoriler ve tercihler
5. 📍 **Mesafe Bazlı Öneriler** - Yakındaki mekanları önceliklendirme
6. 🌡️ **Hava Durumu Entegrasyonu** - Havaya göre uygunluk
7. ⭐ **Rating Entegrasyonu** - Yüksek puanlı mekanları öne çıkarma

---

## 🚀 BAŞLAMADAN ÖNCE

Server: **http://localhost:3000** adresinde çalışıyor.
Tarayıcıda **CTRL+SHIFT+R** ile hard refresh yapın.

**Önemli:** Akıllı öneriler için **birkaç mekan ziyaret etmelisiniz**!

---

## ✅ TEST ADIMLARI

### 1️⃣ YENİ HEADER BUTONU TESTİ

**Adımlar:**
1. Header'a bak
2. "🤖 Akıllı Öneriler" butonunu gör (mor-pembe gradient)

**Beklenen:**
- [ ] Brain (🧠) ikonu görünüyor
- [ ] "Akıllı Öneriler" yazısı var
- [ ] Mor-pembe gradient rengi
- [ ] Hover yapınca büyüyor

### 2️⃣ İLK AÇILIŞ (BOŞ DURUM)

**Adımlar:**
1. "Akıllı Öneriler" butonuna tıkla
2. Modal açılsın

**Beklenen:**
- [ ] Modal açılıyor
- [ ] "🤖 Akıllı Öneriler" başlığı
- [ ] "Size özel kişiselleştirilmiş mekan önerileri" açıklaması
- [ ] Yapay zeka animasyonu (dönen beyin ikonu)
- [ ] "Yapay zeka tercihlerinizi analiz ediyor..." mesajı
- [ ] 0.5 saniye sonra sonuç gösterilmeli

### 3️⃣ TERCİH GEÇMİŞİ OLUŞTURMA

**Adımlar:**
1. Modalı kapat
2. Haritada **5 farklı kategori** mekan ziyaret et:
   - 2x Cafe (Starbucks, Kahve Dünyası)
   - 1x Market (Migros)
   - 1x Park
   - 1x Banka
3. Her birinde "Buraya Git" butonuna tıkla

**Beklenen:**
- [ ] Her tıklamada Console'da log görünüyor
- [ ] Ziyaret geçmişi LocalStorage'da kaydediliyor
- [ ] Favori kategoriler otomatik güncelleniyor

### 4️⃣ AKILLI ÖNERİLER GÖRÜNTÜLEME

**Adımlar:**
1. "Akıllı Öneriler" butonuna tekrar tıkla
2. Şimdi öneriler gösterilmeli

**Beklenen:**
- [ ] "X Akıllı Öneri Bulundu" banner'ı görünüyor
- [ ] Mor kutu: "Ziyaret geçmişiniz, tercihleriniz ve mevcut konumunuza göre özel seçildi"
- [ ] Grid yapısı: 2 sütun
- [ ] Her öneri kartı görünüyor
- [ ] Kartlar yüksekten düşüğe puanlanmış

### 5️⃣ ÖNERİ KARTI İNCELEMESİ

**Her kartda olması gerekenler:**

**Üst Kısım:**
- [ ] Renkli gradient çizgi (score'a göre)
- [ ] Mekan ikonu ve adı
- [ ] Kategori adı
- [ ] **Puan (0-100)** - Sağ üstte büyük
- [ ] Puan metni: "Mükemmel Eşleşme" / "Harika Seçim" / "İyi Seçim"

**Durum Bilgileri:**
- [ ] **Şu an:** Yoğunluk seviyesi (renkli badge)
- [ ] **1 saat sonra:** Tahmin edilen yoğunluk (renkli badge)

**Nedenler (En fazla 3 tane):**
- [ ] ⚡ Sarı şimşek ikonu
- [ ] Neden metinleri:
  - "✨ Favori kategoriniz: cafe"
  - "🎯 Tercih ettiğiniz yoğunluk seviyesi"
  - "📊 Bu tür mekanları sık ziyaret ediyorsunuz"
  - "📍 Çok yakınınızda (250m)"
  - "⏰ Tercih ettiğiniz saat dilimi"
  - "🌤️ Hava durumu uygun"
  - "⭐ Yüksek puanlı (4.5)"

**En İyi Zaman:**
- [ ] Mavi kutu
- [ ] ⏰ Saat ikonu
- [ ] "En İyi Zaman: Sabah 08:00-10:00" gibi öneri

**Aksiyon Butonu:**
- [ ] Mor-pembe gradient "Bu Mekana Git" butonu
- [ ] 🎯 Target ikonu

### 6️⃣ PUANLAMA SİSTEMİ TESTİ

**Puanlama Kriterleri:**

| Kriter | Puan | Nasıl Test Edilir |
|--------|------|-------------------|
| Favori Kategori | +25 | Cafe'leri çok ziyaret et → Cafe önerileri +25 |
| Yoğunluk Tercihi | +20 | Preferences: preferredCrowdLevel = 'empty' |
| Ziyaret Geçmişi | +15 | Aynı kategoriden 5+ ziyaret yap |
| Mesafe (< 0.5km) | +20 | Konum paylaş, yakındaki mekanlar +20 |
| Mesafe (0.5-1km) | +15 | Yürüme mesafesindeki mekanlar +15 |
| Saat Tercihi | +10 | Preferences: preferredTimes = [currentHour] |
| Hava Uygunluğu | +10 | Parklar için hava durumu uygunsa +10 |
| Yüksek Rating | +10 | 4+ yıldızlı mekanlar +10 |

**Test:**
1. Cafe'leri 3 kez ziyaret et
2. "Akıllı Öneriler"i aç
3. Cafe önerilerinin puanı **85+** olmalı
4. En üstte "Mükemmel Eşleşme" yazmalı
5. Yeşil gradient çizgi görünmeli

### 7️⃣ YOĞUNLUK TAHMİNİ TESTİ

**Tahmin Algoritması:**

**Peak Hours (Yoğun Saatler):**
- 08:00-10:00 (Sabah)
- 12:00-14:00 (Öğle)
- 17:00-19:00 (Akşam)

**Tahmin Mantığı:**
- Peak saatlerde: Yoğunluk artabilir
- Peak olmayan saatlerde: Yoğunluk azalabilir
- Gece (22:00-06:00): Her zaman "Boş"

**Test:**
1. Saat 17:00 civarı bir mekan seç (peak hour)
2. "Şu an: Az Kalabalık" gösteriyor
3. "1 saat sonra: Orta" göstermeli (çünkü 18:00 peak hour)

**Confidence (Güven) Seviyeleri:**
- Peak hours: 65% güven
- Normal saatler: 60% güven
- Gece saatleri: 80% güven (çünkü kesin boş)

### 8️⃣ AKILLI BİLDİRİMLER (shouldNotify)

**Bildirim Koşulları:**
1. Mekan favori kategorilerde
2. Mekan boş veya az kalabalık

**Test:**
1. Cafe'leri favorilerine ekle (ziyaret et)
2. Console'da kontrol et:
```javascript
shouldNotify(location) // true dönmeli
```

**Kullanım Örneği:**
- Gelecekte: "Starbucks şu an boş! 🎉" bildirimi

### 9️⃣ LOCALstorage VERİ YAPISI

**F12 → Application → Local Storage → social-storage**

```json
{
  "state": {
    "preferences": {
      "favoriteCategories": ["cafe", "market", "park"],
      "visitHistory": [
        {
          "locationId": "loc-1000",
          "category": "cafe",
          "visitTime": 1728740000000,
          "crowdLevel": "low"
        }
      ],
      "preferredTimes": [],
      "preferredCrowdLevel": "any"
    },
    "recommendations": [...],
    "predictions": [
      {
        "locationId": "loc-1000",
        "predictions": [
          {
            "hour": 18,
            "predictedLevel": "moderate",
            "confidence": 0.65
          }
        ]
      }
    ]
  }
}
```

**Kontrol Et:**
- [ ] `preferences.favoriteCategories` doldu mu?
- [ ] `preferences.visitHistory` son 100 ziyaret var mı?
- [ ] `predictions` array'i dolu mu?

### 🔟 SCORE RENK SİSTEMİ

| Score | Renk | Gradient | Metin |
|-------|------|----------|-------|
| 85-100 | Yeşil | `from-green-500 to-emerald-600` | Mükemmel Eşleşme |
| 70-84 | Mavi | `from-blue-500 to-cyan-600` | Harika Seçim |
| 60-69 | Sarı-Turuncu | `from-yellow-500 to-orange-600` | İyi Seçim |
| 0-59 | Gri | `from-gray-400 to-gray-600` | Uygun |

**Sadece 60+ puan alanlar gösteriliyor!**

---

## 🎯 HIZLI TEST SENARYOSU (5 dakika)

1. **1 dakika:** 5 farklı mekan ziyaret et (3x Cafe, 1x Market, 1x Park)
2. **30 saniye:** "Akıllı Öneriler" butonuna tıkla
3. **1 dakika:** Önerileri incele, puanları kontrol et
4. **30 saniye:** En yüksek puanlı öneri kartını incele
5. **30 saniye:** "Bu Mekana Git" butonuna tıkla
6. **30 saniye:** Rota modalı açılsın, rota hesaplansın
7. **1 dakika:** LocalStorage'da verileri kontrol et

**Beklenen Sonuç:**
- ✅ 5-10 öneri gösterildi
- ✅ Cafe önerileri en yüksek puanlı (85+)
- ✅ Her kartda 3 neden var
- ✅ Yoğunluk tahmini çalışıyor
- ✅ "Bu Mekana Git" butonu çalışıyor

---

## 📊 AKILLI PUANLAMA ÖRNEKLERİ

### Örnek 1: Mükemmel Eşleşme (Score: 95)

**Mekan:** Starbucks Çankaya
**Nedenler:**
1. ✨ Favori kategoriniz: cafe (+25)
2. 🎯 Tercih ettiğiniz yoğunluk seviyesi (+20)
3. 📊 Bu tür mekanları sık ziyaret ediyorsunuz (+15)
4. 📍 Çok yakınınızda (300m) (+20)
5. ⏰ Tercih ettiğiniz saat dilimi (+10)
6. ⭐ Yüksek puanlı (4.8) (+10)

**Toplam:** 50 (base) + 100 (bonuslar) = **95 puan** ✅

### Örnek 2: Harika Seçim (Score: 75)

**Mekan:** Migros Market
**Nedenler:**
1. ✨ Favori kategoriniz: market (+25)
2. 📍 Yakınınızda (1.5km) (+10)
3. 🌤️ Hava durumu uygun (+10)

**Toplam:** 50 (base) + 45 (bonuslar) = **75 puan** ✅

### Örnek 3: İyi Seçim (Score: 65)

**Mekan:** Çankaya Park
**Nedenler:**
1. 📍 Yürüme mesafesinde (0.8km) (+15)

**Toplam:** 50 (base) + 15 (bonuslar) = **65 puan** ✅

---

## 🐛 HATA AYIKLAMA

### Console'da Görmek İstediğin Loglar:

```
✨ Ziyaret geçmişine eklendi: loc-1000 (cafe, low)
🎯 Favori kategoriler güncellendi: ['cafe', 'market', 'park']
🤖 10 akıllı öneri oluşturuldu
📊 Yoğunluk tahmini: loc-1000 → 6 saat için
```

### LocalStorage Kontrolü:

**Key:** `recommendation-storage`

**Önemli Alanlar:**
- `preferences.favoriteCategories` - Top 3 kategori
- `preferences.visitHistory` - Son 100 ziyaret
- `predictions` - Yoğunluk tahminleri

---

## 🎨 UI/UX ÖZELLİKLERİ

### Header Butonu:
- 🎨 Mor-pembe gradient
- 🧠 Brain ikonu
- ✨ Hover efekti (scale 1.05)
- 📱 Responsive (mobilde gizli)

### Modal:
- 🎨 Mor-pembe-kırmızı gradient header
- 📏 Max yükseklik: 90vh
- 📱 Responsive grid (1/2 sütun)
- 🌙 Dark mode desteği
- ✨ Framer Motion animasyonlar

### Öneri Kartları:
- 🎨 Renkli gradient çizgi (üstte)
- 📊 Büyük puan gösterimi
- 🏷️ Renkli yoğunluk badge'leri
- ⚡ Neden listesi (şimşek ikonları)
- ⏰ En iyi zaman önerisi (mavi kutu)
- 🎯 Aksiyon butonu (mor-pembe gradient)

### Animasyonlar:
- Yükleme: Dönen beyin ikonu
- Kartlar: Staggered entrance (0.05s gecikme)
- Hover: Scale efektleri

---

## ✨ BONUS ÖZELLİKLER

### Otomatik Favori Kategori Güncelleme:
- En çok ziyaret edilen 3 kategori otomatik favorilere eklenir
- Her ziyarette yeniden hesaplanır

### Akıllı Mesafe Hesaplama:
- Haversine formülü kullanılır
- Dünya'nın yarıçapı: 6371 km
- Hassas mesafe hesaplaması

### Hava Durumu Uygunluğu:
- Parklar için hava durumu önemli
- 15-28°C arası ideal
- Yağmurda park önerilmez (suitability=1)
- Kapalı mekanlar için hava az önemli

### En İyi Ziyaret Zamanı:
- Kategori bazlı öneriler
- Cafe: Sabah 08:00-10:00 veya Öğleden sonra 15:00-17:00
- Banka: Sabah 10:00-11:00 veya Öğleden sonra 14:00-15:00
- Market: Sabah 10:00-11:00 veya Akşam 20:00-21:00
- Park: Akşam 17:00-19:00

---

## 🎊 BAŞARI KRİTERLERİ

Sistem başarılı sayılır eğer:

✅ **Ziyaret geçmişi kaydediliyor**
✅ **Favori kategoriler otomatik güncelleniyor**
✅ **Akıllı öneriler oluşturuluyor (60+ puan)**
✅ **Puanlama sistemi doğru çalışıyor**
✅ **Yoğunluk tahminleri yapılıyor**
✅ **Mesafe bazlı öncelik veriliyor**
✅ **UI responsive ve dark mode uyumlu**
✅ **LocalStorage veriler korunuyor**

---

## 📝 TEST SONUÇLARINI RAPORLA

Test tamamlandığında şunları paylaş:

1. ✅ Başarılı testler (yeşil)
2. ❌ Başarısız testler (kırmızı)
3. 🐛 Bulunan hatalar
4. 📸 Akıllı öneriler modal ekran görüntüsü
5. 🎮 Kaç mekan ziyaret ettin
6. 📊 En yüksek puan kaç oldu
7. 🤖 Hangi nedenler en sık çıktı

---

## 🚀 SONRAKİ PAKETLER

Paket 4 tamamlandıktan sonra:

- **Paket 5**: 💼 Premium Özellikler
- **Paket 6**: 📱 PWA (Progressive Web App)
- **Paket 7**: 🗺️ Harita İyileştirmeleri
- **Paket 8**: 🎨 UI/UX Enhancements

**Yapay zeka tercihlerini öğrensin!** 🤖🎯
