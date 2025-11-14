# 🚀 Otomatik GitHub → Vercel Deployment

## Nasıl Çalışıyor?

```
📱 Herhangi bir cihaz (Mobile/PC/Tablet)
    ↓
💾 Değişiklik yaptın (örn: kalibrasyon)
    ↓
📤 Git commit + push
    ↓
🐙 GitHub'a gitti
    ↓
⚙️ GitHub Actions tetiklendi (otomatik)
    ↓
🔨 Build başladı
    ↓
🚀 Vercel'e deploy oldu
    ↓
✅ https://city-v-kopya-3.vercel.app/api CANLI!
```

**Süre:** ~2-3 dakika (commit'ten production'a)

---

## 🎯 Kurulum (Tek Seferlik)

### Adım 1: GitHub Secrets Ekle

GitHub repo → Settings → Secrets and variables → Actions → New repository secret

**Eklenecek secrets:**

```bash
# 1. Vercel Token (https://vercel.com/account/tokens)
VERCEL_TOKEN=your_token_here

# 2. Vercel Org ID
VERCEL_ORG_ID=team_xxxxxxxxxxxxx

# 3. Vercel Project ID
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx

# 4. Database URL
DATABASE_URL=postgresql://user:pass@host/db

# 5. Google Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### Adım 2: Vercel Project ID Bul

```powershell
# Terminal'de:
cd "c:\Users\ercan\OneDrive\Masaüstü\Proje Cityv\city-v - Kopya (3) - Kopya_DashboardRaf"
npx vercel link

# Vercel'e login ol
# Project seç: city-v-kopya-3
# .vercel/project.json oluşacak
```

```powershell
# Project ID'yi göster:
cat .vercel/project.json
```

Output:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

Bu değerleri GitHub Secrets'a ekle!

---

## 🔄 Kullanım Senaryoları

### Senaryo 1: Mobilde Değişiklik → Otomatik Deploy

```bash
# 📱 iPhone Safari'de
# Business Dashboard → Kamera ekle → Kalibrasyon yap

# ✅ Değişiklikler PostgreSQL'e kaydedildi

# Şimdi GitHub'a push et:
git add .
git commit -m "feat: mobil kalibrasyon eklendi"
git push origin main

# ⏳ GitHub Actions başladı (otomatik)
# 🔨 Build çalışıyor...
# 🚀 Vercel'e deploy ediliyor...
# ✅ 2 dakika sonra: https://city-v-kopya-3.vercel.app CANLI!

# 💻 Desktop Chrome'da
# Sayfayı yenile → Mobilde yaptığın değişiklikler görünür!
```

### Senaryo 2: Desktop'ta Kod Değişikliği → Otomatik Deploy

```bash
# 💻 VS Code'da yeni component ekledin:
# components/Business/NewFeature.tsx

git add components/Business/NewFeature.tsx
git commit -m "feat: yeni özellik eklendi"
git push origin main

# ⚙️ GitHub Actions otomatik başladı
# 🧪 Build test ediliyor
# ✅ Test geçti → Vercel'e deploy
# 🌐 Production'da CANLI!

# 📱 Mobilde aç → Yeni özellik çalışıyor!
```

### Senaryo 3: Tablet'te Database Değişikliği → Otomatik Sync

```bash
# 📲 iPad'den
# Business Dashboard → Menü ekle → Ürün ekle

# PostgreSQL'e yazıldı:
INSERT INTO business_menu_items (name, price) VALUES ('Kahve', 45);

# Kod değişikliği yok, sadece data değişti
# GitHub Actions'a gerek YOK!

# 💻 Desktop'ta refresh → Yeni ürün görünür!
# (Database zaten merkezi, Vercel production kullanıyor)
```

---

## ⚡ Hızlı Komutlar

### Mobil/Tablet'ten Push (Git GUI App ile)

**iOS (Working Copy app):**
```
1. Open Working Copy app
2. Select "city-v" repo
3. Tap "+" → Commit
4. Message: "feat: mobil değişiklik"
5. Tap "Push"
```

**Android (Termux):**
```bash
cd ~/city-v
git add .
git commit -m "feat: mobil değişiklik"
git push
```

### Desktop'tan Push (VS Code)

```powershell
# Ctrl+` (Terminal aç)
git add .
git commit -m "feat: yeni özellik"
git push

# VEYA VS Code UI:
# Ctrl+Shift+G → Source Control
# "+" (Stage All)
# Message yaz → Ctrl+Enter
# "..." → Push
```

### Herhangi Bir Cihazdan (Browser GitHub)

```
1. GitHub.com → city-v repo
2. Dosya seç → Edit (kalem ikonu)
3. Değişiklik yap
4. "Commit changes" → Commit
5. ✅ Otomatik deploy başladı!
```

---

## 📊 Deployment Durumu Takibi

### GitHub Actions Dashboard

```
https://github.com/ercanerguler-design/city-v/actions

Son commit'in durumunu gör:
🟡 Sarı nokta: Build çalışıyor (1-2 dk)
🟢 Yeşil tick: Deploy başarılı!
🔴 Kırmızı X: Hata var (loglara bak)
```

### Vercel Dashboard

```
https://vercel.com/ercanerguler-design/city-v-kopya-3

Son deployment:
- Status: Ready ✅
- URL: https://city-v-kopya-3.vercel.app
- Build Time: 1m 23s
- Region: Frankfurt (fra1)
```

### Real-time Bildirim (Opsiyonel)

GitHub → Settings → Notifications → Actions
- ✅ Email notification on: "Only failures"
- Başarılı build'ler sessiz geçer
- Hata olursa email gelir

---

## 🛠️ Troubleshooting

### ❌ Build Failed: "Module not found"

```bash
# GitHub Actions log:
Error: Cannot find module '@tensorflow/tfjs'

# Çözüm:
# package.json'a ekle:
npm install --legacy-peer-deps @tensorflow/tfjs
git add package.json package-lock.json
git commit -m "fix: tensorflow dependency"
git push
```

### ❌ Vercel Deploy Failed: "Environment variable missing"

```bash
# GitHub Actions log:
Error: DATABASE_URL is not defined

# Çözüm:
# GitHub repo → Settings → Secrets
# Ekle: DATABASE_URL = postgresql://...
# Yeniden push yap (veya Actions'da "Re-run jobs")
```

### ❌ Git Push Failed: "Authentication failed"

```bash
# Mobil/tablet'ten push ederken:
error: Authentication required

# Çözüm:
# GitHub Personal Access Token oluştur:
# https://github.com/settings/tokens
# Select scopes: repo, workflow
# Token'ı kopyala

# Git config:
git remote set-url origin https://YOUR_TOKEN@github.com/ercanerguler-design/city-v.git
git push
```

---

## 📱 Cihaz Bazlı Workflow

### iPhone/iPad (iOS)

**App: Working Copy (Git client)**
```
1. App Store'dan indir: Working Copy
2. GitHub hesabını bağla
3. city-v repo'sunu clone et
4. Değişiklik yap (örn: README düzenle)
5. Commit → Push
6. ✅ Otomatik deploy!
```

**Browser (Safari):**
```
1. github.com/ercanerguler-design/city-v
2. Dosya seç → Edit
3. Değişiklik → Commit
4. ✅ Otomatik deploy!
```

### Android (Tablet/Phone)

**App: Termux**
```bash
# Termux'u aç
pkg install git nodejs
cd ~
git clone https://github.com/ercanerguler-design/city-v.git
cd city-v

# Değişiklik yap
nano README.md  # veya Vim

# Push
git add .
git commit -m "feat: android'den güncelleme"
git push

# ✅ GitHub Actions tetiklendi!
```

### Windows/Mac/Linux Desktop

**VS Code:**
```powershell
# Terminal:
git add .
git commit -m "feat: desktop değişiklik"
git push

# VEYA GUI:
Ctrl+Shift+G → Stage → Commit → Push
```

---

## 🎯 Production Checklist

### Deployment Öncesi

- [ ] `npm run build` local'de çalışıyor mu?
- [ ] `.env.local` secrets GitHub'a eklendi mi?
- [ ] Vercel project link yapıldı mı?
- [ ] GitHub Actions workflow dosyası commit edildi mi?

### Deployment Sonrası

- [ ] GitHub Actions: ✅ Yeşil tick
- [ ] Vercel: Status "Ready"
- [ ] Production URL açılıyor mu?
- [ ] Database bağlantısı çalışıyor mu?
- [ ] Google OAuth redirect URI güncel mi?

---

## 🚀 Sonuç: Tam Otomatik Sistem

```
┌─────────────────────────────────────────────┐
│  HERHANGI BİR CİHAZ                         │
│  📱 Mobile / 💻 Desktop / 📲 Tablet        │
└────────────────┬────────────────────────────┘
                 │
                 │ git push
                 ↓
┌─────────────────────────────────────────────┐
│  🐙 GITHUB                                  │
│  - Kod saklanır                             │
│  - Actions tetiklenir (otomatik)           │
└────────────────┬────────────────────────────┘
                 │
                 │ workflow çalışır
                 ↓
┌─────────────────────────────────────────────┐
│  ⚙️ GITHUB ACTIONS                         │
│  1. npm install --legacy-peer-deps         │
│  2. npm run build                          │
│  3. vercel deploy --prod                   │
└────────────────┬────────────────────────────┘
                 │
                 │ deploy
                 ↓
┌─────────────────────────────────────────────┐
│  🚀 VERCEL PRODUCTION                      │
│  https://city-v-kopya-3.vercel.app         │
│  - Next.js app çalışıyor                   │
│  - PostgreSQL bağlı                        │
│  - Global CDN                              │
└─────────────────────────────────────────────┘
```

**Süre:** Commit'ten production'a **2-3 dakika**

**Manuel iş:** Sadece `git push` (tek komut!)

**Otomatik:** Build, test, deploy, DNS update - HER ŞEY! 🎯🔥

---

## 💡 Pro Tips

1. **Branch Strategy:**
   ```bash
   # Development için:
   git checkout -b dev
   git push origin dev
   # → https://city-v-kopya-3-dev.vercel.app (preview)
   
   # Production için:
   git checkout main
   git merge dev
   git push origin main
   # → https://city-v-kopya-3.vercel.app (production)
   ```

2. **Instant Rollback:**
   ```
   Vercel Dashboard → Deployments
   → Önceki version seç → "Promote to Production"
   → 10 saniyede eski versiyona dön!
   ```

3. **Preview URLs:**
   ```
   Her commit otomatik preview URL alır:
   - PR açarsan: https://city-v-kopya-3-pr-123.vercel.app
   - Branch push: https://city-v-kopya-3-git-dev.vercel.app
   - Test et → Main'e merge → Production!
   ```

**Artık herhangi bir cihazdan push edince otomatik CANLI! 🚀✨**
