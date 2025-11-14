# ⚡ GOOGLE OAUTH SÜPER HIZLI ÇÖZÜM

## 🎯 SADECE 2 ADIM!

---

## ✅ ADIM 1: Credentials (OAuth Client ID)

### 🔗 https://console.cloud.google.com/apis/credentials

1. **OAuth 2.0 Client IDs** bölümünde şunu bul:
   ```
   693372259383-c2ge11rus1taeh0dae9sur7kdo6ndiuo
   ```

2. **EDIT (Kalem ✏️ ikonu)** tıkla

3. **Authorized JavaScript origins** kısmına:
   - `http://localhost:3000` ekle
   - `https://cityv.vercel.app` ekle

4. **Authorized redirect URIs** kısmına:
   - `http://localhost:3000` ekle
   - `https://cityv.vercel.app` ekle

5. **💾 SAVE**

---

## ✅ ADIM 2: OAuth consent screen (Test Users)

### Sol menüden "OAuth consent screen" seç

#### Şu 2 şeyi kontrol et:

**A) Publishing status:**
- **Testing** olmalı ✅
- Eğer **In production** yazıyorsa, **BACK TO TESTING** butonuna bas

**B) Test users:**
- **+ ADD USERS** butonuna tıkla
- Email ekle: `ercanerguler@gmail.com`
- **SAVE**

---

## 🎊 BİTTİ! TEST ET:

```bash
# Browser'ı kapat ve yeniden aç
# http://localhost:3000 aç
# Giriş Yap → Google ile Giriş Yap
```

---

## ❓ AUTHORIZED DOMAINS NEREDE? (Opsiyonel)

Eğer yine de bulmak istersen:

1. **OAuth consent screen** (sol menü)
2. **EDIT APP** butonu
3. **Aşağı scroll yap** (çok aşağı!)
4. **"App domain"** başlığı altında
5. **"Authorized domains"** yazısını ara

ANCAK **BU ZORUNLU DEĞİL!** Test için yeterli:
- ✅ JavaScript origins (yaptın)
- ✅ Redirect URIs (yaptın)
- ✅ Test users (şimdi yapacaksın)

---

## 📋 KONTROL:

- [ ] Credentials → JavaScript origins: localhost:3000, cityv.vercel.app ✅
- [ ] Credentials → Redirect URIs: localhost:3000, cityv.vercel.app ✅
- [ ] OAuth consent screen → Publishing status: Testing ✅
- [ ] OAuth consent screen → Test users: ercanerguler@gmail.com ✅
- [ ] Browser kapatıldı ve yeniden açıldı ✅
- [ ] Test yapıldı ✅

---

**BAŞARI! 🚀**
