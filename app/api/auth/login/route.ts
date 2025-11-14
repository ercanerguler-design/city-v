import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }
    
    console.log('🔐 Login denemesi:', email);
    
    // Kullanıcıyı bul
    const result = await sql`
      SELECT 
        id, email, name, password_hash, google_id,
        membership_tier, ai_credits, profile_picture,
        join_date, last_login, created_at
      FROM users 
      WHERE email = ${email}
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı. Lütfen kayıt olun.' },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    // Google ile kayıt olmuş kullanıcı email/password ile giriş yapmaya çalışıyor
    if (user.google_id && !user.password_hash) {
      return NextResponse.json(
        { error: 'Bu hesap Google ile oluşturulmuş. Lütfen "Google ile Giriş Yap" butonunu kullanın.' },
        { status: 400 }
      );
    }
    
    // Şifre kontrolü
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Şifre bulunamadı. Lütfen Google ile giriş yapın.' },
        { status: 400 }
      );
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Yanlış şifre. Lütfen tekrar deneyin.' },
        { status: 401 }
      );
    }
    
    // Last login güncelle
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `;
    
    console.log('✅ Login başarılı:', email);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membershipTier: user.membership_tier,
        aiCredits: user.ai_credits,
        profilePicture: user.profile_picture,
        joinDate: user.join_date,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Login hatası:', error);
    return NextResponse.json(
      { 
        error: 'Giriş işlemi başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
