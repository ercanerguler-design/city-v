# 📧 EMAIL BİLDİRİMLERİ KURULUM REHBERİ

## 🎯 Ne İşe Yarar?

Beta başvurusu yapılınca:
1. ✅ **Admin'e** (sana) bildirim gider
2. ✅ **Başvuru sahibine** onay maili gider

---

## 🚀 Hızlı Kurulum (5 Dakika)

### 1️⃣ Resend Hesabı Aç

1. **https://resend.com** adresine git
2. **Sign Up** tıkla (GitHub ile hızlı giriş)
3. Email doğrula

### 2️⃣ API Key Al

1. Dashboard'da **API Keys** bölümüne git
2. **Create API Key** tıkla
3. İsim ver (örn: "City-V Beta")
4. Key'i kopyala (örn: `re_123456789...`)

### 3️⃣ Environment Variables Ayarla

`.env.local` dosyası oluştur (workspace root):

```bash
# Resend API Key (buraya kendi key'ini yapıştır)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin Email (beta başvuruları buraya gelecek)
ADMIN_EMAIL=ercan@cityv.com
```

### 4️⃣ Test Et

```bash
# Dev server'ı yeniden başlat
npm run dev

# Beta form doldur ve gönder:
# http://localhost:3001/business-box/beta

# Console'da email çıktısını gör
```

---

## 📊 Email Akışı

```
Kullanıcı Beta Form Doldurur
           ↓
    POST /api/beta/apply
           ↓
    ┌──────┴──────┐
    ↓             ↓
Admin'e Mail   Kullanıcıya Mail
(bildirim)     (onay)
```

### Admin'e Giden Email:
```
Konu: 🎉 Yeni Beta Başvurusu: [İşletme Adı]

İçerik:
- Başvuru özeti
- İşletme bilgileri
- İletişim bilgileri
- İstatistikler
- Hedefler
- "Müşteri ile İletişime Geç" butonu
```

### Kullanıcıya Giden Email:
```
Konu: ✅ Beta Başvurunuz Alındı - BETA-XXXXXX

İçerik:
- Başvuru numarası
- Onay mesajı
- Sonraki adımlar (48 saat içinde dönüş)
- Beta avantajları (₺4,484 değer)
- İletişim bilgileri
```

---

## 🔧 Teknik Detaylar

### Dosya Yapısı

```
app/
  api/
    beta/
      apply/
        route.ts          ← API endpoint (email gönderir)
  business-box/
    beta/
      page.tsx            ← Form sayfası (API'yi çağırır)

.env.local                ← API keys (GIT'e EKLEME!)
.env.local.example        ← Örnek template
```

### API Endpoint

**URL**: `POST /api/beta/apply`

**Request Body**:
```json
{
  "businessName": "Kahve Dünyası",
  "businessType": "cafe",
  "location": "Ankara, Çankaya",
  "ownerName": "Ahmet Yılmaz",
  "email": "ahmet@kahvedunyasi.com",
  "phone": "+90 555 123 4567",
  "website": "https://kahvedunyasi.com",
  "averageDaily": "100-200",
  "openingHours": "08:00-22:00",
  "currentSolution": "manuel",
  "goals": ["Müşteri memnuniyeti", "Yoğunluk takibi"],
  "heardFrom": "social",
  "additionalInfo": "İki şubemiz var"
}
```

**Response** (Success):
```json
{
  "success": true,
  "applicationId": "BETA-12345678",
  "message": "Başvurunuz başarıyla alındı. Email gönderildi."
}
```

**Response** (Error):
```json
{
  "error": "Eksik bilgiler var"
}
```

---

## 🎨 Email Template Özellikleri

✅ Responsive (mobil uyumlu)  
✅ Modern gradient design  
✅ Türkçe içerik  
✅ Action button'lar  
✅ Tüm başvuru bilgileri  
✅ Beta avantajları vurgulanmış  
✅ Profesyonel görünüm  

---

## 💰 Resend Fiyatlandırma

| Plan | Aylık Email | Fiyat |
|------|-------------|-------|
| **Free** | 3,000 email | $0 |
| Pro | 50,000 email | $20 |
| Business | 100,000 email | $80 |

**Beta programı için Free plan yeterli** (ayda 3,000 email = günde 100 başvuru)

---

## 🔐 Güvenlik

### .gitignore'a Ekle

`.env.local` dosyası **asla** GitHub'a yüklenmemeli:

```bash
# .gitignore dosyasına ekle
.env*.local
.env.local
```

### API Key Güvenliği

- ✅ Sadece server-side kullan (route.ts)
- ❌ ASLA client-side'da kullanma
- ✅ Environment variable olarak sakla
- ❌ ASLA hardcode etme

---

## 🧪 Test Senaryoları

### 1. Dev Mode (API Key yok)

```bash
# .env.local dosyası YOK veya RESEND_API_KEY YOK
npm run dev

# Form doldur → Console'da email görünür
```

Console Output:
```
====================================
📧 EMAIL (DEV MODE - Console)
====================================
To: ahmet@kahvedunyasi.com
Subject: ✅ Beta Başvurunuz Alındı - BETA-12345678
====================================
HTML Preview: <!DOCTYPE html>...
====================================
```

### 2. Production Mode (API Key var)

```bash
# .env.local dosyası VAR
RESEND_API_KEY=re_xxxxxxxxxx
ADMIN_EMAIL=ercan@cityv.com

npm run dev

# Form doldur → Gerçek email gönderilir
```

Console Output:
```
✅ Email gönderildi: { id: 'email_123abc...' }
```

---

## 🐛 Troubleshooting

### Problem: Email gitmiyor

**Çözüm 1**: API Key kontrol et
```bash
# .env.local dosyasını aç
# RESEND_API_KEY doğru mu?
# Server'ı yeniden başlat: npm run dev
```

**Çözüm 2**: Resend Dashboard'u kontrol et
```
https://resend.com/emails
# Gönderilen emailler burada görünür
```

**Çözüm 3**: Console log kontrol et
```bash
# Terminal'de hata mesajları var mı?
# ❌ Email gönderim hatası: ...
```

### Problem: "401 Unauthorized"

**Çözüm**: API Key yanlış veya expired
```bash
1. Resend Dashboard → API Keys
2. Yeni key oluştur
3. .env.local dosyasını güncelle
4. Server yeniden başlat
```

### Problem: "Domain not verified"

**Çözüm**: Geçici olarak `resend.dev` kullan
```typescript
// route.ts dosyasında
from: 'City-V Beta <beta@resend.dev>'
// ✅ resend.dev domain ücretsiz, doğrulama gerektirmez
```

**Kalıcı Çözüm**: Kendi domain'ini doğrula
```
1. Resend → Domains
2. Add Domain (cityv.com)
3. DNS kayıtlarını ekle (MX, SPF, DKIM)
4. Doğrulamayı bekle (15-30 dakika)
5. from: 'City-V <beta@cityv.com>' kullan
```

---

## 📱 Mobil Görünüm

Email template responsive tasarımlı:

```
┌──────────────┐
│   🎉 Tebrik  │  ← Header (gradient)
├──────────────┤
│ Merhaba...   │
│              │
│ ┌──────────┐ │
│ │ Başvuru  │ │  ← Info box
│ │ Bilgileri│ │
│ └──────────┘ │
│              │
│ ┌──────────┐ │
│ │ Beta     │ │  ← Highlight box
│ │ Avantaj  │ │
│ └──────────┘ │
│              │
│ City-V © 2025│  ← Footer
└──────────────┘
```

---

## 🚀 İleri Seviye

### Email Template Değiştirme

`app/api/beta/apply/route.ts` dosyasında:

```typescript
// Admin email template
function generateEmailHTML(data: BetaApplication, applicationId: string) {
  return `
    <!DOCTYPE html>
    <html>
      <!-- Burası değiştirilebilir -->
    </html>
  `;
}

// Kullanıcı onay email template
const confirmationHTML = `
  <!DOCTYPE html>
  <html>
    <!-- Burası değiştirilebilir -->
  </html>
`;
```

### Attachment Ekleme

```typescript
await resend.emails.send({
  from: 'City-V Beta <beta@resend.dev>',
  to: [to],
  subject: subject,
  html: html,
  attachments: [
    {
      filename: 'beta-guide.pdf',
      content: pdfBuffer, // Buffer
    },
  ],
});
```

### CC/BCC Ekleme

```typescript
await resend.emails.send({
  from: 'City-V Beta <beta@resend.dev>',
  to: [to],
  cc: ['sales@cityv.com'],
  bcc: ['analytics@cityv.com'],
  subject: subject,
  html: html,
});
```

---

## ✅ Checklist

Kurulum tamamlandı mı?

- [ ] Resend hesabı açıldı
- [ ] API Key alındı
- [ ] `.env.local` dosyası oluşturuldu
- [ ] API Key yapıştırıldı
- [ ] Admin email ayarlandı
- [ ] Server yeniden başlatıldı
- [ ] Test başvurusu yapıldı
- [ ] Console'da email görüldü
- [ ] Gerçek email test edildi (production)
- [ ] `.gitignore` kontrol edildi

---

## 📞 Destek

**Resend Dokümantasyonu**: https://resend.com/docs  
**API Reference**: https://resend.com/docs/api-reference/emails/send-email

---

**City-V © 2025 - Email Bildirimleri v1.0**
