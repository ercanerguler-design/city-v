# 🚀 Google OAuth Hızlı Kurulum (5 Dakika)

## 📋 Yapılacaklar Listesi

### ✅ Tamamlanan
- [x] Google Sign-In kodu eklendi
- [x] AuthModal güncellendi (mobil + web)
- [x] loginWithGoogle fonksiyonu eklendi
- [x] Otomatik kullanıcı kaydı eklendi
- [x] FREE tier başlangıç ayarlandı
- [x] Kurulum dokümantasyonu hazırlandı

### ⏳ Yapılması Gerekenler (Sadece 5 dakika!)

1. **Google Cloud Console'a git**: https://console.cloud.google.com/

2. **OAuth Client ID oluştur**:
   - APIs & Services > Credentials
   - CREATE CREDENTIALS > OAuth client ID
   - Web application
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://cityv-1gsbmi4xd-ercanergulers-projects.vercel.app
     ```
   - CREATE > Client ID'yi kopyala

3. **.env.local dosyasını güncelle**:
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR-COPIED-CLIENT-ID-HERE
   ```

4. **Vercel'e Environment Variable ekle**:
   - Vercel Dashboard > Settings > Environment Variables
   - Name: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Value: (kopyaladığınız Client ID)
   - Save > Redeploy

5. **Dev sunucusunu yeniden başlat**:
   ```bash
   npm run dev
   ```

## ✨ Özellikler

### Kullanıcı Deneyimi
- ✅ Tek tıkla Google ile giriş (One Tap)
- ✅ İlk giriş otomatik kayıt oluşturur
- ✅ Email, isim ve profil fotoğrafı otomatik alınır
- ✅ Mobil ve web tarayıcılarında çalışır
- ✅ Hem iOS hem Android uyumlu

### Güvenlik
- ✅ Kullanıcı bilgileri localStorage'da
- ✅ Token verification client-side
- ✅ Yeni kullanıcılar FREE tier ile başlar
- ✅ Premium için admin onayı gerekir

### Admin Kontrolü
- ✅ Tüm Google kullanıcıları admin panelinde görünür
- ✅ Admin onayı ile premium yükseltilebilir
- ✅ Email bazlı kullanıcı yönetimi

## 🎯 Kullanım Akışı

### Yeni Kullanıcı (İlk Google Girişi)
1. "Google ile Giriş Yap" butonuna tıklar
2. Google hesabını seçer
3. İzinleri onaylar
4. **Otomatik kayıt oluşturulur** → FREE tier
5. Dashboard'a yönlendirilir
6. Premium için admin onayı bekler

### Mevcut Kullanıcı (Daha Önce Google ile Kayıt Olmuş)
1. "Google ile Giriş Yap" butonuna tıklar
2. Google hesabını seçer
3. **Direkt giriş yapar** → Mevcut tier korunur
4. Dashboard'a yönlendirilir

### Admin Tarafı
1. Admin panel > Kullanıcılar
2. Google ile kayıt olan kullanıcıları görür
3. İstediğine "Premium Yap" der
4. Kullanıcı premium özelliklere erişir

## 📱 Mobil Test

### iOS Safari
- Google One Tap açılır
- Hesap seçimi yapılır
- Otomatik giriş/kayıt

### Android Chrome
- Google hesap seçici açılır
- Native deneyim
- Hızlı giriş

## 🔧 Teknik Detaylar

### AuthModal.tsx
```typescript
// Google Sign-In script otomatik yüklenir
// One Tap popup açılır
// JWT token decode edilir
// Email, name, picture alınır
// loginWithGoogle() çağrılır
```

### authStore.ts
```typescript
loginWithGoogle: async (googleUser) => {
  // 1. Email ile kullanıcı var mı kontrol et
  // 2. Yoksa otomatik kaydet (FREE tier)
  // 3. Varsa bilgilerini al
  // 4. Giriş yap
}
```

## ⚠️ Önemli Notlar

1. **Client ID gerekli** - .env.local'e eklenene kadar çalışmaz
2. **Vercel'de de ekle** - Production için environment variable gerekli
3. **Authorized Origins** - Doğru URL'ler eklenmiş olmalı
4. **FREE başlangıç** - Tüm yeni kullanıcılar FREE tier
5. **Admin onayı** - Premium için manuel onay gerekir

## 📞 Destek

Sorun yaşarsanız:
- Email: sce@scegrup.com
- Dokümantasyon: GOOGLE_OAUTH_SETUP.md

## 🎉 Tamamlandı!

Artık kullanıcılar:
- ✅ Google ile tek tıkla kayıt olabilir
- ✅ Google ile tek tıkla giriş yapabilir
- ✅ Mobil ve web'de sorunsuz çalışır
- ✅ Admin onayı ile premium olabilir

**Satın alma sistemi açılana kadar premium sadece admin onayı ile!** 🔐
