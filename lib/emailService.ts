// Email service using Resend API
// Sends welcome emails to new business members

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface BusinessWelcomeEmailData {
  companyName: string;
  email: string;
  authorizedPerson: string;
  password: string; // Admin tarafından belirlenen şifre
  licenseKey: string;
  planType: string;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  maxUsers: number;
}

export async function sendBusinessWelcomeEmail(data: BusinessWelcomeEmailData) {
  try {
    // If Resend is not configured, skip email sending
    if (!resend) {
      console.warn('⚠️ Resend not configured, skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const { 
      companyName, 
      email, 
      authorizedPerson, 
      password,
      licenseKey, 
      planType, 
      startDate, 
      endDate,
      monthlyPrice,
      maxUsers 
    } = data;

    const planName = planType === 'enterprise' ? 'Enterprise' : 'Premium';
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CityV Business - Hoş Geldiniz</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .welcome {
      font-size: 24px;
      color: #1a1a1a;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #555;
    }
    .value {
      color: #1a1a1a;
      font-weight: 500;
    }
    .credentials {
      background: #fff9e6;
      border: 2px solid #ffd700;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .credentials h3 {
      margin-top: 0;
      color: #d97706;
    }
    .credential-item {
      background: white;
      padding: 12px;
      margin: 10px 0;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
    .plan-badge {
      display: inline-block;
      background: ${planType === 'enterprise' ? '#9333ea' : '#3b82f6'};
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🏙️ CityV</div>
      <h1 class="welcome">Hoş Geldiniz!</h1>
      <p class="subtitle">Business hesabınız başarıyla oluşturuldu</p>
    </div>

    <!-- Company Info -->
    <div class="info-box">
      <h3 style="margin-top: 0;">🏢 Firma Bilgileri</h3>
      <div class="info-row">
        <span class="label">Firma Adı:</span>
        <span class="value">${companyName}</span>
      </div>
      <div class="info-row">
        <span class="label">Yetkili Kişi:</span>
        <span class="value">${authorizedPerson}</span>
      </div>
      <div class="info-row">
        <span class="label">Email:</span>
        <span class="value">${email}</span>
      </div>
      <div class="info-row">
        <span class="label">Plan:</span>
        <span class="value"><span class="plan-badge">${planName}</span></span>
      </div>
    </div>

    <!-- Login Credentials -->
    <div class="credentials">
      <h3>🔐 Giriş Bilgileriniz</h3>
      <p style="margin-bottom: 15px;">Aşağıdaki bilgilerle Business Dashboard'a giriş yapabilirsiniz:</p>
      
      <div class="credential-item">
        <strong>Email:</strong> ${email}
      </div>
      <div class="credential-item">
        <strong>Şifre:</strong> ${password}
      </div>
      <div class="credential-item">
        <strong>Lisans Anahtarı:</strong> ${licenseKey}
      </div>
      
      <p style="color: #d97706; margin-top: 15px; font-size: 13px;">
        ⚠️ <strong>Önemli:</strong> İlk girişten sonra şifrenizi değiştirmenizi öneririz.
      </p>
    </div>

    <!-- Subscription Details -->
    <div class="info-box">
      <h3 style="margin-top: 0;">💳 Abonelik Detayları</h3>
      <div class="info-row">
        <span class="label">Başlangıç Tarihi:</span>
        <span class="value">${new Date(startDate).toLocaleDateString('tr-TR')}</span>
      </div>
      <div class="info-row">
        <span class="label">Bitiş Tarihi:</span>
        <span class="value">${new Date(endDate).toLocaleDateString('tr-TR')}</span>
      </div>
      <div class="info-row">
        <span class="label">Aylık Ücret:</span>
        <span class="value">₺${monthlyPrice.toLocaleString('tr-TR')}</span>
      </div>
      <div class="info-row">
        <span class="label">Max Kullanıcı:</span>
        <span class="value">${maxUsers} kişi</span>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center;">
      <a href="${loginUrl}/business/login" class="button">
        🚀 Hemen Giriş Yap
      </a>
    </div>

    <!-- Features -->
    <div style="margin-top: 30px;">
      <h3>📋 Paketinizde Neler Var?</h3>
      <ul style="color: #555;">
        ${planType === 'enterprise' ? `
        <li>✅ 50 Kameraya kadar IoT entegrasyonu</li>
        <li>✅ Gelişmiş AI analitik</li>
        <li>✅ Sınırsız kampanya oluşturma</li>
        <li>✅ Push notification sistemi</li>
        <li>✅ Öncelikli destek</li>
        <li>✅ API erişimi</li>
        ` : `
        <li>✅ 10 Kameraya kadar IoT entegrasyonu</li>
        <li>✅ Temel AI analitik</li>
        <li>✅ Kampanya yönetimi</li>
        <li>✅ Push notification sistemi</li>
        <li>✅ Email destek</li>
        `}
      </ul>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Bu email otomatik olarak gönderilmiştir.</p>
      <p>Sorularınız için: <a href="mailto:support@cityv.com">support@cityv.com</a></p>
      <p style="margin-top: 15px;">© 2025 CityV - AI Crowd Analysis Platform</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: 'CityV Business <business@cityv.com>', // Resend'de doğrulanmış domain gerekli
      to: [email],
      subject: `🎉 Hoş Geldiniz ${companyName} - CityV Business Hesabınız Hazır`,
      html: emailHtml,
    });

    console.log('✅ Welcome email sent:', result);
    return { success: true, messageId: result.data?.id };
    
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
