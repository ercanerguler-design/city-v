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

    // Kullanıcının hala aktif olup olmadığını kontrol et (membership bilgileriyle birlikte)
    const userResult = await sql`
      SELECT id, email, full_name, phone, is_active, 
             membership_type, membership_expiry_date, max_cameras
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

    // Membership süresi dolmuş mu kontrol et
    if (user.membership_expiry_date) {
      const expiryDate = new Date(user.membership_expiry_date);
      const now = new Date();
      if (expiryDate < now) {
        console.log('⚠️ Membership süresi dolmuş, free\'e düşürülüyor');
        // Üyeliği free'e düşür
        await sql`
          UPDATE business_users 
          SET membership_type = 'free', max_cameras = 1
          WHERE id = ${user.id}
        `;
        user.membership_type = 'free';
        user.max_cameras = 1;
      }
    }

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
        phone: user.phone,
        membership_type: user.membership_type || 'free',
        membership_expiry_date: user.membership_expiry_date,
        max_cameras: user.max_cameras || 1
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
