# 🚀 Vercel Deployment Checklist - CityV

## ✅ Kod Push Edildi!

Tüm değişiklikler GitHub'a push edildi. Vercel otomatik deployment başlatacak.

---

## 📋 SON KONTROLLER

### 1️⃣ Vercel Dashboard'u Kontrol Et

https://vercel.com/dashboard

- ✅ Yeni deployment başladı mı?
- ✅ Build process çalışıyor mu?
- ⏳ Status: "Building..." olmalı

### 2️⃣ Environment Variables (ZORUNLU!)

Eğer ilk kez deploy ediyorsan veya giriş çalışmıyorsa:

**Vercel Dashboard > Project > Settings > Environment Variables**

```bash
DATABASE_URL = postgres://...your_database_url...
POSTGRES_URL = postgres://...your_database_url...
NEXT_PUBLIC_GOOGLE_CLIENT_ID = 693372259383-c2ge11rus1taeh0dae9sur7kdo6ndiuo.apps.googleusercontent.com
JWT_SECRET = cityv-business-secret-key-2024
```

**Her değişken için:**
- ✓ Production
- ✓ Preview
- ✓ Development

### 3️⃣ Google OAuth Ayarları

https://console.cloud.google.com/apis/credentials

**Authorized JavaScript origins:**
```
https://city-v.vercel.app
https://city-v-git-*.vercel.app
https://*.vercel.app
```

**Authorized redirect URIs:**
```
https://city-v.vercel.app
https://city-v-git-*.vercel.app
https://*.vercel.app
```

---

## 🔍 DEPLOYMENT TAKIP

### Build Logs Kontrol:

1. Vercel Dashboard > Deployments
2. En son deployment'a tıkla
3. "View Build Logs" veya "Runtime Logs"

### Başarılı Deploy İşaretleri:

```
✅ Build completed in ...
✅ Serverless Functions deployed
✅ Edge Functions deployed  
✅ Preview: https://city-v-xxx.vercel.app
✅ Production: https://city-v.vercel.app
```

### Olası Build Hataları:

❌ **TypeScript errors**: `next.config.ts` zaten ignore ediyor, sorun olmamalı
❌ **Missing env vars**: Environment variables'ı kontrol et
❌ **Database connection**: DATABASE_URL doğru mu?

---

## 🧪 DEPLOYMENT SONRASI TEST

### 1️⃣ Ana Sayfa Test

```
https://city-v.vercel.app
```

- [ ] Sayfa yükleniyor mu?
- [ ] Harita görünüyor mu?
- [ ] Business locations görünüyor mu?

### 2️⃣ Login Test - Regular User

URL: `https://city-v.vercel.app`

```
Email: test@cityv.app
Password: test123456
```

- [ ] Giriş butonu çalışıyor mu?
- [ ] Login modal açılıyor mu?
- [ ] Giriş başarılı mı?
- [ ] Kullanıcı bilgileri görünüyor mu?

### 3️⃣ Login Test - Business User

URL: `https://city-v.vercel.app/business`

```
Email: atmbankde@gmail.com
Password: test123
```

- [ ] Business login çalışıyor mu?
- [ ] Dashboard açılıyor mu?
- [ ] Kamera verileri görünüyor mu?

### 4️⃣ Google Login Test

- [ ] "Google ile Giriş Yap" butonu var mı?
- [ ] Popup açılıyor mu?
- [ ] Giriş başarılı mı?

### 5️⃣ LiveCrowdSidebar Test

- [ ] Sağ tarafta yan panel açılıyor mu?
- [ ] Business IoT verileri görünüyor mu?
- [ ] Kişi sayıları doğru mu? (0505050505050 gibi garip sayılar YOK)
- [ ] SCE INNOVATION kartı düzgün görünüyor mu?

---

## ❌ SORUN ÇÖZME

### Giriş Yapamıyorum

**1. Environment Variables Eksik:**
```powershell
# Local'de test et
node check-vercel-env.js
```

**2. Database Bağlantısı:**
- Vercel logs'ta "Database connection failed" var mı?
- DATABASE_URL doğru format'ta mı?
- Postgres erişilebilir mi?

**3. Google OAuth:**
- Vercel domain Google Console'da var mı?
- Client ID doğru mu?
- Browser console'da hata var mı?

### Build Failed

**Check Build Logs:**
```
Vercel Dashboard > Deployments > [Latest] > Build Logs
```

**Common Issues:**
- Missing dependencies: `npm install` eksik mi?
- TypeScript errors: Zaten ignore edilmeli
- Memory limit: Vercel Pro gerekebilir

### Kişi Sayıları Hala Garip

**Cache Problemi:**
1. Hard refresh: Ctrl + Shift + R
2. Browser cache temizle
3. Incognito mode'da dene

**API Problemi:**
```
https://city-v.vercel.app/api/business/live-iot-data
```
Response'da `totalPeople` değerini kontrol et

---

## 📱 PRODUCTION READY CHECKLIST

- [ ] Deployment başarılı
- [ ] Environment variables set
- [ ] Google OAuth configured
- [ ] Database connected
- [ ] Test users working
- [ ] Business login working
- [ ] Regular login working
- [ ] IoT data displaying correctly
- [ ] No console errors
- [ ] Mobile responsive working

---

## 🎉 DEPLOYMENT BAŞARILI!

Eğer tüm testler geçtiyse:

✅ **Production URL:** https://city-v.vercel.app
✅ **Business Dashboard:** https://city-v.vercel.app/business
✅ **API Health:** https://city-v.vercel.app/api/health

### Analytics & Monitoring:

- Vercel Analytics: https://vercel.com/[your-project]/analytics
- Speed Insights: https://vercel.com/[your-project]/speed-insights
- Logs: https://vercel.com/[your-project]/logs

---

## 🔄 SONRAKI DEPLOY

Değişiklik yaptığında:

```powershell
git add .
git commit -m "feat: Yeni özellik açıklaması"
git push origin master
```

Vercel otomatik deploy edecek! 🚀

---

**Son Güncelleme:** 12 Aralık 2024
**Commit Hash:** 6d6d910
**Status:** ✅ Ready for production
