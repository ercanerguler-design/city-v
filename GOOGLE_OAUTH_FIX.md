# 🔧 GOOGLE OAUTH HATA ÇÖZÜMÜ

## Hata: "google.com ile devam edilemiyor"

Bu hata, Google Cloud Console'da **OAuth Consent Screen** ayarlarında domain'iniz onaylanmadığı için oluyor.

---

## ✅ ÇÖZÜM ADIMLARI:

### 1️⃣ Google Cloud Console'a Git
```
https://console.cloud.google.com
```

### 2️⃣ OAuth Consent Screen Ayarları

1. Sol menüden **APIs & Services** > **OAuth consent screen**
2. **User Type** seçimi:
   - **Internal**: Sadece Google Workspace kullanıcıları (ÖNERİLMEZ)
   - **External**: Herkes (✅ BU)
3. **EDIT APP** butonuna tıkla

### 3️⃣ Authorized Domains Ekle

**"Authorized domains" bölümünde:**
```
localhost
vercel.app
cityv.vercel.app
```

**Ekle butonuna bas!**

### 4️⃣ OAuth Client ID Ayarları

1. Sol menüden **Credentials**
2. OAuth 2.0 Client ID'ye tıkla
3. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://cityv.vercel.app
   https://*.vercel.app
   ```

4. **Authorized redirect URIs:**
   ```
   http://localhost:3000
   https://cityv.vercel.app
   https://*.vercel.app
   ```

5. **SAVE** butonuna bas!

---

## 🧪 TEST:

1. Tarayıcıyı tamamen kapat ve tekrar aç
2. http://localhost:3000
3. "Giriş Yap" > "Google ile Giriş Yap"
4. Google popup açılacak ✅
5. Hesabını seç
6. Giriş yapacak! 🎉

---

## ⚠️ EĞER HALA ÇALIŞMAZSA:

### Alternatif 1: Test Mode'a Al

**OAuth consent screen > Publishing status:**
- **Testing** modunda tut (ilk 100 kullanıcı için yeterli)
- **Test users** ekle (kendi email'ini)

### Alternatif 2: Yeni Client ID Oluştur

1. Eski Client ID'yi sil
2. Yeni oluştur
3. `.env.local` dosyasındaki `NEXT_PUBLIC_GOOGLE_CLIENT_ID`'yi güncelle
4. Vercel'e de ekle:
   ```bash
   vercel env rm NEXT_PUBLIC_GOOGLE_CLIENT_ID production
   vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID production
   ```

### Alternatif 3: OAuth Scope'ları Kontrol Et

**OAuth consent screen > Scopes:**
Sadece bunlar yeterli:
- `email`
- `profile`
- `openid`

Ekstra scope ekleme!

---

## 📋 SON KONTROL LİSTESİ:

- [ ] OAuth Consent Screen > User Type: **External** ✅
- [ ] Authorized domains: `localhost`, `vercel.app` ✅
- [ ] OAuth Client ID > JavaScript origins: `http://localhost:3000`, `https://cityv.vercel.app` ✅
- [ ] Publishing status: **Testing** (ilk 100 kullanıcı) ✅
- [ ] Test users: Kendi email'in ekli ✅

---

## 🎯 HIZLI ÇÖZÜM:

Eğer hiçbiri işe yaramazsa, **GEÇİCİ ÇÖZÜM**:

```typescript
// AuthModal.tsx'te Google butonunu geçici olarak kaldır
// Veya farklı bir OAuth provider kullan (GitHub, Discord)
```

**Ama tavsiyem:** Google Cloud Console ayarlarını düzelt, çalışır! 💪
