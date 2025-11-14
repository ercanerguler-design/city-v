import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Test endpoint for Resend email
export async function GET(request: NextRequest) {
  try {
    console.log('\n🧪 ==========================================');
    console.log('🧪 RESEND EMAIL TEST BAŞLADI');
    console.log('🧪 ==========================================\n');
    
    // 1. API Key kontrolü
    const apiKey = process.env.RESEND_API_KEY;
    console.log('🔑 API Key var mı?', apiKey ? '✅ EVET' : '❌ HAYIR');
    if (apiKey) {
      console.log('🔑 API Key başlangıcı:', apiKey.substring(0, 10) + '...');
      console.log('🔑 API Key uzunluğu:', apiKey.length, 'karakter');
    }
    
    if (!apiKey || apiKey === 'your_resend_api_key_here') {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY environment variable tanımlı değil',
        hint: 'Vercel dashboard > Settings > Environment Variables kısmından ekleyin'
      }, { status: 500 });
    }
    
    // 2. Resend client oluştur
    console.log('\n📦 Resend client oluşturuluyor...');
    const resend = new Resend(apiKey);
    console.log('✅ Resend client hazır\n');
    
    // 3. Test email gönder
    const testEmail = 'ercanerguler@gmail.com'; // Resend'de doğrulanmış email
    
    console.log('📧 EMAIL GÖNDERİM DETAYLARI:');
    console.log('   - From: City-V Test <onboarding@resend.dev>');
    console.log('   - To:', testEmail);
    console.log('   - Subject: 🧪 Resend Test Email');
    console.log('\n📤 Email gönderiliyor...\n');
    
    const { data, error } = await resend.emails.send({
      from: 'City-V Test <onboarding@resend.dev>',
      to: [testEmail],
      subject: '🧪 Resend Test Email - City-V',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              border-radius: 10px;
              text-align: center;
            }
            .box {
              background: white;
              color: #333;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🧪 Test Email Başarılı!</h1>
            <p>Bu email Resend API tarafından gönderildi.</p>
            
            <div class="box">
              <h3>✅ Sistem Bilgileri</h3>
              <p><strong>API Key:</strong> ${apiKey.substring(0, 10)}...</p>
              <p><strong>From:</strong> City-V Test &lt;onboarding@resend.dev&gt;</p>
              <p><strong>To:</strong> ${testEmail}</p>
              <p><strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; opacity: 0.9;">
              Eğer bu emaili aldıysanız, Resend entegrasyonu çalışıyor demektir! 🎉
            </p>
          </div>
        </body>
        </html>
      `,
    });
    
    console.log('\n📨 RESEND YANITLARI:');
    console.log('=====================================');
    
    if (error) {
      console.error('❌ HATA OLUŞTU:');
      console.error('   - Hata türü:', typeof error);
      console.error('   - Hata içeriği:', JSON.stringify(error, null, 2));
      
      return NextResponse.json({
        success: false,
        error: error,
        message: 'Email gönderilemedi',
        apiKeyCheck: {
          exists: true,
          prefix: apiKey.substring(0, 10),
          length: apiKey.length
        }
      }, { status: 500 });
    }
    
    console.log('✅ EMAIL GÖNDERİLDİ:');
    console.log('   - Message ID:', data?.id);
    console.log('   - Data:', JSON.stringify(data, null, 2));
    console.log('\n🧪 ==========================================');
    console.log('🧪 TEST TAMAMLANDI - BAŞARILI ✅');
    console.log('🧪 ==========================================\n');
    
    return NextResponse.json({
      success: true,
      message: 'Test email başarıyla gönderildi! ✅',
      messageId: data?.id,
      sentTo: testEmail,
      apiKeyCheck: {
        exists: true,
        prefix: apiKey.substring(0, 10),
        length: apiKey.length
      },
      hint: `${testEmail} adresini kontrol edin (spam klasörüne de bakın)`
    });
    
  } catch (error: any) {
    console.error('\n💥 EXCEPTION OLUŞTU:');
    console.error('   - Hata mesajı:', error.message);
    console.error('   - Stack trace:', error.stack);
    console.error('\n🧪 ==========================================\n');
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      message: 'Bir hata oluştu'
    }, { status: 500 });
  }
}
