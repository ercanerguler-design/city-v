import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-2024';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Token'ı doğrula
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error: any) {
      console.error('❌ Token doğrulama hatası:', error.message);
      return NextResponse.json(
        { valid: false, error: 'Token geçersiz veya süresi dolmuş' },
        { status: 401 }
      );
    }

    // Kullanıcının hala aktif olup olmadığını kontrol et
    const userResult = await sql`
      SELECT id, email, full_name, phone, is_active 
      FROM business_users 
      WHERE id = ${decoded.userId}
    `;

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return NextResponse.json(
        { valid: false, error: 'Kullanıcı bulunamadı veya aktif değil' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Business profilini getir
    const profileResult = await sql`
      SELECT * FROM business_profiles WHERE user_id = ${user.id}
    `;

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone
      },
      profile: profileResult.rows[0] || null
    });

  } catch (error: any) {
    console.error('❌ Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Doğrulama hatası' },
      { status: 500 }
    );
  }
}
