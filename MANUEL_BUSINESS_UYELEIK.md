# Manuel Business/Enterprise Üyelik Yönetimi

## 🎯 Sistem Özeti

Admin artık **Users** sekmesinden **herhangi bir kullanıcıyı** tek tıkla Business veya Enterprise üyeliğe yükseltebilir!

---

## 📋 Nasıl Çalışır?

### 1️⃣ **Users Tab - Manuel Üyelik Yönetimi**

Admin panelinde **Users** sekmesine gidin. Her kullanıcı için **4 buton** görürsünüz:

#### **Normal Üyelik Butonları** (Free ↔ Premium)
- `⬆️ Premium` - Kullanıcıyı Free → Premium yapar
- `⬇️ Free` - Kullanıcıyı Premium → Free yapar

#### **Business Üyelik Butonları** (Yeni! 🎉)
- `🏢 Business` - Kullanıcıyı Business üye yapar (₺2,500/ay planı)
- `🏆 Enterprise` - Kullanıcıyı Enterprise üye yapar (₺5,000/ay planı)

---

## 🔧 Business/Enterprise Butonu Kullanımı

### Business Üye Yapma
1. Kullanıcının yanındaki **🏢 Business** butonuna tıklayın
2. Açılan popup'ta **Firma Adı** girin (örn: "Acme Corp")
3. **Yetkili Kişi** adını girin (varsayılan: kullanıcının adı)
4. **Onay** verin

✅ **Otomatik Yapılanlar:**
- Business kullanıcı hesabı oluşturulur
- 1 yıllık lisans oluşturulur (bugünden 365 gün)
- Otomatik lisans anahtarı: `CITYV-XXXX-XXXX-XXXX-XXXX`
- Max kullanıcı: 10 kişi
- Plan tipi: Premium (₺2,500/ay)

### Enterprise Üye Yapma
1. Kullanıcının yanındaki **🏆 Enterprise** butonuna tıklayın
2. Firma bilgilerini girin (aynı popup)
3. **Onay** verin

✅ **Otomatik Yapılanlar:**
- Enterprise kullanıcı hesabı oluşturulur
- 1 yıllık lisans oluşturulur
- Max kullanıcı: 50 kişi
- Plan tipi: Enterprise (₺5,000/ay)

---

## 🗑️ Business Üyelikten Çıkarma

### Business Üyeler Sekmesinden
1. **Business Üyeler** sekmesine geçin
2. Silmek istediğin firmanın yanındaki **🗑️ Üyelikten Çıkar** butonuna tıkla
3. Onay popup'ında **OK** deyin

✅ **Otomatik Yapılanlar:**
- Business subscription deaktif edilir
- Kullanıcı **Free üyeliğe** döner
- Business Üyeler listesinden kaldırılır
- Normal Users listesinde görünür (Free üye olarak)

---

## 📊 Üyelik Seviyeleri Hiyerarşisi

```
🆓 Free              → Temel kullanım
💎 Premium           → Gelişmiş özellikler
🏢 Business Premium  → Firma hesabı + Lisanslama (10 kullanıcı)
🏆 Enterprise        → Kurumsal hesap + Lisanslama (50 kullanıcı)
```

---

## ⚠️ Önemli Notlar

### Business/Enterprise Kontrolü
- Eğer kullanıcı **zaten Business/Enterprise üyeyse**:
  - Business/Enterprise butonları uyarı verir
  - "Business Üyeler sekmesinden yönetin" mesajı gösterir
  - Duplikasyon önlenir

### Lisans Bilgileri (Otomatik)
- **Başlangıç tarihi**: Butonun tıklandığı an
- **Bitiş tarihi**: 1 yıl sonra (365 gün)
- **Lisans anahtarı**: CITYV-XXXXX formatında otomatik
- **Max kullanıcı sayısı**: 
  - Business: 10 kişi
  - Enterprise: 50 kişi

### Email Sistemi
- **Business kullanıcı** ve **normal kullanıcı** aynı email'i kullanır
- Business üyelikten çıkarınca normal users tablosunda Free'ye döner
- Çift kayıt önlenir

---

## 🧪 Test Senaryoları

### Test 1: Free → Business
1. Admin paneli → Users sekmesi
2. Free üye seçin (örn: test@example.com)
3. **🏢 Business** butonuna tıkla
4. Firma: "Test Şirketi", Yetkili: "Test User"
5. ✅ Business Üyeler sekmesinde görünmeli
6. ✅ Lisans anahtarı oluşturulmalı
7. ✅ Durum: Aktif (1 yıl)

### Test 2: Business → Free Dönüş
1. Business Üyeler sekmesi
2. "Test Şirketi" yanındaki **🗑️ Üyelikten Çıkar**
3. Onay ver
4. ✅ Business listesinden kaybolmalı
5. ✅ Users sekmesinde Free üye olarak görünmeli

### Test 3: Aynı Kullanıcıyı İki Kez Business Yapma
1. Kullanıcıyı Business yap
2. Aynı kullanıcıya tekrar **🏢 Business** tıkla
3. ✅ Uyarı almalısın: "Kullanıcı zaten Business/Enterprise üye"

---

## 📂 Dosya Değişiklikleri

### Frontend
**`app/cityvadmin/dashboard/page.tsx`**
- Users tab: 4 buton eklendi (Premium, Free, Business, Enterprise)
- Business tab: "Üyelikten Çıkar" butonu eklendi
- İşlemler kolonu tabloya eklendi

### Backend
**`app/api/admin/business-members/route.ts`**
- `DELETE` endpoint eklendi
- Business üyelik iptali + Free'ye dönüş mantığı

---

## 🎨 UI Özellikleri

### Buton Renkleri
- **⬆️ Premium** - Yeşil (`bg-green-500`)
- **⬇️ Free** - Turuncu (`bg-orange-500`)
- **🏢 Business** - Mavi (`bg-blue-600`)
- **🏆 Enterprise** - Mor (`bg-purple-600`)
- **🗑️ Üyelikten Çıkar** - Kırmızı (`bg-red-500`)

### Tooltip'ler
Her butonun üzerine gelince açıklama gösterir:
- "Free → Premium"
- "Premium → Free"
- "Business üye yap"
- "Enterprise üye yap"
- "Business üyelikten çıkar"

---

## ✅ Özellikler Tamamlandı

- ✅ Users tab'a Business/Enterprise ekle butonları
- ✅ Prompt ile hızlı firma bilgisi alma
- ✅ Otomatik lisans anahtarı üretimi
- ✅ 1 yıllık otomatik tarih ayarı
- ✅ Business Üyeler sekmesinde "Üyelikten Çıkar" butonu
- ✅ Üyelik iptali → Free'ye otomatik dönüş
- ✅ Duplikasyon kontrolü (aynı kullanıcıyı 2 kez business yapamama)
- ✅ Email kontrolü (aynı email'de çift kayıt yok)
- ✅ DELETE API endpoint
- ✅ Toast bildirimler (başarı/hata mesajları)

---

## 🚀 Kullanıma Hazır!

Artık admin:
1. **Users sekmesinde** → Anında Business/Enterprise üye ekleyebilir
2. **Business Üyeler sekmesinde** → Üyelikleri iptal edebilir
3. Tüm işlemler **tek tıkla** ve **otomatik tarih/lisans** ile!

**Manuel business üyelik yönetimi aktif! 🎉**
