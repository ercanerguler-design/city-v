# Vercel Environment Variable Update Script
# RESEND_API_KEY'i eski değere güncelle

Write-Host "🔧 Vercel RESEND_API_KEY güncelleniyor..." -ForegroundColor Cyan
Write-Host ""

# 1. Mevcut değeri göster
Write-Host "📋 Mevcut environment variables:" -ForegroundColor Yellow
vercel env ls

Write-Host ""
Write-Host "⚠️  UYARI: RESEND_API_KEY silinecek ve yenisi eklenecek!" -ForegroundColor Red
Write-Host "📧 Yeni değer: re_cCquoo3C_2KkNeVyQjEgAB2hcREQsaLhC" -ForegroundColor Green
Write-Host ""

$confirmation = Read-Host "Devam etmek istiyor musunuz? (y/N)"

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host ""
    Write-Host "🗑️  Eski RESEND_API_KEY siliniyor..." -ForegroundColor Yellow
    
    # Note: Vercel CLI'da env rm komutu environment belirtmeden çalışmıyor
    # Bu yüzden manuel dashboard'dan yapılmalı veya interactive mode kullanılmalı
    
    Write-Host ""
    Write-Host "❌ CLI ile silme işlemi interactive mode gerektiriyor." -ForegroundColor Red
    Write-Host ""
    Write-Host "✅ ÇÖZÜM: Vercel Dashboard'dan yapın:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. https://vercel.com/ercanergulers-projects/cityv/settings/environment-variables" -ForegroundColor Cyan
    Write-Host "2. RESEND_API_KEY satırını bulun" -ForegroundColor White
    Write-Host "3. Sağdaki '...' menüsünden 'Delete' seçin" -ForegroundColor White
    Write-Host "4. 'Add New' butonuna tıklayın" -ForegroundColor White
    Write-Host "5. Key: RESEND_API_KEY" -ForegroundColor White
    Write-Host "6. Value: re_cCquoo3C_2KkNeVyQjEgAB2hcREQsaLhC" -ForegroundColor White
    Write-Host "7. Environment: Production seçin" -ForegroundColor White
    Write-Host "8. Save butonuna tıklayın" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Ya da kopyala-yapıştır için:" -ForegroundColor Yellow
    Write-Host "re_cCquoo3C_2KkNeVyQjEgAB2hcREQsaLhC" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "❌ İşlem iptal edildi." -ForegroundColor Red
}
