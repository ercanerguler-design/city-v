# 🔒 Vercel Security Warning Fix

## "Take action to secure your projects" Uyarısı

Bu uyarı genellikle şu sebeplerden biri için çıkar:

---

## ✅ Çözüm 1: Environment Variables Güvenliği

### 1️⃣ Vercel Dashboard'a Git
https://vercel.com/dashboard → city-v projesi

### 2️⃣ Settings → Environment Variables

Şu değişkenlerin **hepsinin** doğru şekilde ayarlandığını kontrol edin:

**✅ DATABASE_URL**
- Scope: Production, Preview, Development
- Type: Secret (sensitive olarak işaretle)
- Value: `postgres://...` (Neon DB connection string)

**✅ POSTGRES_URL** 
- Scope: Production, Preview, Development
- Type: Secret
- Value: Same as DATABASE_URL

**✅ JWT_SECRET**
- Scope: Production, Preview, Development  
- Type: Secret
- Value: `cityv-business-secret-key-2024`

**✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID**
- Scope: Production, Preview, Development
- Type: Plain Text (public olabilir)
- Value: `693372259383-c2ge11rus1taeh0dae9sur7kdo6ndiuo.apps.googleusercontent.com`

### 3️⃣ "Sensitive" İşaretle

Her secret değişken için:
1. Variable'a tıkla
2. "Sensitive" checkbox'ı işaretle
3. Save

---

## ✅ Çözüm 2: Deployment Protection

### Security Tab Kontrol:

**Vercel Dashboard → city-v → Settings → Security**

**Önerilen Ayarlar:**

1. **Deployment Protection**: ON
   - Production deployment'ları korur
   - Preview deployment'lara password ekler

2. **Authentication**: 
   - Vercel Authentication kullan (opsiyonel)
   - Kendi auth sisteminiz var, gerekli değil

3. **Trusted IPs** (Opsiyonel):
   - Belirli IP'lerden erişim kısıtla
   - Kurumsal kullanım için

---

## ✅ Çözüm 3: Domains & HTTPS

**Settings → Domains**

Kontrol:
- ✅ HTTPS enabled (otomatik olmalı)
- ✅ SSL certificate active
- ✅ Force HTTPS redirect ON

---

## ✅ Çözüm 4: Secure Headers

`next.config.ts` dosyasına güvenlik header'ları ekle:

```typescript
const nextConfig = {
  // ... mevcut ayarlar ...
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self), camera=(self), microphone=()'
          }
        ]
      }
    ];
  }
}
```

---

## 🔍 Uyarı Kaynağını Bulma

### 1. Vercel Dashboard → Notifications
- Sol üstteki notification icon'a tıkla
- "Security" kategorisindeki bildirimleri kontrol et

### 2. Specific Warning
Uyarı mesajında şunlardan biri yazıyor olabilir:

❌ **"Environment variables are not marked as sensitive"**
→ Çözüm: Variables'ı "Sensitive" olarak işaretle

❌ **"Deployment protection is not enabled"**  
→ Çözüm: Settings → Security → Enable Deployment Protection

❌ **"Some dependencies have security vulnerabilities"**
→ Çözüm: `npm audit fix` çalıştır

❌ **"No custom domain configured"**
→ Çözüm: Ignore (city-v.vercel.app yeterli) veya custom domain ekle

---

## 🚀 Hızlı Kontrol Listesi

```powershell
# 1. Dependencies güncel mi?
npm audit

# 2. Critical security issues var mı?
npm audit --audit-level=critical

# 3. Güncellemeler var mı?
npm outdated

# 4. Güvenlik yamaları
npm audit fix
```

---

## 📱 Vercel CLI ile Kontrol

```powershell
# Vercel CLI yükle
npm install -g vercel

# Login
vercel login

# Project bilgisi
vercel inspect

# Environment variables listele
vercel env ls

# Security scan
vercel security scan
```

---

## ✅ Güvenlik Best Practices (Zaten Uygulanmış)

✅ **Authentication**: Email/password + Google OAuth
✅ **Password Hashing**: bcrypt kullanılıyor
✅ **JWT Tokens**: Business login için JWT
✅ **Database**: Neon Postgres (SSL enabled)
✅ **API Routes**: Server-side validation
✅ **Environment Variables**: .env.local (not committed to git)

---

## 🎯 Sonraki Adımlar

1. **Vercel Dashboard'a git**
2. **Notifications** iconuna tıkla
3. Security uyarısının **detayını** oku
4. Yukarıdaki çözümlerden ilgili olanı uygula
5. "Dismiss" veya "Mark as resolved"

---

## 💡 Uyarıyı Yok Say

Eğer:
- Environment variables doğru set edilmiş ✅
- HTTPS aktif ✅
- Authentication çalışıyor ✅

O zaman bu uyarı:
- Vercel'in genel önerisi olabilir
- Güvenlik best practice hatırlatması
- Dismiss edebilirsiniz

**Önemli:** Giriş çalışıyorsa ve vercel deploy başarılıysa, bu uyarı kritik değildir.

---

**Ne Yapmalıyım?**

1. Vercel Dashboard → Notifications açın
2. Uyarının **tam metnini** okuyun
3. Eğer "Environment Variables" diyorsa → Variables'ı "Sensitive" işaretleyin
4. Eğer "Deployment Protection" diyorsa → Settings → Security'den enable edin
5. Geri kalan her şey çalışıyorsa ignore edin

Detaylı uyarı metnini görürseniz size spesifik çözümü verebilirim.
