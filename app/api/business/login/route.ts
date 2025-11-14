import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-2024';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul (membership bilgileriyle)
    const result = await sql`
      SELECT id, email, password_hash, full_name, phone, 
             membership_type, membership_expiry_date, max_cameras, is_active
      FROM business_users 
      WHERE email = ${email} AND is_active = true
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Son giriş zamanını güncelle
    await sql`
      UPDATE business_users 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `;

    // Business profilini getir
    const profileResult = await sql`
      SELECT * FROM business_profiles WHERE user_id = ${user.id}
    `;

    // JWT token oluştur (8 saat - günlük session)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        membership_type: user.membership_type || 'free',
        membership_expiry_date: user.membership_expiry_date,
        max_cameras: user.max_cameras || 1
      },
      profile: profileResult.rows[0] || null,
      token
    });

  } catch (error: any) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi başarısız', details: error.message },
      { status: 500 }
    );
  }
}
