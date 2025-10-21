import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
    
    if (existingUser.rows.length > 0) {
      // Kullanıcı mevcut - last_login güncelle
      const user = existingUser.rows[0];
      
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
    
    return NextResponse.json({
      success: true,
      user: newUser.rows[0],
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
