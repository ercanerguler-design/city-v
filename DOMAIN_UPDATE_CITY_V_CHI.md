# 🌐 CityV Domain Güncelleme - Vercel Deployment

## ✅ Yeni Domain: city-v-chi.vercel.app

### 📋 Güncellenen Konfigürasyonlar

#### 1. Vercel Config (✅ Tamamlandı)
- `vercel.json`: Proje adı `city-v-chi` olarak güncellendi
- Domain: https://city-v-chi.vercel.app

#### 2. Environment Variables (✅ Tamamlandı)
- `.env.local`: `NEXT_PUBLIC_API_URL` eklendi
- Production URL: https://city-v-chi.vercel.app

#### 3. Google OAuth Config (✅ Tamamlandı)
- Authorized Domains: `city-v-chi.vercel.app` eklendi
- JavaScript Origins: `https://city-v-chi.vercel.app` eklendi
- Redirect URIs güncellendi

### 🔧 Gerekli Manuel İşlemler

#### Google Cloud Console Güncellemesi Gerekli:
1. **Console'a git**: https://console.cloud.google.com/apis/credentials
2. **OAuth 2.0 Client ID'yi aç**
3. **Authorized JavaScript origins'e ekle**:
   ```
   https://city-v-chi.vercel.app
   ```
4. **Authorized redirect URIs'e ekle**:
   ```
   https://city-v-chi.vercel.app
   https://city-v-chi.vercel.app/auth/google/callback
   ```

#### Vercel Environment Variables:
Vercel Dashboard'da aşağıdaki environment variable'ları ekle:
```bash
NEXT_PUBLIC_API_URL=https://city-v-chi.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=693372259383-c2ge11rus1taeh0dae9sur7kdo6ndiuo.apps.googleusercontent.com
```

### 🚀 Deployment Sonrası Test

#### 1. Ana Sayfa:
```
https://city-v-chi.vercel.app/
```

#### 2. Business Dashboard:
```
https://city-v-chi.vercel.app/business/dashboard
```

#### 3. API Test:
```
https://city-v-chi.vercel.app/api/health
```

#### 4. Google OAuth Test:
```
https://city-v-chi.vercel.app/business/login
```

### 📁 Güncellenen Dosyalar

1. ✅ `vercel.json` - Proje adı güncellendi
2. ✅ `.env.local` - API URL eklendi  
3. ✅ `GOOGLE_OAUTH_FIX.md` - Domain referansları güncellendi

### 🔗 İlgili Linkler

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Live Site**: https://city-v-chi.vercel.app/
- **API Documentation**: https://city-v-chi.vercel.app/api/health

### ⚡ Hızlı Test Komutları

```powershell
# Ana sayfa testi
Invoke-RestMethod -Uri "https://city-v-chi.vercel.app/" -Method GET

# API health check
Invoke-RestMethod -Uri "https://city-v-chi.vercel.app/api/health" -Method GET

# Business API test
Invoke-RestMethod -Uri "https://city-v-chi.vercel.app/api/business/me" -Method GET
```

### 📝 Notlar

1. **DNS Propagation**: Yeni domain için 5-10 dakika bekleyin
2. **SSL Certificate**: Vercel otomatik SSL sertifikası oluşturacak
3. **OAuth Testing**: Google OAuth için yeni domain'de test edin
4. **Cache Clear**: Tarayıcı cache'ini temizleyin

### ✅ Deployment Checklist

- [x] `vercel.json` güncellendi
- [x] `.env.local` güncellendi  
- [x] Documentation güncellendi
- [ ] Google OAuth domain'i eklendi (Manuel)
- [ ] Vercel env variables eklendi (Manuel)
- [ ] Production test yapıldı
- [ ] OAuth login test yapıldı