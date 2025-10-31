import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    console.log('🔐 Business login attempt:', email);

    // Business user'ı bul
    const result = await query(
      `SELECT 
        bu.id,
        bu.email,
        bu.password_hash,
        bu.full_name,
        bu.phone,
        bu.added_by_admin,
        bu.is_active
       FROM business_users bu
       WHERE bu.email = $1 AND bu.is_active = true`,
      [email]
    );

    console.log('📋 Query result:', {
      found: result.rows.length > 0,
      rowCount: result.rows.length
    });

    if (result.rows.length === 0) {
      console.log('❌ User not found or inactive');
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı veya hesap aktif değil' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      added_by_admin: user.added_by_admin
    });

    // Admin tarafından eklenmiş mi kontrol et
    if (!user.added_by_admin) {
      return NextResponse.json(
        { error: 'Bu hesap yetkili değil. Sadece admin tarafından eklenen üyeler giriş yapabilir.' },
        { status: 403 }
      );
    }

    // Şifre kontrolü
    console.log('🔑 Checking password...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Subscription bilgilerini ayrı sorgu ile al
    let subscriptionData = null;
    try {
      const subscriptionResult = await query(
        `SELECT plan_type, max_cameras, monthly_price, start_date, end_date, is_active
         FROM business_subscriptions
         WHERE user_id = $1 AND is_active = true
         ORDER BY created_at DESC LIMIT 1`,
        [user.id]
      );
      
      if (subscriptionResult.rows.length > 0) {
        subscriptionData = subscriptionResult.rows[0];
      }
    } catch (err) {
      console.log('⚠️ Subscription query failed, continuing without subscription data');
    }

    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: 'business_user', // Default role
        planType: subscriptionData?.plan_type || 'premium',
        maxCameras: subscriptionData?.max_cameras || 10
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Last login güncelle
    await query(
      'UPDATE business_users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: 'business_user', // Default role
      planType: subscriptionData?.plan_type || 'premium',
      maxCameras: subscriptionData?.max_cameras || 10,
      monthlyPrice: subscriptionData?.monthly_price || 249,
      subscriptionStart: subscriptionData?.start_date || null,
      subscriptionEnd: subscriptionData?.end_date || null
    };

    return NextResponse.json({
      success: true,
      token,
      user: userData,
      message: 'Giriş başarılı'
    });

  } catch (error: any) {
    console.error('❌ Business login error:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
