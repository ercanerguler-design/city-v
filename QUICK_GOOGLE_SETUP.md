# ⚡ GOOGLE OAUTH HIZLI KURULUM

## 🎯 3 ADIMDA KURULUM!

### 1️⃣ Google Cloud Console'a Git
**🔗 https://console.cloud.google.com/apis/credentials**

---

### 2️⃣ OAuth Consent Screen (Sol Menü)

**EDIT APP** butonuna bas:

#### Test Users Ekle:
- **+ ADD USERS** butonuna tıkla
- Email ekle: `ercanerguler@gmail.com`
- **SAVE**

#### Authorized Domains Ekle:
- **EDIT APP** > **App domain** bölümünde
- **Authorized domains** kısmına:
  ```
  localhost
  vercel.app
  ```
- **SAVE AND CONTINUE** (3 kez bas - tüm adımları geç)

---

### 3️⃣ Credentials → OAuth 2.0 Client ID

**Şu Client ID'yi bul ve EDIT (Kalem) tıkla:**
```
693372259383-c2ge11rus1taeh0dae9sur7kdo6ndiuo
```

#### Authorized JavaScript origins:
```
http://localhost:3000
https://cityv.vercel.app
```

#### Authorized redirect URIs:
```
http://localhost:3000
https://cityv.vercel.app
```

**💾 SAVE butonuna BAS!**

---

## ✅ TAMAMLANDI!

Şimdi test et:
```bash
npm run dev
```

🌐 **http://localhost:3000** aç → **Giriş Yap** → **Google ile Giriş Yap**

---

## 📊 KONTROL LİSTESİ:

- [ ] OAuth consent screen → Test users → ercanerguler@gmail.com eklendi ✅
- [ ] OAuth consent screen → Authorized domains → localhost, vercel.app eklendi ✅
- [ ] Credentials → 693372259383... → JavaScript origins eklendi ✅
- [ ] Credentials → 693372259383... → Redirect URIs eklendi ✅
- [ ] SAVE butonuna basıldı ✅
- [ ] Dev server yeniden başlatıldı ✅

---

## 🎊 BAŞARILI GİRİŞ BELİRTİLERİ:

Console'da görecekleriniz:
```
✅ Google kullanıcı bilgileri alındı: ercanerguler@gmail.com
✅ Kullanıcı Postgres'e kaydedildi
```

---

## ❌ HALA HATA ALIYORSAN:

1. **Browser'ı tamamen kapat ve yeniden aç**
2. **Incognito/Private mode'da dene**
3. **Browser cache'i temizle** (Ctrl+Shift+Delete)
4. **Popup blocker'ı kapat**

---

**💡 İpucu:** Google Cloud Console'da yaptığın değişikliklerin aktif olması 5-10 dakika sürebilir!
