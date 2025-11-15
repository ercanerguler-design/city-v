import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Build sırasında RESEND_API_KEY yoksa hata vermesin
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email ve isim gerekli' },
        { status: 400 }
      );
    }

    // RESEND_API_KEY yoksa email gönderme, sadece log
    if (!resend) {
      console.log('⚠️ RESEND_API_KEY tanımlı değil. Email gönderilmedi:', { email, name });
      return NextResponse.json({ 
        success: true, 
        message: 'Email sistemi şu anda devre dışı' 
      });
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>City-V'ye Hoş Geldiniz!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="background: white; width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <span style="font-size: 36px; font-weight: bold; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🗺️</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">City-V'ye Hoş Geldiniz!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">AI Destekli Kalabalık Analizi Platformu</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #2d3748; font-size: 24px; margin: 0 0 20px;">Merhaba ${name}! 👋</h2>
      
      <p style="color: #4a5568; line-height: 1.8; margin: 0 0 20px; font-size: 16px;">
        City-V ailesine katıldığınız için çok mutluyuz! Artık Türkiye'nin en gelişmiş kalabalık analizi ve şehir navigasyon platformunu kullanmaya başlayabilirsiniz.
      </p>

      <!-- Features -->
      <div style="background: linear-gradient(135deg, #f0f4f8, #e2e8f0); border-radius: 12px; padding: 25px; margin: 30px 0;">
        <h3 style="color: #2d3748; margin: 0 0 20px; font-size: 18px; font-weight: 600;">✨ Neler Yapabilirsiniz?</h3>
        
        <div style="margin-bottom: 15px;">
          <div style="display: flex; align-items: start; margin-bottom: 12px;">
            <span style="font-size: 24px; margin-right: 12px;">🗺️</span>
            <div>
              <strong style="color: #667eea; font-size: 15px;">Canlı Kalabalık Haritası</strong>
              <p style="color: #4a5568; margin: 5px 0 0; font-size: 14px; line-height: 1.6;">Mekanların anlık kalabalık durumunu görün, yoğunluktan kaçının</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="display: flex; align-items: start; margin-bottom: 12px;">
            <span style="font-size: 24px; margin-right: 12px;">🤖</span>
            <div>
              <strong style="color: #667eea; font-size: 15px;">AI Tahmin Sistemi</strong>
              <p style="color: #4a5568; margin: 5px 0 0; font-size: 14px; line-height: 1.6;">Yapay zeka ile gelecekteki yoğunluk tahminleri alın</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="display: flex; align-items: start; margin-bottom: 12px;">
            <span style="font-size: 24px; margin-right: 12px;">💬</span>
            <div>
              <strong style="color: #667eea; font-size: 15px;">Topluluk Yorumları</strong>
              <p style="color: #4a5568; margin: 5px 0 0; font-size: 14px; line-height: 1.6;">Mekanlar hakkında yorum yapın ve duygu bildirimi paylaşın</p>
            </div>
          </div>
        </div>

        <div>
          <div style="display: flex; align-items: start;">
            <span style="font-size: 24px; margin-right: 12px;">📊</span>
            <div>
              <strong style="color: #667eea; font-size: 15px;">Detaylı Analitik</strong>
              <p style="color: #4a5568; margin: 5px 0 0; font-size: 14px; line-height: 1.6;">Mekan istatistikleri, peak saatler ve trend analizi</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Credits Info -->
      <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; color: #92400e; font-size: 15px;">
          <strong>🎁 Hoşgeldin Hediyesi:</strong> Hesabınıza <strong>100 AI Kredi</strong> tanımlandı! Bu kredilerle AI Chat, tahmin sistemi ve premium özellikleri kullanabilirsiniz.
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0 25px;">
        <a href="https://cityv.app" style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s;">
          🚀 Hemen Keşfet
        </a>
      </div>

      <p style="color: #718096; font-size: 14px; line-height: 1.7; margin: 25px 0 0; text-align: center;">
        Sorularınız için <a href="mailto:support@cityv.app" style="color: #667eea; text-decoration: none;">support@cityv.app</a> adresinden bize ulaşabilirsiniz.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f7fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #a0aec0; font-size: 13px; margin: 0 0 10px;">
        © 2024 City-V. Tüm hakları saklıdır.
      </p>
      <p style="color: #cbd5e0; font-size: 12px; margin: 0;">
        Ankara, Türkiye | AI Powered Crowd Analysis
      </p>
    </div>

  </div>
</body>
</html>
    `;

    // Send email via Resend
    const data = await resend.emails.send({
      from: 'City-V <onboarding@cityv.app>',
      to: [email],
      subject: '🎉 City-V\'ye Hoş Geldiniz - Hesabınız Aktif!',
      html: htmlContent,
    });

    console.log('✅ Welcome email sent:', data);

    return NextResponse.json({
      success: true,
      messageId: data.id
    });

  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return NextResponse.json(
      { error: 'Email gönderilemedi', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
