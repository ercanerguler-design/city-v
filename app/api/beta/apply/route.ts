import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend client oluştur (optional - production'da gerekli)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Beta başvuru interface'i
interface BetaApplication {
  // Step 1: İşletme Bilgileri
  businessName: string;
  businessType: string;
  location: string;
  ownerName: string;
  
  // Step 2: İletişim
  email: string;
  phone: string;
  website?: string;
  
  // Step 3: İstatistikler
  averageDaily: string;
  openingHours: string;
  currentSolution: string;
  
  // Step 4: Beklentiler
  goals: string[];
  heardFrom: string;
  additionalInfo?: string;
}

// Email template fonksiyonu
function generateEmailHTML(data: BetaApplication, applicationId: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .info-box {
          background: white;
          padding: 20px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .highlight {
          background: #e7f3ff;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Yeni Beta Başvurusu!</h1>
        <p style="margin: 0; opacity: 0.9;">City-V Business Box Beta Programı</p>
      </div>
      
      <div class="content">
        <div class="highlight">
          <h2 style="margin-top: 0;">📋 Başvuru Özeti</h2>
          <p><strong>Başvuru No:</strong> ${applicationId}</p>
          <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
        </div>

        <div class="info-box" style="background: linear-gradient(135deg, #e7f3ff 0%, #fff5e7 100%); border-left: 4px solid #f59e0b;">
          <h3 style="color: #f59e0b; margin-top: 0;">⚡ HEMEN İLETİŞİME GEÇ</h3>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p style="margin: 5px 0;"><strong>👤 Yetkili:</strong> <span style="font-size: 18px; color: #1e40af;">${data.ownerName}</span></p>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> <a href="mailto:${data.email}" style="font-size: 18px; color: #059669; text-decoration: none; font-weight: bold;">${data.email}</a></p>
            <p style="margin: 5px 0;"><strong>📱 Telefon:</strong> <a href="tel:${data.phone}" style="font-size: 18px; color: #dc2626; text-decoration: none; font-weight: bold;">${data.phone}</a></p>
            ${data.website ? `<p style="margin: 5px 0;"><strong>🌐 Website:</strong> <a href="${data.website}" target="_blank" style="color: #7c3aed;">${data.website}</a></p>` : ''}
          </div>
          <div style="text-align: center; margin-top: 15px;">
            <a href="mailto:${data.email}?subject=City-V Beta Programı - ${data.businessName}&body=Merhaba ${data.ownerName},%0D%0A%0D%0ACity-V Business Box Beta başvurunuz için teşekkür ederiz..." 
               style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              📧 Hemen Email Gönder
            </a>
          </div>
        </div>

        <div class="info-box">
          <h3>🏢 İşletme Bilgileri</h3>
          <p><strong>İşletme Adı:</strong> ${data.businessName}</p>
          <p><strong>İşletme Tipi:</strong> ${data.businessType}</p>
          <p><strong>Lokasyon:</strong> ${data.location}</p>
        </div>

        <div class="info-box">
          <h3>📊 İşletme İstatistikleri</h3>
          <p><strong>Günlük Müşteri:</strong> ${data.averageDaily}</p>
          <p><strong>Çalışma Saatleri:</strong> ${data.openingHours}</p>
          <p><strong>Mevcut Çözüm:</strong> ${data.currentSolution}</p>
        </div>

        <div class="info-box">
          <h3>🎯 Hedefler ve Beklentiler</h3>
          <p><strong>Hedefler:</strong></p>
          <ul>
            ${data.goals.map(goal => `<li>${goal}</li>`).join('')}
          </ul>
          <p><strong>Nereden Duydunuz:</strong> ${data.heardFrom}</p>
          ${data.additionalInfo ? `<p><strong>Ek Bilgi:</strong> ${data.additionalInfo}</p>` : ''}
        </div>

        <div class="highlight">
          <h3>💰 Beta Avantajları (₺4,484 değerinde)</h3>
          <ul>
            <li>✅ 1x City-V Business Box (₺2,990)</li>
            <li>✅ 3 Ay Ücretsiz Premium (₺597)</li>
            <li>✅ 9 Ay %50 İndirim (₺897 tasarruf)</li>
          </ul>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h3 style="margin-top: 0; text-align: center;">📞 İletişim Bilgileri Özeti</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>👤 Yetkili</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${data.ownerName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>🏢 İşletme</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${data.businessName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>📧 Email</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;"><a href="mailto:${data.email}">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>📱 Telefon</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;"><a href="tel:${data.phone}">${data.phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px;"><strong>📍 Lokasyon</strong></td>
              <td style="padding: 10px; text-align: right;">${data.location}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${data.email}?subject=City-V Beta Programı - ${data.businessName}" class="button">
            📧 ${data.ownerName} ile İletişime Geç
          </a>
        </div>
      </div>

      <div class="footer">
        <p>City-V Business Box Beta Programı © 2025</p>
        <p>Bu mail otomatik olarak oluşturulmuştur.</p>
      </div>
    </body>
    </html>
  `;
}

// Admin email (environment variable veya default)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sce@scegrup.com';

// Email gönderme fonksiyonu
async function sendEmail(to: string, subject: string, html: string) {
  try {
    // RESEND_API_KEY yoksa console'a yazdır (development mode)
    if (!resend || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.log('\n====================================');
      console.log('📧 EMAIL (DEV MODE - Console)');
      console.log('====================================');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('====================================');
      console.log('HTML Preview:', html.substring(0, 200) + '...');
      console.log('====================================\n');
      
      return { success: true, message: 'Email logged to console (dev mode - API key not configured)' };
    }
    
    // Resend ile gerçek email gönder
    console.log('🔧 Resend email.send çağrılıyor...');
    console.log('📤 From: City-V Beta <onboarding@resend.dev>');
    console.log('📥 To:', to);
    console.log('📋 Subject:', subject);
    
    const { data, error } = await resend.emails.send({
      from: 'City-V Beta <onboarding@resend.dev>', // resend.dev domain ücretsiz kullanılabilir
      to: [to],
      subject: subject,
      html: html,
    });
    
    console.log('📨 Resend yanıtı - Data:', data);
    console.log('📨 Resend yanıtı - Error:', error);
    
    console.log('📨 Resend yanıtı - Data:', data);
    console.log('📨 Resend yanıtı - Error:', error);
    
    if (error) {
      console.error('❌ Email gönderim hatası:');
      console.error('   - Hata mesajı:', error.message || error);
      console.error('   - Hata detayı:', JSON.stringify(error, null, 2));
      // Hata olsa bile uygulamayı kaydet
      return { success: false, error };
    }
    
    console.log('✅ Email başarıyla gönderildi!');
    console.log('   - Message ID:', data?.id);
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Email gönderim exception:', error);
    return { success: false, error };
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: BetaApplication = await request.json();
    
    // Basit validasyon
    if (!data.businessName || !data.email || !data.phone || !data.ownerName) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun (İşletme Adı, Email, Telefon, Yetkili Adı)' },
        { status: 400 }
      );
    }
    
    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin' },
        { status: 400 }
      );
    }
    
    // Başvuru ID oluştur
    const applicationId = `BETA-${Date.now().toString().slice(-8)}`;
    const timestamp = new Date().toISOString();
    
    // Email HTML oluştur
    const emailHTML = generateEmailHTML(data, applicationId);
    
    // RESEND EMAIL AYARLARI:
    // Resend ücretsiz plan: Sadece doğrulanmış email'lere gönderebilir
    // Production için domain doğrulaması yapılmalı
    
    // Admin email'i environment variable'dan al
    const adminEmail = process.env.ADMIN_EMAIL || 'ercanerguler@gmail.com';
    const resendVerifiedEmail = 'ercanerguler@gmail.com'; // Resend'de kayıtlı doğrulanmış email
    
    console.log('📧 Beta başvurusu email gönderiliyor...');
    console.log('📧 Admin Email:', adminEmail);
    console.log('📧 Verified Email:', resendVerifiedEmail);
    
    // 1. Admin'e bildirim gönder (başvuru detayları)
    // Hem admin email hem de verified email'e gönder
    const emailResult = await sendEmail(
      adminEmail === resendVerifiedEmail ? adminEmail : resendVerifiedEmail,
      `🎉 Yeni Beta Başvurusu: ${data.businessName} (${applicationId})`,
      emailHTML
    );
    
    console.log('📧 Email gönderim sonucu:', emailResult);
    
    // Eğer admin email farklıysa, ona da console'da bilgi ver
    if (adminEmail !== resendVerifiedEmail) {
      console.log(`⚠️ NOT: Email ${resendVerifiedEmail} adresine gönderildi (Resend verified email)`);
      console.log(`⚠️ Asıl admin email: ${adminEmail} (Domain doğrulanmadığı için buraya gönderilemedi)`);
    }
    
    // 2. Başvuru sahibine onay maili gönder (resend verified email'e gider - içerik kullanıcı için)
    const confirmationHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: white;
            padding: 40px 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🎉 Tebrikler!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Başvurunuz başarıyla alındı</p>
        </div>
        
        <div class="content">
          <p>Merhaba <strong>${data.ownerName}</strong>,</p>
          
          <p><strong>${data.businessName}</strong> için Beta Programı başvurunuz alındı!</p>
          
          <div class="box">
            <p><strong>📋 Başvuru Numaranız:</strong> ${applicationId}</p>
            <p><strong>📧 Email:</strong> ${data.email}</p>
            <p><strong>📍 Lokasyon:</strong> ${data.location}</p>
          </div>
          
          <h3>⏭️ Sonraki Adımlar:</h3>
          <ol>
            <li><strong>48 saat içinde</strong> ekibimiz sizinle iletişime geçecek</li>
            <li><strong>15 dakikalık</strong> online demo görüşmesi yapacağız</li>
            <li><strong>Onay sonrası</strong> Business Box'ınız ücretsiz kargoya verilecek</li>
            <li><strong>3 ay ücretsiz</strong> premium hizmetten yararlanacaksınız</li>
          </ol>
          
          <div class="box" style="background: linear-gradient(135deg, #e7f3ff 0%, #f3e7ff 100%);">
            <h3 style="margin-top: 0;">🎁 Beta Avantajlarınız</h3>
            <ul style="margin: 0;">
              <li>✅ City-V Business Box (₺2,990 değerinde)</li>
              <li>✅ 3 Ay Ücretsiz Premium Hizmet (₺597)</li>
              <li>✅ Sonraki 9 Ay %50 İndirim (₺897 tasarruf)</li>
              <li>✅ Öncelikli Teknik Destek</li>
              <li>✅ Ücretsiz Kurulum & Eğitim</li>
            </ul>
            <p style="margin: 15px 0 0 0; font-size: 18px;">
              <strong>Toplam Değer: ₺4,484</strong>
            </p>
          </div>
          
          <p>Sorularınız için <a href="mailto:sce@scegrup.com">sce@scegrup.com</a> adresinden bize ulaşabilirsiniz.</p>
          
          <p style="margin-top: 30px;">
            En iyi dileklerimizle,<br>
            <strong>City-V Ekibi</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>City-V Business Box © 2025</p>
          <p>Bu mail otomatik olarak oluşturulmuştur.</p>
        </div>
      </body>
      </html>
    `;
    
    // Onay mailini de aynı verified email'e gönder
    await sendEmail(
      resendVerifiedEmail, // Resend verified email
      `✅ Beta Başvuru Onayı: ${data.businessName} - ${applicationId} (Kullanıcıya gönderilecek: ${data.email})`,
      confirmationHTML
    );
    
    // Başvuruyu console'a kaydet (database yerine geçici)
    console.log('\n📋 ====================================');
    console.log('✅ YENİ BETA BAŞVURUSU KAYDEDILDI');
    console.log('====================================');
    console.log('Başvuru ID:', applicationId);
    console.log('Zaman:', timestamp);
    console.log('İşletme:', data.businessName);
    console.log('Yetkili:', data.ownerName);
    console.log('Email:', data.email);
    console.log('Telefon:', data.phone);
    console.log('Lokasyon:', data.location);
    console.log('Tip:', data.businessType);
    console.log('Günlük Müşteri:', data.averageDaily);
    console.log('Çalışma Saati:', data.openingHours);
    console.log('Hedefler:', data.goals.join(', '));
    if (data.website) console.log('Website:', data.website);
    if (data.additionalInfo) console.log('Ek Bilgi:', data.additionalInfo);
    console.log('====================================\n');
    
    // Başarılı response
    return NextResponse.json({
      success: true,
      applicationId: applicationId,
      timestamp: timestamp,
      message: 'Başvurunuz başarıyla alındı. Email gönderildi.',
      data: {
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        location: data.location
      }
    });
    
  } catch (error) {
    console.error('Beta başvuru hatası:', error);
    return NextResponse.json(
      { error: 'Başvuru işlenirken hata oluştu' },
      { status: 500 }
    );
  }
}
