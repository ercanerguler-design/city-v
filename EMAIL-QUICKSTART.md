# 🚀 BETA EMAIL BİLDİRİMLERİ - HIZLI BAŞLANGIÇ

## ✅ Şu Anda Çalışıyor!

Beta formu şu anda **DEV MODE**'da çalışıyor:
- ✅ Form doldurup gönderebilirsin
- ✅ Email içeriği **console**'da görünür
- ⚠️ Gerçek email **GÖNDERİLMEZ** (API key yok)

---

## 🎯 Test Et (Hemen Şimdi)

### 1. Beta Formunu Aç
```
http://localhost:3001/business-box/beta
```

### 2. Formu Doldur
```
İşletme: Test Cafe
Email: test@example.com
Telefon: +90 555 123 4567
... diğer bilgiler
```

### 3. Gönder

### 4. Console'u Kontrol Et
Terminal'de göreceksin:
```
====================================
📧 EMAIL (DEV MODE - Console)
====================================
To: test@example.com
Subject: ✅ Beta Başvurunuz Alındı - BETA-12345678
====================================
```

**İki email görünecek:**
1. Admin'e (sana)
2. Kullanıcıya (başvuru sahibine)

---

## 📧 Gerçek Email Göndermek İçin

### SEÇENEK 1: Resend (Önerilen - 5 dakika)

```bash
# 1. https://resend.com aç, Sign Up
# 2. API Key al (Dashboard → API Keys)
# 3. .env.local dosyası oluştur:

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=ercan@cityv.com

# 4. Server'ı yeniden başlat
npm run dev

# 5. Form gönder → Gerçek email gider! ✅
```

**Ücretsiz**: 3,000 email/ay (100 başvuru/gün)

### SEÇENEK 2: Şimdilik DEV Mode Kullan

Console'da görünen email içeriğini kopyala → Manuel gönder 😊

---

## 📋 Dosyalar

```
✅ app/api/beta/apply/route.ts       ← API endpoint (hazır)
✅ app/business-box/beta/page.tsx    ← Form (hazır)
✅ EMAIL-SETUP.md                    ← Detaylı rehber
✅ .env.local.example                ← Template
❌ .env.local                        ← Sen oluşturacaksın (Resend için)
```

---

## 🎨 Email Önizleme

### Admin'e Giden Email:
```
🎉 Yeni Beta Başvurusu: [İşletme]

📋 Başvuru No: BETA-12345678
🏢 İşletme: Test Cafe
📧 Email: test@example.com
📞 Telefon: +90 555 123 4567
📍 Lokasyon: Ankara, Çankaya

💰 Beta Avantajları: ₺4,484
[Müşteri ile İletişime Geç] ← Button
```

### Kullanıcıya Giden Email:
```
🎉 Tebrikler! Başvurunuz Alındı

Merhaba Ahmet Bey,

Test Cafe için Beta Programı başvurunuz alındı!

📋 Başvuru Numaranız: BETA-12345678

⏭️ Sonraki Adımlar:
1. 48 saat içinde ekibimiz sizinle iletişime geçecek
2. 15 dakikalık online demo görüşmesi
3. Onay sonrası Business Box ücretsiz kargo
4. 3 ay ücretsiz premium hizmet

🎁 Beta Avantajlarınız (₺4,484 değer):
✅ City-V Business Box (₺2,990)
✅ 3 Ay Ücretsiz Premium (₺597)
✅ 9 Ay %50 İndirim (₺897 tasarruf)

En iyi dileklerimizle,
City-V Ekibi
```

---

## 🔧 Sorun Giderme

### "Başvuru gönderilirken hata oluştu"

**Çözüm**: F12 → Console → Hata mesajını kontrol et

### Email gitmiyor

**Çözüm 1**: DEV MODE kullanıyorsun (normal, console'da görünür)  
**Çözüm 2**: API key ekle (yukarıda SEÇENEK 1)

### API key hata veriyor

**Çözüm**:
```bash
# 1. Resend'de yeni key oluştur
# 2. .env.local dosyasını güncelle
# 3. Server yeniden başlat: npm run dev
```

---

## 📚 Daha Fazla Bilgi

Detaylı kurulum için: **EMAIL-SETUP.md**

---

**Hazır! Beta başvuruları alınmaya başlandı! 🎉**
