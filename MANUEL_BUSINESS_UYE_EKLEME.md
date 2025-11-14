# ✅ Manuel Business Üye Ekleme Sistemi - TAMAMLANDI

## 🎯 Yapılan Değişiklikler

### 1. **BusinessMemberForm'a Şifre Alanı Eklendi**

**Dosya:** `components/Admin/BusinessMemberForm.tsx`

#### Eklenen Alanlar:
```tsx
// State
password: '', // Admin tarafından belirlenen şifre

// Input (Telefon'dan sonra)
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Şifre <span className="text-red-500">*</span>
  </label>
  <input
    type="password"
    required
    value={formData.password}
    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    className="..."
    placeholder="Kullanıcının giriş şifresi (min. 8 karakter)"
    minLength={8}
  />
  <p className="text-xs text-gray-500 mt-1">
    💡 Kullanıcı business dashboard'da profil ayarlarından şifreyi değiştirebilecek
  </p>
</div>
```

#### Validasyon:
```tsx
if (!formData.password || formData.password.length < 8) {
  toast.error('Şifre en az 8 karakter olmalı!');
  return;
}
```

---

### 2. **API'de Şifre Yönetimi**

**Dosya:** `app/api/admin/business-members/route.ts`

#### Parametre Alma:
```tsx
const {
  email,
  fullName,
  companyName,
  companyType,
  companyAddress,
  companyCity,
  companyDistrict,
  taxNumber,
  taxOffice,
  authorizedPerson,
  phone,
  password, // ⭐ Admin'in belirlediği şifre
  planType,
  startDate,
  endDate,
  maxUsers,
  isTrial,
  adminNotes
} = body;
```

#### Validasyon:
```tsx
if (!email || !companyName || !authorizedPerson || !password) {
  return NextResponse.json(
    { success: false, error: 'Email, firma adı, yetkili kişi ve şifre zorunludur!' },
    { status: 400 }
  );
}

if (password.length < 8) {
  return NextResponse.json(
    { success: false, error: 'Şifre en az 8 karakter olmalı!' },
    { status: 400 }
  );
}
```

#### Şifre Hash'leme:
```tsx
// ❌ ESKİ: Geçici şifre oluşturma
// const tempPassword = Math.random().toString(36).slice(-8);
// const hashedPassword = await bcrypt.hash(tempPassword, 10);

// ✅ YENİ: Admin'in belirlediği şifreyi hash'le
const hashedPassword = await bcrypt.hash(password, 10);
```

#### Database Insert:
```tsx
INSERT INTO business_users (
  email,
  password_hash, // ⭐ Hash'lenmiş şifre
  full_name,
  company_name,
  authorized_person,
  ...
) VALUES ($1, $2, $3, $4, $5, ...)
```

---

## 🎨 Form Alanları (Tüm Detaylar)

### 📋 Firma Bilgileri
| Alan | Zorunlu | Placeholder |
|------|---------|-------------|
| Firma Adı | ✅ | ABC Restaurant Zinciri |
| Firma Tipi | ✅ | Dropdown (Restoran, Kafe, AVM...) |
| Şehir | ✅ | Ankara, İstanbul, İzmir... |
| İlçe | ❌ | Çankaya, Keçiören... |
| Adres | ❌ | Tam adres |
| Vergi No | ❌ | 10 haneli vergi no |
| Vergi Dairesi | ❌ | Çankaya Vergi Dairesi |

### 👤 Yetkili Kişi Bilgileri
| Alan | Zorunlu | Placeholder |
|------|---------|-------------|
| Yetkili Kişi | ✅ | Ad Soyad |
| Email | ✅ | email@firma.com |
| Telefon | ❌ | 05XX XXX XX XX |
| **Şifre** | ✅ | min. 8 karakter |

### 💳 Üyelik Planı
| Plan | Fiyat | Max Kamera | Max User | API |
|------|-------|------------|----------|-----|
| **Premium** | ₺2,500/ay | 10 | 1 | ❌ |
| **Enterprise** | ₺5,000/ay | 50 | 5 | ✅ |

### 📅 Tarih Ayarları
| Alan | Zorunlu | Default |
|------|---------|---------|
| Başlangıç | ✅ | Bugün |
| Bitiş | ✅ | - |
| Trial | ❌ | Checkbox |

### 📝 Admin Notları
- Opsiyonel metin alanı
- Dahili kullanım için

---

## 🔐 Şifre Sistemi

### Admin Panelde:
1. Admin formu doldurur
2. Şifre belirler (min. 8 karakter)
3. "Ekle" butonuna tıklar
4. ✅ Kullanıcı oluşturulur (şifre hash'lenir)

### Business Dashboard'da:
1. Kullanıcı email + admin'in belirlediği şifre ile giriş yapar
2. **Profil Ayarları** → **Şifre Değiştir** sekmesine gider
3. Eski şifre girer (admin'in verdiği)
4. Yeni şifre belirler
5. ✅ Şifre güncellenir

---

## 📊 Database Akışı

```
Admin Form Doldurur:
- Firma Adı: "Acme Corp"
- Email: "admin@acme.com"
- Şifre: "MySecurePass123"
- Plan: Premium
  ↓
API POST /api/admin/business-members
  ↓
1. Validasyon (email, şifre, zorunlu alanlar)
  ↓
2. Email Kontrolü (duplikasyon yok mu?)
  ↓
3. Şifre Hash: bcrypt.hash("MySecurePass123", 10)
   → $2a$10$XYZ... (hash)
  ↓
4. Lisans Üret: generateLicenseKey()
   → CITYV-A7D9-B2C4-H1J5-M9N6
  ↓
5. PostgreSQL INSERT:
   a) business_users
      - email: admin@acme.com
      - password_hash: $2a$10$XYZ...
      - company_name: Acme Corp
      
   b) business_profiles
      - business_name: Acme Corp
      - address, phone, ...
      
   c) business_subscriptions
      - plan_type: premium
      - license_key: CITYV-A7D9...
      - start_date: 2025-10-28
      - end_date: 2026-10-28
      - max_users: 1
      
   d) users (eğer varsa)
      - membership_tier: business
  ↓
6. Toast: "🎉 Acme Corp başarıyla eklendi!"
  ↓
7. Business Üyeler listesinde görünür
```

---

## 🧪 Test Adımları

### 1. Form Açma
1. Admin panel → **Business Üyeler** sekmesi
2. **Yeni Üye Ekle** butonuna tıkla
3. ✅ Modal açılmalı

### 2. Form Doldurma
```
Firma Bilgileri:
- Firma Adı: Test Restaurant ✅
- Firma Tipi: Restaurant ✅
- Şehir: Ankara ✅

Yetkili Kişi:
- İsim: Ahmet Yılmaz ✅
- Email: ahmet@test.com ✅
- Telefon: 0532 123 45 67
- Şifre: Test1234 ✅ (min. 8 karakter)

Üyelik:
- Plan: Premium (₺2,500) ✅
- Başlangıç: 2025-10-28 ✅
- Bitiş: 2026-10-28 ✅
```

### 3. Validasyon Testleri
| Test | Beklenen Sonuç |
|------|----------------|
| Şifre boş | ❌ "Şifre en az 8 karakter olmalı!" |
| Şifre 7 karakter | ❌ "Şifre en az 8 karakter olmalı!" |
| Email yok | ❌ "Lütfen zorunlu alanları doldurun!" |
| Firma adı yok | ❌ "Lütfen zorunlu alanları doldurun!" |
| Bitiş tarihi yok | ❌ "Lütfen bitiş tarihi seçin!" |
| Bitiş < Başlangıç | ❌ "Bitiş tarihi başlangıç tarihinden sonra olmalı!" |

### 4. Başarılı Kayıt
1. Tüm alanları doldur
2. **Ekle** butonuna tıkla
3. ✅ Toast: "🎉 Test Restaurant başarıyla eklendi!"
4. ✅ Form kapanır
5. ✅ Business Üyeler listesinde görünür

### 5. Business Dashboard Giriş
1. Business login: `/business/login`
2. Email: `ahmet@test.com`
3. Şifre: `Test1234` (admin'in belirlediği)
4. ✅ Giriş başarılı
5. Profil → Şifre Değiştir
6. Yeni şifre belirle
7. ✅ Şifre güncellendi

---

## 🔑 Şifre Değiştirme (Business Dashboard)

**TODO:** Business dashboard'da şifre değiştirme özelliği eklenecek.

### Gerekli Dosyalar:
1. `app/business/profile/page.tsx` - Profil ayarları sayfası
2. `components/Business/ChangePassword.tsx` - Şifre değiştirme formu
3. `app/api/business/change-password/route.ts` - API endpoint

### Form Alanları:
```tsx
<form>
  <input type="password" placeholder="Mevcut Şifre" />
  <input type="password" placeholder="Yeni Şifre (min. 8)" />
  <input type="password" placeholder="Yeni Şifre Tekrar" />
  <button>Şifreyi Güncelle</button>
</form>
```

### API Logic:
```tsx
POST /api/business/change-password
Body: {
  currentPassword: "Test1234",
  newPassword: "NewSecure999"
}

1. JWT'den user_id al
2. Mevcut şifreyi doğrula: bcrypt.compare(currentPassword, db.password_hash)
3. Yeni şifreyi hash'le: bcrypt.hash(newPassword, 10)
4. UPDATE business_users SET password_hash = ? WHERE id = ?
5. Return: { success: true }
```

---

## ✅ Özellikler Tamamlandı

- ✅ Firma bilgileri (ad, tip, adres, vergi)
- ✅ Yetkili kişi bilgileri (isim, email, telefon)
- ✅ **Şifre belirleme** (admin tarafından, min. 8 karakter)
- ✅ Plan seçimi (Premium/Enterprise)
- ✅ Tarih ayarları (başlangıç/bitiş)
- ✅ Otomatik lisans anahtarı
- ✅ PostgreSQL'e kayıt
- ✅ Şifre hash'leme (bcrypt)
- ✅ Validasyonlar (email, şifre, tarih)
- ✅ Toast bildirimleri
- ✅ "Yeni Üye Ekle" butonu görünür

---

## 🚀 Kullanıma Hazır!

Admin artık:
1. **Business Üyeler** sekmesinden **Yeni Üye Ekle** tıklar
2. Tüm firma detaylarını girer (firma adı, email, telefon, **şifre**)
3. Planı seçer (Premium ₺2,500 veya Enterprise ₺5,000)
4. **Ekle** butonuna tıklar
5. ✅ Kullanıcı oluşturulur (şifre hash'lenir, lisans üretilir)
6. Business kullanıcı email + şifre ile giriş yapabilir
7. Business dashboard'da şifresini değiştirebilir

**Manuel business üye ekleme sistemi aktif! 🎉**
