import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Belirli bir email ID'sini kontrol et
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get('id') || '2fd7606c-e26c-49bd-b4a7-180bda2ee26b';
    
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY bulunamadı'
      }, { status: 500 });
    }
    
    console.log('\n🔍 Email ID Kontrolü...');
    console.log('📧 Email ID:', emailId);
    console.log('🔑 API Key:', apiKey.substring(0, 15) + '...\n');
    
    const resend = new Resend(apiKey);
    
    // Belirli email'i getir
    console.log('📥 Resend API çağrılıyor: emails.get()...\n');
    
    const { data, error } = await resend.emails.get(emailId);
    
    if (error) {
      console.error('❌ Hata:', error);
      return NextResponse.json({
        success: false,
        error: error,
        emailId: emailId,
        message: 'Bu email ID bulunamadı veya farklı bir API key ile gönderilmiş olabilir'
      }, { status: 404 });
    }
    
    console.log('✅ Email bulundu!');
    console.log('   - ID:', data.id);
    console.log('   - To:', data.to);
    console.log('   - From:', data.from);
    console.log('   - Subject:', data.subject);
    console.log('   - Created:', data.created_at);
    console.log('   - Status:', data.last_event || 'pending');
    
    return NextResponse.json({
      success: true,
      email: data,
      message: 'Email başarıyla bulundu'
    });
    
  } catch (error: any) {
    console.error('\n💥 Exception:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'Bu email ID mevcut API key ile bulunamadı. Farklı bir API key ile gönderilmiş olabilir.'
    }, { status: 500 });
  }
}
