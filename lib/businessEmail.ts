import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Business'a yeni personel eklendiğinde email gönder
 */
export async function sendStaffWelcomeEmail(staffData: {
  fullName: string;
  email: string;
  businessName: string;
  position?: string;
  dashboardUrl?: string;
}) {
  try {
    const data = await resend.emails.send({
      from: 'CityV Business <noreply@city-v.com>',
      to: [staffData.email],
      subject: `${staffData.businessName} - Hesabınız Oluşturuldu`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .info-box { background: #f3f4f6; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Hoş Geldiniz!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">CityV Business'a eklendiniz</p>
            </div>
            
            <div class="content">
              <p><strong>Merhaba ${staffData.fullName},</strong></p>
              
              <p><strong>${staffData.businessName}</strong> işletmesinde <strong>${staffData.position || 'Personel'}</strong> olarak eklendiniz.</p>
              
              <div class="info-box">
                <p style="margin: 0;"><strong>📧 Email:</strong> ${staffData.email}</p>
                ${staffData.position ? `<p style="margin: 8px 0 0 0;"><strong>💼 Pozisyon:</strong> ${staffData.position}</p>` : ''}
              </div>
              
              <p><strong>Neler Yapabilirsiniz?</strong></p>
              <ul>
                <li>📹 İşletme kameralarını izleyebilirsiniz</li>
                <li>📊 Gerçek zamanlı kalabalık analizlerini görüntüleyebilirsiniz</li>
                <li>📈 İşletme raporlarına erişebilirsiniz</li>
                <li>🔔 Anlık bildirimleri alabilirsiniz</li>
              </ul>
              
              ${staffData.dashboardUrl ? `
                <p style="text-align: center;">
                  <a href="${staffData.dashboardUrl}" class="button">
                    🚀 Dashboard'a Git
                  </a>
                </p>
              ` : ''}
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                Herhangi bir sorunuz olursa, lütfen yöneticinizle veya CityV destek ekibiyle iletişime geçin.
              </p>
            </div>
            
            <div class="footer">
              <p><strong>CityV</strong> - AI Crowd Analysis Platform</p>
              <p>
                <a href="https://city-v.com" style="color: #667eea; text-decoration: none;">city-v.com</a> |
                <a href="mailto:support@city-v.com" style="color: #667eea; text-decoration: none;">support@city-v.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Staff welcome email sent:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Staff welcome email error:', error);
    return { success: false, error };
  }
}

/**
 * Business sahibine yeni personel eklendiğinde bildirim
 */
export async function sendOwnerStaffNotification(ownerData: {
  ownerEmail: string;
  ownerName: string;
  staffName: string;
  staffEmail: string;
  staffPosition?: string;
  businessName: string;
}) {
  try {
    const data = await resend.emails.send({
      from: 'CityV Business <noreply@city-v.com>',
      to: [ownerData.ownerEmail],
      subject: `${ownerData.businessName} - Yeni Personel Eklendi`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .info-box { background: #f9fafb; padding: 16px; margin: 20px 0; border-radius: 6px; border: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">👤 Yeni Personel</h1>
            </div>
            
            <div class="content">
              <p><strong>Merhaba ${ownerData.ownerName},</strong></p>
              
              <p>İşletmenize yeni bir personel eklendi.</p>
              
              <div class="info-box">
                <p style="margin: 0;"><strong>Ad Soyad:</strong> ${ownerData.staffName}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${ownerData.staffEmail}</p>
                ${ownerData.staffPosition ? `<p style="margin: 0;"><strong>Pozisyon:</strong> ${ownerData.staffPosition}</p>` : ''}
              </div>
              
              <p>Personel otomatik olarak bilgilendirme emaili aldı ve dashboard'a erişim sağlayabilir.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Owner staff notification sent:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Owner staff notification error:', error);
    return { success: false, error };
  }
}
