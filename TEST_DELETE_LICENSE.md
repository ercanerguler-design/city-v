# Business Üye Silme ve Lisans Anahtarı Test Rehberi

## 🧪 Test Adımları

### Test 1: Yeni Üye Ekleme + Lisans Anahtarı ✅

1. **Admin Dashboard'a giriş yap**
   - URL: `http://localhost:3000/cityvadmin`
   - Admin giriş bilgilerinle login ol

2. **Yeni business üye ekle**
   - "Business Üyelikler" bölümünde "➕ Yeni Üye Ekle" butonuna tıkla
   - Formu doldur:
     - Email: `test@example.com`
     - Şifre: `Test123456`
     - Firma Adı: `Test Firma`
     - Yetkili Kişi: `Test Yetkili`
     - Telefon: `5551234567`
     - Plan: **Premium** veya **Enterprise** seç
     - Bitiş tarihi: Gelecek bir tarih seç
   - "Kaydet" butonuna tıkla

3. **Lisans anahtarını kontrol et**
   - ✅ Başarı mesajı görünmeli
   - ✅ Listede yeni üye görünmeli
   - ✅ **"Lisans"** kolonunda anahtar görünmeli (örn: `CITYV-A3F9-K7M2...`)
   - ✅ Email gelmişse içinde lisans anahtarı olmalı

4. **Veritabanı kontrolü** (Opsiyonel)
   ```sql
   SELECT email, license_key, membership_type, max_cameras 
   FROM business_users 
   WHERE email = 'test@example.com';
   ```
   - ✅ license_key dolu olmalı
   - ✅ membership_type 'premium' veya 'enterprise' olmalı

---

### Test 2: Business Üye Silme ✅

1. **Admin Dashboard'da bir üye seç**
   - Az önce eklediğin test üyesini bul
   - Sağ taraftaki **🗑️ "Sil"** butonuna tıkla

2. **Onay dialogunu kontrol et**
   - ✅ Confirmation popup açılmalı
   - ✅ "Kullanıcı normal üyeliğe (free) dönecek" uyarısı olmalı
   - "Evet" / "OK" seç

3. **Silme sonrasını kontrol et**
   - ✅ Success toast mesajı: "✓ [Firma Adı] business üyelikten çıkarıldı"
   - ✅ Üye **listeden kaybolmalı** (artık görünmemeli)
   - ✅ Sayfa otomatik yenilenmeli

4. **Veritabanı kontrolü** (Opsiyonel)
   ```sql
   SELECT email, membership_type, added_by_admin, license_key 
   FROM business_users 
   WHERE email = 'test@example.com';
   ```
   - ✅ `membership_type = 'free'`
   - ✅ `added_by_admin = false`
   - ✅ `license_key = NULL`
   - ✅ Üye hala veritabanında ama admin listesinde görünmüyor

---

### Test 3: Mevcut Üyeler Lisans Kontrolü 🔍

1. **Admin Dashboard'da mevcut üyelere bak**
   - Business üyeler listesini incele
   - Her üyenin **"Lisans"** kolonuna bak

2. **Eski üyeler için**
   - ⚠️ Migration öncesi eklenen üyelerde lisans `NULL` olabilir
   - Bunlar için:
     - Üyeyi sil (free'e düşür)
     - Tekrar business üye olarak ekle
     - Bu sefer lisans otomatik atanacak

3. **Yeni üyeler için**
   - ✅ Migration sonrası eklenen tüm üyelerde lisans olmalı

---

## 🐛 Olası Sorunlar ve Çözümler

### Problem: Lisans anahtarı gösterilmiyor
**Çözüm:**
1. Browser'ı hard refresh yap (Ctrl+F5)
2. Dev server'ı restart et:
   ```powershell
   # Terminal'de Ctrl+C ile durdur
   npm run dev
   ```
3. Database migration çalıştı mı kontrol et:
   ```powershell
   node database/addLicenseKeyColumn.js
   ```

### Problem: Silinen üye hala listede görünüyor
**Çözüm:**
1. Sayfayı manuel yenile (F5)
2. Browser cache'i temizle
3. Console'da hata var mı kontrol et (F12)

### Problem: Email gitmiyor
**Çözüm:**
1. `.env.local` dosyasında `RESEND_API_KEY` var mı kontrol et
2. Terminal'de email log'larını kontrol et:
   ```
   📧 Hoşgeldin email'i gönderiliyor: ...
   ✅ Hoşgeldin email'i gönderildi: ...
   ```
3. Resend dashboard'da email gönderim durumunu kontrol et

---

## 📊 Beklenen Sonuçlar

### Başarılı Senaryolar

✅ **Yeni üye eklendiğinde:**
- Admin listesinde görünür
- Lisans anahtarı atanmış olur
- Email gönderilir (Resend varsa)
- Veritabanında doğru değerler kaydedilir

✅ **Üye silindiğinde:**
- Admin listesinden kaybolur
- Free üyeliğe dönüştürülür
- Lisans anahtarı temizlenir
- Kullanıcı hala login olabilir (free olarak)

✅ **Email içeriği:**
```
🔐 Giriş Bilgileriniz
Email: test@example.com
Şifre: Test123456
Lisans Anahtarı: CITYV-XXXX-XXXX-XXXX-XXXX

💳 Abonelik Detayları
Plan: PREMIUM / ENTERPRISE
Aylık Ücret: ₺499 / ₺999
Max Kullanıcı: 10 / 50 kişi
```

---

## 🔍 Debug İpuçları

### Console Log'ları
Terminal'de şu log'ları göreceksin:

**Yeni üye ekleme:**
```
✅ Business member added: {
  userId: 123,
  email: 'test@example.com',
  companyName: 'Test Firma',
  actualPlanType: 'premium',
  licenseKey: 'CITYV-XXXX-XXXX-XXXX-XXXX'
}
📧 Hoşgeldin email'i gönderiliyor: test@example.com
✅ Hoşgeldin email'i gönderildi: test@example.com
```

**Üye silme:**
```
✅ Business user 123 reverted to free membership
DELETE /api/admin/business-members 200 in XXXms
```

### Browser Console (F12)
Hata varsa göreceksin:
```javascript
// Başarılı silme
✓ Test Firma business üyelikten çıkarıldı

// Hata durumu
❌ Hata: [error message]
```

---

## ✅ Test Checklist

**Yeni Üye Ekleme:**
- [ ] Form submit oluyor
- [ ] Success mesajı görünüyor
- [ ] Listede yeni üye görünüyor
- [ ] Lisans anahtarı gösteriliyor
- [ ] Email geldi (Resend varsa)
- [ ] Email'de lisans anahtarı var

**Üye Silme:**
- [ ] Confirmation dialog açılıyor
- [ ] Success toast görünüyor
- [ ] Üye listeden kalkıyor
- [ ] Sayfa otomatik yenileniyor
- [ ] Veritabanında free'e dönmüş

**Genel:**
- [ ] Console'da hata yok
- [ ] Network tab'de API çağrıları başarılı (200 status)
- [ ] Admin dashboard stabil çalışıyor

---

## 📝 Notlar

1. **Migration script sadece bir kez çalıştırılır** - Zaten çalıştırıldı ✅
2. **Dev server otomatik hot reload yapar** - Restart gerekmez
3. **Eski üyelerde lisans olmayabilir** - Normal, yeniden eklemen gerekir
4. **Delete işlemi soft delete** - Kullanıcı free üye olarak kalır
5. **License key formatı:** `CITYV-[4 harf]-[4 harf]-[4 harf]-[4 harf]`

---

## 🎯 Test Tamamlandığında

Tüm testler başarılıysa:

✅ Lisans anahtarı sistemi tam çalışıyor
✅ Business üye silme işlevi doğru çalışıyor
✅ Email sistemi entegre
✅ Admin dashboard stabil

Sorunu çözdük! 🎉
