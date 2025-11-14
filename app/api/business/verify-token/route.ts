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
      console.log('✅ Token decoded:', { userId: decoded.userId });
    } catch (error: any) {
      console.error('❌ Token doğrulama hatası:', error.message);
      return NextResponse.json(
        { valid: false, error: 'Token geçersiz veya süresi dolmuş' },
        { status: 401 }
      );
    }

    // Kullanıcı bilgilerini business_users tablosundan çek (membership dahil)
    const userResult = await sql`
      SELECT 
        id, 
        email, 
        full_name, 
        phone, 
        is_active,
        membership_type,
        max_cameras
      FROM business_users 
      WHERE id = ${decoded.userId} AND is_active = true
    `;

    console.log('📋 User query result:', { found: userResult.rows.length, userId: decoded.userId });

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { valid: false, error: 'Kullanıcı bulunamadı veya aktif değil' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Business profilini getir (opsiyonel)
    let profile = null;
    try {
      const profileResult = await sql`
        SELECT * FROM business_profiles WHERE user_id = ${user.id}
      `;
      profile = profileResult.rows[0] || null;
    } catch (error) {
      console.log('⚠️ Profile bulunamadı (normal, ilk girişte olabilir)');
    }

    console.log('✅ Verify successful:', { email: user.email, membership: user.membership_type });

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        membership_type: user.membership_type || 'free',
        max_cameras: user.max_cameras || 1
      },
      profile: profile
    });

  } catch (error: any) {
    console.error('❌ Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: `Doğrulama hatası: ${error.message}` },
      { status: 500 }
    );
  }
}
