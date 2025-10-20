import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend email listesi kontrolü
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY bulunamadı'
      }, { status: 500 });
    }
    
    console.log('\n🔍 Resend Email Listesi Kontrol Ediliyor...\n');
    console.log('🔑 API Key:', apiKey.substring(0, 15) + '...');
    
    const resend = new Resend(apiKey);
    
    // Son gönderilen emailleri listele
    console.log('\n📧 Resend API çağrılıyor: emails.list()...\n');
    
    const { data, error } = await resend.emails.list();
    
    if (error) {
      console.error('❌ Hata:', error);
      return NextResponse.json({
        success: false,
        error: error,
        apiKey: apiKey.substring(0, 15) + '...'
      }, { status: 500 });
    }
    
    console.log('\n✅ Email Listesi Alındı:');
    console.log('📊 Toplam email sayısı:', data?.data?.length || 0);
    
    if (data?.data && data.data.length > 0) {
      console.log('\n📧 SON GÖNDERİLEN EMAILLER:');
      data.data.forEach((email: any, index: number) => {
        console.log(`\n${index + 1}. Email:`);
        console.log('   - ID:', email.id);
        console.log('   - To:', email.to);
        console.log('   - From:', email.from);
        console.log('   - Subject:', email.subject);
        console.log('   - Created:', new Date(email.created_at).toLocaleString('tr-TR'));
        console.log('   - Status:', email.last_event || 'pending');
      });
    } else {
      console.log('\n⚠️ Henüz email gönderilmemiş veya liste boş');
    }
    
    return NextResponse.json({
      success: true,
      emailCount: data?.data?.length || 0,
      emails: data?.data || [],
      message: 'Email listesi başarıyla alındı'
    });
    
  } catch (error: any) {
    console.error('\n💥 Exception:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
