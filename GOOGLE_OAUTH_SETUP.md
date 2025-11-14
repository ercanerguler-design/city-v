# 🔐 Google OAuth Kurulum Rehberi

Google ile giriş özelliğini aktif etmek için aşağıdaki adımları izleyin:

## 1️⃣ Google Cloud Console'a Giriş

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Mevcut projenizi seçin veya yeni bir proje oluşturun

## 2️⃣ OAuth Consent Screen Ayarları

1. Sol menüden **APIs & Services > OAuth consent screen** seçin
2. **External** seçin ve **CREATE** butonuna tıklayın
3. Zorunlu alanları doldurun:
   - **App name**: City-V
   - **User support email**: sce@scegrup.com
   - **Developer contact email**: sce@scegrup.com
4. **SAVE AND CONTINUE** butonuna tıklayın
5. **Scopes** sayfasında **SAVE AND CONTINUE**
6. **Test users** sayfasında **SAVE AND CONTINUE**
7. **Summary** sayfasında **BACK TO DASHBOARD**

## 3️⃣ OAuth Client ID Oluşturma

1. Sol menüden **APIs & Services > Credentials** seçin
2. **+ CREATE CREDENTIALS** butonuna tıklayın
3. **OAuth client ID** seçin
4. **Application type**: **Web application** seçin
5. **Name**: City-V Web Client
6. **Authorized JavaScript origins** ekleyin:
   ```
   http://localhost:3000
   https://cityv.vercel.app
   https://yourdomain.com
   ```
7. **Authorized redirect URIs** ekleyin:
   ```
   http://localhost:3000
   https://cityv.vercel.app
   https://yourdomain.com
   ```
8. **CREATE** butonuna tıklayın
9. Açılan penceredeki **Client ID**'yi kopyalayın

## 4️⃣ .env.local Dosyasını Güncelleme

`.env.local` dosyasını açın ve kopyaladığınız Client ID'yi yapıştırın:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1047674633093-xxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

## 5️⃣ Vercel'e Environment Variable Ekleme

1. [Vercel Dashboard](https://vercel.com/dashboard) adresine gidin
2. Projenizi seçin
3. **Settings > Environment Variables** seçin
4. Yeni environment variable ekleyin:
   - **Name**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - **Value**: Kopyaladığınız Client ID
   - **Environment**: Production, Preview, Development (hepsini seçin)
5. **Save** butonuna tıklayın
6. Projeyi yeniden deploy edin

## 6️⃣ Test Etme

1. Development sunucusunu yeniden başlatın:
   ```bash
   npm run dev
   ```
2. Tarayıcıda `http://localhost:3000` adresine gidin
3. **Giriş Yap** butonuna tıklayın
4. **Google ile Giriş Yap** butonuna tıklayın
5. Google hesabınızı seçin
6. İzinleri onaylayın

## ✅ Tamamlandı!

Artık kullanıcılar Google hesapları ile giriş yapabilir:
- ✅ Hem mobil hem web tarafında aktif
- ✅ İlk giriş otomatik kayıt oluşturur
- ✅ Kullanıcılar varsayılan olarak **FREE** tier ile başlar
- ✅ Premium için admin onayı gerekir

## 🔒 Güvenlik Notları

- Client ID public olabilir (NEXT_PUBLIC_)
- Client Secret kullanmıyoruz (server-side yok)
- Token verification client-side yapılıyor
- Kullanıcı bilgileri localStorage'da tutuluyor

## 📱 Mobil Uyumluluk

Google Sign-In otomatik olarak responsive:
- iOS Safari ✅
- Android Chrome ✅
- Mobil tarayıcılar ✅

## 🐛 Sorun Giderme

**"popup_closed_by_user" hatası:**
- Normal, kullanıcı popup'ı kapattı

**"invalid_client" hatası:**
- Client ID'yi kontrol edin
- Authorized origins'i kontrol edin

**Script yüklenmiyor:**
- İnternet bağlantısını kontrol edin
- Sayfayı yenileyin

## 📞 Destek

Sorun yaşarsanız: sce@scegrup.com
