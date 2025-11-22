import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

export async function GET(request: NextRequest) {
  try {
    // Token'ı al
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Demo token kontrolü
    if (token === 'demo-token') {
      return NextResponse.json({
        success: true,
        status: 'valid',
        license: {
          plan_type: 'premium',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          daysLeft: 365,
          features: {
            maxCameras: 10,
            aiAnalytics: true,
            pushNotifications: true,
          }
        }
      });
    }

    // JWT doğrula
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Kullanıcı ve lisans bilgilerini al
    const result = await query(`
      SELECT 
        bu.id,
        bu.email,
        bu.company_name,
        bs.plan_type,
        bs.start_date,
        bs.end_date,
        bs.is_active,
        bs.is_trial,
        bs.features,
        bs.license_key
      FROM business_users bu
      LEFT JOIN business_subscriptions bs ON bu.id = bs.user_id
      WHERE bu.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Lisans durumu kontrolü
    const now = new Date();
    const endDate = new Date(user.end_date);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: 'valid' | 'expired' | 'trial';
    
    if (!user.is_active || endDate < now) {
      status = 'expired';
    } else if (user.is_trial) {
      status = 'trial';
    } else {
      status = 'valid';
    }

    return NextResponse.json({
      success: true,
      status,
      license: {
        plan_type: user.plan_type,
        start_date: user.start_date,
        end_date: user.end_date,
        daysLeft: Math.max(0, daysLeft),
        is_trial: user.is_trial,
        features: user.features,
        license_key: user.license_key,
      },
      user: {
        email: user.email,
        company_name: user.company_name,
      }
    });

  } catch (error: any) {
    console.error('❌ License check error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lisans kontrolü yapılamadı' },
      { status: 500 }
    );
  }
}

