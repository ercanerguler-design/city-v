# 🎯 CityV Admin Panel - İki Ayrı Üyelik Sistemi

## 📋 Sistem Genel Bakış

CityV'de artık **2 ayrı üyelik yönetim sistemi** var:

### 1️⃣ Normal Kullanıcılar (Free & Premium)
- **Kullanıcılar** tab'ında yönetilir
- Basit ve hızlı
- Dropdown veya butonlarla yönetim

### 2️⃣ Business & Enterprise Üyeler
- **Business Üyeler** tab'ında yönetilir  
- Firma bilgileri zorunlu
- Lisans yönetimi
- Başlangıç ve bitiş tarihleri

---

## 🆓 Normal Kullanıcı Yönetimi (Free & Premium)

### Erişim:
```
Admin Panel → Kullanıcılar Tab
```

### Özellikler:
- ✅ Dropdown ile hızlı değiştirme
- ✅ "Premium Yap" butonu (Free → Premium)
- ✅ "Free Yap" butonu (Premium → Free)
- ⚠️ Business/Enterprise seçenekleri devre dışı (ayrı tab kullanılmalı)

### Kullanım:

**Dropdown İle**:
1. Kullanıcıyı bul
2. Üyelik dropdown'unu aç
3. Free veya Premium seç
4. ✅ Otomatik kaydedilir

**Butonlarla**:
- ⬆️ **Premium Yap**: Kullanıcıyı premium üye yapar
- ⬇️ **Free Yap**: Kullanıcıyı free üye yapar

---

## 🏢 Business & Enterprise Yönetimi

### Erişim:
```
Admin Panel → Business Üyeler Tab
```

### Yeni Business Üye Ekleme:

**1. "Yeni Üye Ekle" butonuna tıkla**

**2. Firma Bilgilerini Doldur**:
- Firma Adı (zorunlu)
- Firma Tipi (restaurant, cafe, retail, hotel, vb.)
- Şehir ve İlçe
- Adres
- Vergi Numarası ve Vergi Dairesi

**3. Yetkili Kişi Bilgileri**:
- Yetkili Kişi (zorunlu)
- Email (zorunlu)
- Telefon

**4. Üyelik Planı Seç**:

### 💎 Premium Plan (₺2,500/ay)
```
• 10 Kamera
• AI Analitik
• Push Bildirimleri
• Gelişmiş Raporlar
• 1 Kullanıcı
```

### ⭐ Enterprise Plan (₺5,000/ay)
```
• 50 Kamera
• AI Analitik
• Push Bildirimleri
• Gelişmiş Raporlar
• API Erişimi
• 5 Kullanıcı
```

**5. Tarih Belirle**:
- ✅ **Başlangıç Tarihi** (zorunlu)
- ✅ **Bitiş Tarihi** (zorunlu)
- Deneme sürümü seçeneği (isteğe bağlı)

**6. "Üye Ekle ve Lisans Gönder"**

### Otomatik Yapılanlar:
- ✅ PostgreSQL'e kaydedilir
- ✅ Benzersiz lisans anahtarı oluşturulur (CITYV-XXXX-XXXX-XXXX-XXXX)
- ✅ Geçici şifre oluşturulur
- 📧 Email gönderilir (TODO: Resend API)

---

## 📊 Business Üye Listesi

### Görüntülenen Bilgiler:
| Sütun | Açıklama |
|-------|----------|
| Firma | Firma adı, tipi ve şehir |
| Yetkili Kişi | Ad ve email |
| Plan | Premium veya Enterprise + Trial badge |
| Lisans | Lisans anahtarı (kısaltılmış) |
| Başlangıç | Üyelik başlangıç tarihi |
| Bitiş | Üyelik bitiş tarihi + kalan gün uyarısı |
| Durum | ✓ Aktif veya ✕ Süresi Dolmuş |

### Durum Göstergeleri:
- 🟢 **Aktif**: Lisans geçerli ve bitiş tarihi gelmemiş
- 🔴 **Süresi Dolmuş**: Bitiş tarihi geçmiş
- 🟠 **30 Gün Uyarısı**: Bitiş tarihine 30 gün kaldı

---

## 🔐 Lisans Sistemi

### Lisans Anahtarı:
```
Format: CITYV-ABC123-XYZ789-QWE456-RTY890
- Benzersiz
- Otomatik oluşturulur
- Database'de saklanır
```

### Business Sayfasında Kontrol:
Business kullanıcı giriş yaptığında:
1. Lisans durumu kontrol edilir
2. Banner gösterilir:
   - ✅ **Aktif**: Yeşil banner
   - ⏰ **Deneme**: Turuncu banner
   - ⚠️ **Süresi Dolmuş**: Kırmızı banner + erişim kısıtlı

---

## 🚨 Önemli Kurallar

### ❌ YAPMA:
- Normal kullanıcıları Business/Enterprise yapmak için **Kullanıcılar** tab'ını kullanma
- Business üyeleri için dropdown'dan seçim yapma

### ✅ YAP:
- Normal kullanıcılar için → **Kullanıcılar** tab
- Business/Enterprise için → **Business Üyeler** tab + "Yeni Üye Ekle"

---

## 📝 Örnek Senaryo

### Senaryo 1: Normal Kullanıcıyı Premium Yap
```
1. Admin Panel → Kullanıcılar
2. Kullanıcıyı bul: "Ahmet Yılmaz"
3. Dropdown'dan "Premium" seç
   VEYA
   "Premium Yap" butonuna tıkla
4. ✅ Başarılı!
```

### Senaryo 2: Yeni Business Üye Ekle
```
1. Admin Panel → Business Üyeler
2. "Yeni Üye Ekle" butonu
3. Formu doldur:
   - Firma: "ABC Restaurant"
   - Email: "info@abc.com"
   - Plan: Premium (₺2,500)
   - Başlangıç: 01.11.2024
   - Bitiş: 01.11.2025
4. "Üye Ekle ve Lisans Gönder"
5. ✅ Lisans: CITYV-A1B2C3-D4E5F6-G7H8I9-J0K1L2
```

### Senaryo 3: Business Kullanıcı Girişi
```
1. http://localhost:3000/business
2. Email: info@abc.com
3. Password: <geçici şifre>
4. ✅ Dashboard açılır
5. 🟢 Banner: "Lisans Aktif - Premium Plan - Bitiş: 01.11.2025 (335 gün kaldı)"
```

---

## 🗄️ Database Yapısı

### Normal Kullanıcılar:
```sql
users (
  id,
  name,
  email,
  membership_tier  -- 'free' veya 'premium'
)
```

### Business Kullanıcılar:
```sql
business_users (
  id,
  email,
  company_name,
  company_type,
  company_address,
  tax_number,
  authorized_person,
  ...
)

business_subscriptions (
  id,
  user_id,
  plan_type,        -- 'premium' veya 'enterprise'
  start_date,       -- ZORUNLU
  end_date,         -- ZORUNLU
  license_key,      -- Benzersiz
  is_trial,
  is_active
)
```

---

## 🔧 API Endpoints

### Normal Kullanıcılar:
```
POST /api/admin/update-membership
Body: { userId, membershipTier: 'free' | 'premium' }
```

### Business Üyeler:
```
GET  /api/admin/business-members  (Liste)
POST /api/admin/business-members  (Yeni ekle)
PUT  /api/admin/business-members  (Güncelle)

GET  /api/business/license-check  (Lisans kontrolü)
```

---

## ✅ Özet

| Özellik | Normal Kullanıcılar | Business Üyeler |
|---------|---------------------|-----------------|
| **Tab** | Kullanıcılar | Business Üyeler |
| **Seviyeler** | Free, Premium | Premium, Enterprise |
| **Firma Bilgileri** | ❌ | ✅ Zorunlu |
| **Lisans** | ❌ | ✅ Otomatik |
| **Tarih Yönetimi** | ❌ | ✅ Başlangıç/Bitiş |
| **Yönetim** | Dropdown/Buton | Form |
| **Aylık Ücret** | - | ₺2,500 - ₺5,000 |

---

## 🎉 Hazır!

Artık iki ayrı sistem tamamen çalışıyor:
- ✅ Normal kullanıcılar için basit yönetim
- ✅ Business üyeler için gelişmiş lisanslama sistemi
- ✅ Her iki sistem birbirini etkilemiyor
- ✅ Tüm validasyonlar çalışıyor

**İyi çalışmalar!** 🚀
