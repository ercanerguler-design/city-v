import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { valid: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      // Token'ı decode et
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Kullanıcı ve abonelik bilgilerini kontrol et
      const result = await query(
        `SELECT 
          bu.id,
          bu.is_active,
          bs.end_date,
          bs.is_active as subscription_active
         FROM business_users bu
         LEFT JOIN business_subscriptions bs ON bu.id = bs.user_id
         WHERE bu.id = $1`,
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { valid: false, error: 'Kullanıcı bulunamadı' },
          { status: 401 }
        );
      }

      const user = result.rows[0];

      // Kullanıcı aktif değilse
      if (!user.is_active) {
        return NextResponse.json(
          { valid: false, error: 'Hesap aktif değil' },
          { status: 403 }
        );
      }

      // Abonelik kontrolü
      if (!user.subscription_active) {
        return NextResponse.json(
          { valid: false, subscriptionExpired: true, error: 'Abonelik aktif değil' },
          { status: 403 }
        );
      }

      // Abonelik süresi kontrolü
      const now = new Date();
      const endDate = new Date(user.end_date);

      if (endDate < now) {
        return NextResponse.json(
          { valid: false, subscriptionExpired: true, error: 'Abonelik süresi dolmuş' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        valid: true,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        planType: decoded.planType,
        maxCameras: decoded.maxCameras
      });

    } catch (jwtError) {
      return NextResponse.json(
        { valid: false, error: 'Token geçersiz veya süresi dolmuş' },
        { status: 401 }
      );
    }

  } catch (error: any) {
    console.error('❌ Token verify error:', error);
    return NextResponse.json(
      { valid: false, error: 'Doğrulama hatası' },
      { status: 500 }
    );
  }
}
