// Test email template görüntüsü
// Bu dosya sadece email'in nasıl görüneceğini gösterir

const emailData = {
  companyName: "ÖRNEK FİRMA A.Ş.",
  email: "test@example.com",
  authorizedPerson: "Ahmet Yılmaz",
  password: "SecurePass123!",
  licenseKey: "CITYV-ABC123-DEF456-GHI789-JKL012",
  planType: "premium", // veya "enterprise"
  startDate: new Date().toLocaleDateString('tr-TR'),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'), // 1 yıl sonra
  monthlyPrice: 499, // Premium: 499₺, Enterprise: 999₺
  maxUsers: 10 // Premium: 10, Enterprise: 50
};

console.log(`
📧 EMAIL ÖNIZLEME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KONU: CityV Business - Hoş Geldiniz! 🏙️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 FİRMA BİLGİLERİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Firma Adı       : ${emailData.companyName}
Yetkili Kişi    : ${emailData.authorizedPerson}
Email           : ${emailData.email}
Plan            : ${emailData.planType === 'premium' ? '💎 PREMIUM' : '⭐ ENTERPRISE'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 GİRİŞ BİLGİLERİNİZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email           : ${emailData.email}
Şifre           : ${emailData.password}
Lisans Anahtarı : ${emailData.licenseKey}

⚠️ ÖNEMLI: İlk girişten sonra şifrenizi değiştirmenizi öneririz.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 ABONELİK DETAYLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Başlangıç Tarihi: ${emailData.startDate}
Bitiş Tarihi    : ${emailData.endDate}
Aylık Ücret     : ₺${emailData.monthlyPrice.toLocaleString('tr-TR')}
Max Kamera      : ${emailData.maxUsers} adet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PAKETİNİZDE NELER VAR?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${emailData.planType === 'premium' ? `
✅ 10 Kameraya kadar IoT entegrasyonu
✅ Gerçek zamanlı kalabalık analizi
✅ Push notification kampanyaları
✅ Detaylı analytics ve raporlar
✅ Uzaktan kamera erişimi
✅ 7/24 Teknik destek
` : `
✅ 50 Kameraya kadar IoT entegrasyonu
✅ Gelişmiş AI kalabalık analizi
✅ Sınırsız push notification
✅ Özel analytics dashboardı
✅ API entegrasyonu
✅ Öncelikli 7/24 teknik destek
✅ Özel eğitim ve onboarding
`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 GİRİŞ YAPMAK İÇİN:
https://cityv.vercel.app/business/login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sorularınız için: support@cityv.com
CityV Ekibi 🏙️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

console.log('\n✅ Email bu şekilde gönderilecek!');
console.log('\n📝 NOT: Gerçek email HTML formatında ve daha güzel tasarımlı olacak.');
