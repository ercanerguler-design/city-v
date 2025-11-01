import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Admin yetkisini kontrol et
function isAdmin(request: NextRequest): boolean {
  // Admin store'dan gelen email kontrolü yapabilirsiniz
  // Şimdilik basit kontrol
  const adminEmail = request.headers.get('x-admin-email');
  return adminEmail === 'sce@scegrup.com';
}

// GET - Tüm business üyeleri listele
export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const result = await query(
      `SELECT 
        bu.id,
        bu.email,
        bu.full_name,
        bu.phone,
        bu.role,
        bu.is_active,
        bu.created_at,
        bu.last_login,
        bs.plan_type,
        bs.max_cameras,
        bs.monthly_price,
        bs.start_date,
        bs.end_date,
        bs.is_active as subscription_active,
        bs.license_key,
        bs.notes,
        (SELECT COUNT(*) FROM business_cameras WHERE business_id = bu.id) as camera_count
       FROM business_users bu
       LEFT JOIN business_subscriptions bs ON bu.id = bs.user_id
       ORDER BY bu.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      users: result.rows
    });

  } catch (error: any) {
    console.error('❌ Business users list error:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar yüklenemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni business üyesi ekle
export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const {
      email,
      password,
      fullName,
      phone,
      planType, // 'premium' or 'enterprise'
      startDate,
      endDate,
      notes
    } = await request.json();

    // Validasyon
    if (!email || !password || !fullName || !planType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar: email, şifre, ad soyad, plan, başlangıç ve bitiş tarihi' },
        { status: 400 }
      );
    }

    // Plan bilgileri
    const planConfig = {
      premium: { maxCameras: 10, price: 249.00 },
      enterprise: { maxCameras: 50, price: 499.00 }
    };

    if (!planConfig[planType as keyof typeof planConfig]) {
      return NextResponse.json(
        { error: 'Geçersiz plan tipi. premium veya enterprise olmalı' },
        { status: 400 }
      );
    }

    const config = planConfig[planType as keyof typeof planConfig];

    // Email kontrolü
    const existing = await query(
      'SELECT id FROM business_users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const passwordHash = await bcrypt.hash(password, 10);

    // Lisans anahtarı oluştur
    const licenseKey = `CITYV-${planType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Transaction başlat
    await query('BEGIN');

    try {
      // Business user ekle
      const userResult = await query(
        `INSERT INTO business_users (
          email, password_hash, full_name, phone, role, added_by_admin, is_active, email_verified
        ) VALUES ($1, $2, $3, $4, 'business_user', true, true, true)
        RETURNING id`,
        [email, passwordHash, fullName, phone || null]
      );

      const userId = userResult.rows[0].id;

      // Subscription ekle
      await query(
        `INSERT INTO business_subscriptions (
          user_id, plan_type, max_cameras, monthly_price,
          start_date, end_date, is_active, license_key, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8)`,
        [
          userId,
          planType,
          config.maxCameras,
          config.price,
          startDate,
          endDate,
          licenseKey,
          notes || null
        ]
      );

      // Business profile oluştur
      const profileResult = await query(
        `INSERT INTO business_profiles (
          user_id, business_name, business_type
        ) VALUES ($1, $2, 'other')
        RETURNING id`,
        [userId, fullName]
      );

      const businessId = profileResult.rows[0].id;

      await query('COMMIT');

      console.log(`✅ Business user created: userId=${userId}, businessId=${businessId}, email=${email}`);

      return NextResponse.json({
        success: true,
        message: 'Business üyesi başarıyla eklendi',
        user: {
          id: userId,
          businessId: businessId,
          email,
          fullName,
          planType,
          maxCameras: config.maxCameras,
          monthlyPrice: config.price,
          licenseKey
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('❌ Business user create error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulamadı', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Business üyesini sil
export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    // Transaction başlat - ilişkili kayıtları doğru sırayla sil
    await query('BEGIN');
    
    try {
      console.log(`🗑️ Siliniyor: User ID ${userId}`);
      
      // 1. Önce business_profiles'dan ID'leri al (diğer tablolar buna bağlı)
      const profiles = await query('SELECT id FROM business_profiles WHERE user_id = $1', [userId]);
      const profileIds = profiles.rows.map(p => p.id);
      
      if (profileIds.length > 0) {
        console.log(`📋 Business profile IDs: ${profileIds.join(', ')}`);
        
        // 2. Business profiles'a bağlı tabloları sil
        await query('DELETE FROM business_campaigns WHERE business_id = ANY($1)', [profileIds]);
        console.log(`🗑️ Campaigns deleted`);
        
        await query('DELETE FROM business_cameras WHERE business_id = ANY($1)', [profileIds]);
        console.log(`🗑️ Cameras (via business_id) deleted`);
      }
      
      // 3. Business_user_id ile doğrudan bağlı kameraları sil (business-cameras.sql schema)
      await query('DELETE FROM business_cameras WHERE business_user_id = $1', [userId]);
      console.log(`🗑️ Cameras (via business_user_id) deleted`);
      
      // 4. Business subscriptions'ı sil (user_id'ye bağlı)
      await query('DELETE FROM business_subscriptions WHERE user_id = $1', [userId]);
      console.log(`🗑️ Subscriptions deleted`);
      
      // 5. Business profiles'ı sil (user_id'ye bağlı)
      await query('DELETE FROM business_profiles WHERE user_id = $1', [userId]);
      console.log(`🗑️ Profiles deleted`);
      
      // 6. Son olarak business_users'ı sil
      await query('DELETE FROM business_users WHERE id = $1', [userId]);
      console.log(`✅ User ${userId} deleted successfully`);
      
      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Kullanıcı ve tüm ilişkili kayıtlar silindi'
      });
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('❌ Business user delete error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı silinemedi: ' + error.message },
      { status: 500 }
    );
  }
}
