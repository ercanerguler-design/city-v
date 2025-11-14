import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'İsim, email ve şifre gerekli' },
        { status: 400 }
      );
    }
    
    console.log('📝 Yeni kullanıcı kaydı:', email);
    
    // Email zaten kayıtlı mı kontrol et
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı. Lütfen giriş yapın.' },
        { status: 409 }
      );
    }
    
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Yeni kullanıcı oluştur
    const newUser = await sql`
      INSERT INTO users (
        email, name, password_hash,
        membership_tier, ai_credits, is_active,
        join_date, last_login, created_at, updated_at
      ) VALUES (
        ${email},
        ${name},
        ${hashedPassword},
        'free',
        50,
        true,
        NOW(),
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING id, email, name, membership_tier, ai_credits, join_date, created_at
    `;
    
    console.log('✅ Yeni kullanıcı oluşturuldu:', email);
    
    const user = newUser.rows[0];
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membershipTier: user.membership_tier,
        aiCredits: user.ai_credits,
        createdAt: user.created_at
      },
      message: 'Kayıt başarılı!'
    });
    
  } catch (error) {
    console.error('❌ Kayıt hatası:', error);
    return NextResponse.json(
      { 
        error: 'Kayıt işlemi başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
