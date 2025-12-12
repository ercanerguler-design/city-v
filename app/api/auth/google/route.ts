import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email, name, picture, googleId } = await request.json();
    
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email ve isim gerekli' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Google kullanıcısı kontrol ediliyor:', email);
    
    // Kullanıcı var mı kontrol et
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    if (existingUser.length > 0) {
      // Kullanıcı mevcut - last_login güncelle
      const user = existingUser[0];
      
      await sql`
        UPDATE users 
        SET last_login = NOW() 
        WHERE id = ${user.id}
      `;
      
      console.log('✅ Mevcut kullanıcı giriş yaptı:', email);
      
      return NextResponse.json({
        success: true,
        user: user,
        isNewUser: false
      });
    }
    
    // Yeni kullanıcı oluştur
    console.log('➕ Yeni Google kullanıcısı oluşturuluyor:', email);
    
    const newUser = await sql`
      INSERT INTO users (
        email, name, google_id, profile_picture, 
        membership_tier, ai_credits, is_active, 
        join_date, last_login, created_at, updated_at
      ) VALUES (
        ${email}, 
        ${name}, 
        ${googleId || null}, 
        ${picture || null},
        'free', 
        100, 
        true,
        NOW(), 
        NOW(), 
        NOW(), 
        NOW()
      )
      RETURNING *
    `;
    
    console.log('✅ Yeni Google kullanıcısı oluşturuldu:', email);
    
    // Hoşgeldin maili gönder (Resend API)
    try {
      await fetch(`${request.nextUrl.origin}/api/email/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: name
        })
      });
      console.log('📧 Hoşgeldin maili gönderildi:', email);
    } catch (emailError) {
      console.error('⚠️ Mail gönderme hatası (devam ediliyor):', emailError);
      // Mail hatası ana işlemi etkilemez
    }
    
    return NextResponse.json({
      success: true,
      user: newUser[0],
      isNewUser: true
    });
    
  } catch (error) {
    console.error('❌ Google auth hatası:', error);
    return NextResponse.json(
      { 
        error: 'Kullanıcı işlemi başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
