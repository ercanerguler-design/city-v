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

    // Membership bilgilerini business_subscriptions tablosundan çek
    const subscriptionResult = await sql`
      SELECT plan_type, end_date
      FROM business_subscriptions 
      WHERE user_id = ${user.id} AND is_active = true
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    let membershipData = {
      membership_type: 'free',
      membership_expiry_date: null,
      max_cameras: 1
    };

    if (subscriptionResult.rows.length > 0) {
      const subscription = subscriptionResult.rows[0];
      const expiryDate = subscription.end_date ? new Date(subscription.end_date) : null;
      const now = new Date();
      
      // Süre dolmamışsa subscription bilgilerini kullan
      if (!expiryDate || expiryDate > now) {
        // Plan type'a göre max_cameras belirle
        const maxCamerasMap: { [key: string]: number } = {
          'enterprise': 50,
          'premium': 10,
          'business': 5,
          'free': 1
        };
        
        membershipData = {
          membership_type: subscription.plan_type || 'free',
          membership_expiry_date: subscription.end_date,
          max_cameras: maxCamerasMap[subscription.plan_type] || 1
        };
      } else {
        console.log('⚠️ Subscription süresi dolmuş, free plana düşürüldü');
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
        membership_type: membershipData.membership_type,
        membership_expiry_date: membershipData.membership_expiry_date,
        max_cameras: membershipData.max_cameras
      },
      profile: profileResult.rows[0] || null
    });

  } catch (error: any) {
    console.error('❌ Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: `Doğrulama hatası: ${error.message}` },
      { status: 500 }
    );
  }
}
