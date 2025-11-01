# 🚀 Otomatik Deployment Kurulum Script

# Renkli output için
$Host.UI.RawUI.ForegroundColor = "Cyan"

Write-Host "=================================="
Write-Host "🚀 CityV Otomatik Deployment Setup"
Write-Host "=================================="
Write-Host ""

# 1. Vercel Project ID'yi al
Write-Host "📦 Vercel project bilgileri alınıyor..." -ForegroundColor Yellow

if (Test-Path ".vercel\project.json") {
    $projectInfo = Get-Content ".vercel\project.json" | ConvertFrom-Json
    $orgId = $projectInfo.orgId
    $projectId = $projectInfo.projectId
    
    Write-Host "✅ Project ID bulundu:" -ForegroundColor Green
    Write-Host "   Org ID: $orgId" -ForegroundColor White
    Write-Host "   Project ID: $projectId" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ .vercel\project.json bulunamadı!" -ForegroundColor Red
    Write-Host "   Önce 'npx vercel link' komutunu çalıştır!" -ForegroundColor Yellow
    exit 1
}

# 2. GitHub Secrets için talimatlar
Write-Host "=================================="
Write-Host "📋 GitHub Secrets Kurulum Adımları"
Write-Host "=================================="
Write-Host ""

Write-Host "1️⃣  GitHub'a git:" -ForegroundColor Cyan
Write-Host "   https://github.com/ercanerguler-design/city-v/settings/secrets/actions" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  'New repository secret' butonuna tıkla" -ForegroundColor Cyan
Write-Host ""

Write-Host "3️⃣  Aşağıdaki secret'ları ekle:" -ForegroundColor Cyan
Write-Host ""

# VERCEL_ORG_ID
Write-Host "Secret Name: VERCEL_ORG_ID" -ForegroundColor Yellow
Write-Host "Value: $orgId" -ForegroundColor White
Write-Host ""

# VERCEL_PROJECT_ID
Write-Host "Secret Name: VERCEL_PROJECT_ID" -ForegroundColor Yellow
Write-Host "Value: $projectId" -ForegroundColor White
Write-Host ""

# VERCEL_TOKEN
Write-Host "Secret Name: VERCEL_TOKEN" -ForegroundColor Yellow
Write-Host "Value: Vercel'den token al:" -ForegroundColor White
Write-Host "   → https://vercel.com/account/tokens" -ForegroundColor Gray
Write-Host "   → 'Create Token' → Scope: Full Account" -ForegroundColor Gray
Write-Host "   → Token'ı kopyala ve yapıştır" -ForegroundColor Gray
Write-Host ""

# DATABASE_URL
Write-Host "Secret Name: DATABASE_URL" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "DATABASE_URL=(.+)") {
        $dbUrl = $matches[1].Trim()
        Write-Host "Value: $dbUrl" -ForegroundColor White
        Write-Host "   (⚠️  .env.local'den alındı, Vercel'deki ile aynı mı kontrol et!)" -ForegroundColor Gray
    } else {
        Write-Host "Value: [.env.local'de bulunamadı - Vercel'den kopyala]" -ForegroundColor Red
    }
} else {
    Write-Host "Value: [Vercel dashboard'dan kopyala]" -ForegroundColor Red
}
Write-Host ""

# NEXT_PUBLIC_GOOGLE_CLIENT_ID
Write-Host "Secret Name: NEXT_PUBLIC_GOOGLE_CLIENT_ID" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_GOOGLE_CLIENT_ID=(.+)") {
        $googleId = $matches[1].Trim()
        Write-Host "Value: $googleId" -ForegroundColor White
    } else {
        Write-Host "Value: [.env.local'de bulunamadı]" -ForegroundColor Red
    }
} else {
    Write-Host "Value: [.env.local'de bulunamadı]" -ForegroundColor Red
}
Write-Host ""

# 4. Test commit
Write-Host "=================================="
Write-Host "4️⃣  Test Commit"
Write-Host "=================================="
Write-Host ""

Write-Host "GitHub Actions workflow'u test etmek için:" -ForegroundColor Cyan
Write-Host "git add .github/workflows/deploy.yml" -ForegroundColor White
Write-Host "git commit -m 'feat: otomatik deployment eklendi'" -ForegroundColor White
Write-Host "git push origin main" -ForegroundColor White
Write-Host ""

Write-Host "✅ Push'tan sonra GitHub Actions'da kontrol et:" -ForegroundColor Green
Write-Host "   https://github.com/ercanerguler-design/city-v/actions" -ForegroundColor White
Write-Host ""

# 5. Vercel Production URL
Write-Host "=================================="
Write-Host "🌐 Production URL"
Write-Host "=================================="
Write-Host ""

Write-Host "Deploy tamamlandığında buradan erişebilirsin:" -ForegroundColor Cyan
Write-Host "https://city-v-kopya-3.vercel.app" -ForegroundColor Green
Write-Host "https://city-v-kopya-3.vercel.app/api" -ForegroundColor Green
Write-Host ""

# Özet
Write-Host "=================================="
Write-Host "📝 Özet"
Write-Host "=================================="
Write-Host ""
Write-Host "✅ Vercel project linked" -ForegroundColor Green
Write-Host "✅ GitHub Actions workflow oluşturuldu" -ForegroundColor Green
Write-Host "⏳ GitHub Secrets eklenmesi gerekiyor (manuel)" -ForegroundColor Yellow
Write-Host "⏳ Test commit push'lanmalı" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Secrets eklendikten sonra:" -ForegroundColor Cyan
Write-Host "   Her 'git push' otomatik olarak Vercel'e deploy eder!" -ForegroundColor White
Write-Host "   Süre: ~2-3 dakika" -ForegroundColor White
Write-Host ""

# Clipboard'a kopyala (opsiyonel)
Write-Host "=================================="
Write-Host "📋 Clipboard'a Kopyalandı"
Write-Host "=================================="
Write-Host ""

$clipboardText = @"
VERCEL_ORG_ID=$orgId
VERCEL_PROJECT_ID=$projectId
DATABASE_URL=[Vercel'den al]
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[.env.local'den al]
VERCEL_TOKEN=[https://vercel.com/account/tokens'den oluştur]
"@

Set-Clipboard -Value $clipboardText

Write-Host "✅ GitHub Secrets değerleri clipboard'a kopyalandı!" -ForegroundColor Green
Write-Host "   GitHub'da secret eklerken Ctrl+V ile yapıştırabilirsin" -ForegroundColor Gray
Write-Host ""

Write-Host "=================================="
Write-Host "Kurulum tamamlandı! 🎯"
Write-Host "=================================="

$Host.UI.RawUI.ForegroundColor = "White"
