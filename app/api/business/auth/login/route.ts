import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
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

    // Business user'ı bul - membership bilgileriyle birlikte
    const result = await sql`
      SELECT 
        id, email, password_hash, full_name, phone,
        added_by_admin, is_active, membership_type,
        membership_expiry_date, max_cameras
       FROM business_users
       WHERE email = ${email} AND is_active = true
    `;

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
      membershipType: user.membership_type,
      maxCameras: user.max_cameras
    });

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

    // Membership bilgilerini direkt business_users tablosundan al
    const membershipData = {
      membership_type: user.membership_type || 'free',
      membership_expiry_date: user.membership_expiry_date,
      max_cameras: user.max_cameras || 1
    };
    
    console.log('📋 Membership data:', membershipData);

    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: 'business_user',
        planType: membershipData.membership_type,
        maxCameras: membershipData.max_cameras
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Last login güncelle
    await sql`
      UPDATE business_users SET last_login = NOW() WHERE id = ${user.id}
    `;

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: 'business_user',
      membership_type: membershipData.membership_type,
      membership_expiry_date: membershipData.membership_expiry_date,
      max_cameras: membershipData.max_cameras,
      planType: membershipData.membership_type,
      maxCameras: membershipData.max_cameras
    };

    console.log('✅ Login successful for:', user.email);

    return NextResponse.json({
      success: true,
      token,
      user: userData,
      message: 'Giriş başarılı'
    });

  } catch (error: any) {
    console.error('❌ Business login error:', error);
    return NextResponse.json(
      { error: `Giriş işlemi sırasında hata oluştu: ${error.message}` },
      { status: 500 }
    );
  }
}