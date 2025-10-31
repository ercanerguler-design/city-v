import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-2024';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone } = await request.json();

    // Email kontrolü
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, şifre ve ad soyad gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcı zaten var mı?
    const existingUser = await sql`
      SELECT * FROM business_users WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const passwordHash = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const result = await sql`
      INSERT INTO business_users (email, password_hash, full_name, phone)
      VALUES (${email}, ${passwordHash}, ${fullName}, ${phone || null})
      RETURNING id, email, full_name, created_at
    `;

    const user = result.rows[0];

    // Default business profile oluştur
    await sql`
      INSERT INTO business_profiles (user_id, business_name, business_type)
      VALUES (${user.id}, ${fullName}, 'retail')
    `;

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at
      },
      token
    });

  } catch (error: any) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız', details: error.message },
      { status: 500 }
    );
  }
}
