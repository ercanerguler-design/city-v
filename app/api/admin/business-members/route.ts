import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendBusinessWelcomeEmail } from '@/lib/emailService';

// Lisans anahtarı oluşturucu
function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    const segment = Math.random().toString(36).substring(2, 8).toUpperCase();
    segments.push(segment);
  }
  return `CITYV-${segments.join('-')}`;
}

// GET - Business üyeleri listele (YENİ SİSTEM)
export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT 
        bu.id,
        bu.email,
        bu.full_name,
        bu.company_name,
        bu.company_type,
        bu.company_city,
        bu.company_district,
        bu.phone,
        bu.created_at,
        bu.last_login,
        bu.is_active,
        bu.membership_type as plan_type,
        bu.membership_expiry_date as end_date,
        bu.max_cameras,
        CASE 
          WHEN bu.membership_expiry_date IS NULL THEN true
          WHEN bu.membership_expiry_date > NOW() THEN true
          ELSE false
        END as subscription_active
      FROM business_users bu
      WHERE bu.added_by_admin = true
      ORDER BY bu.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      members: result.rows
    });
  } catch (error) {
    console.error('❌ Business members list error:', error);
    return NextResponse.json(
      { success: false, error: 'Üyeler listelenemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni business üye ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Dashboard'dan gelen parametreler
    const {
      email,
      fullName,
      companyName,
      companyType = 'Diğer',
      companyAddress = '',
      companyCity = 'Ankara',
      companyDistrict = '',
      taxNumber = '',
      taxOffice = '',
      authorizedPerson,
      phone = '',
      password, // Admin'in belirlediği şifre
      planType = 'premium', // 'premium' veya 'enterprise' (subscriptionPlan olarak da gelebilir)
      startDate,
      endDate,
      maxUsers,
      isTrial = false,
      adminNotes = 'Admin tarafından manuel eklendi'
    } = body;

    // subscriptionPlan varsa onu kullan (eski versiyon uyumluluğu)
    const subscriptionPlan = body.subscriptionPlan || planType;
    const actualPlanType = subscriptionPlan;
    const monthlyPrice = actualPlanType === 'enterprise' ? 5000 : 2500;
    const actualMaxUsers = maxUsers || (actualPlanType === 'enterprise' ? 50 : 10);
    const features = actualPlanType === 'enterprise' 
      ? ['Sınırsız Kampanya', 'Gelişmiş Analitik', 'IoT Entegrasyonu', 'Öncelikli Destek', 'API Erişimi']
      : ['Kampanya Yönetimi', 'Temel Analitik', 'IoT Entegrasyonu', 'Email Destek'];

    // Validasyon
    if (!email || !companyName || !authorizedPerson || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, firma adı, yetkili kişi ve şifre zorunludur!' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Şifre en az 8 karakter olmalı!' },
        { status: 400 }
      );
    }

    // Email kontrolü
    const existingUser = await query(
      'SELECT id FROM business_users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Bu email adresi zaten business üye!' },
        { status: 400 }
      );
    }

    // Admin'in belirlediği şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lisans anahtarı oluştur
    const licenseKey = generateLicenseKey();

    // 1. Business user oluştur (YENİ SİSTEM: membership_type ile)
    const userResult = await query(`
      INSERT INTO business_users (
        email,
        password_hash,
        full_name,
        phone,
        company_name,
        company_type,
        company_address,
        company_city,
        company_district,
        tax_number,
        tax_office,
        authorized_person,
        added_by_admin,
        admin_notes,
        is_active,
        email_verified,
        membership_type,
        membership_expiry_date,
        max_cameras
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13, true, true, $14, $15, $16)
      RETURNING id
    `, [
      email,
      hashedPassword,
      fullName,
      phone,
      companyName,
      companyType,
      companyAddress,
      companyCity,
      companyDistrict,
      taxNumber,
      taxOffice,
      authorizedPerson,
      adminNotes,
      actualPlanType, // membership_type
      endDate, // membership_expiry_date
      actualMaxUsers // max_cameras (premium=10, enterprise=50)
    ]);

    const userId = userResult.rows[0].id;

    // 2. Business profile oluştur
    await query(`
      INSERT INTO business_profiles (
        user_id,
        business_name,
        business_type,
        address,
        city,
        district,
        phone,
        email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      userId,
      companyName,
      companyType,
      companyAddress,
      companyCity,
      companyDistrict,
      phone,
      email
    ]);

    // 3. Subscription oluştur
    await query(`
      INSERT INTO business_subscriptions (
        user_id,
        plan_type,
        start_date,
        end_date,
        is_active,
        monthly_price,
        license_key,
        max_users,
        is_trial,
        features
      ) VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, $9)
    `, [
      userId,
      actualPlanType,
      startDate,
      endDate,
      monthlyPrice,
      licenseKey,
      actualMaxUsers,
      isTrial,
      JSON.stringify(features)
    ]);

    // 4. Normal users tablosunda bu email'e sahip kullanıcı varsa membership_tier'ı güncelle
    const normalUserCheck = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (normalUserCheck.rows.length > 0) {
      const normalUserId = normalUserCheck.rows[0].id;
      // actualPlanType = 'premium' → membership_tier = 'business'
      // actualPlanType = 'enterprise' → membership_tier = 'enterprise'
      const actualTier = actualPlanType === 'premium' ? 'business' : 'enterprise';
      
      await query(`
        UPDATE users
        SET 
          membership_tier = $1
        WHERE id = $2
      `, [actualTier, normalUserId]);
      
      console.log(`✅ Normal user membership updated to: ${actualTier}`);
    }

    console.log('✅ Business member added:', {
      userId,
      email,
      companyName,
      actualPlanType,
      licenseKey
    });

    // Email gönder (YENİ SİSTEM - membership bilgileriyle)
    if (process.env.RESEND_API_KEY) {
      console.log('📧 Hoşgeldin email\'i gönderiliyor:', email);
      
      sendBusinessWelcomeEmail({
        companyName,
        email,
        authorizedPerson,
        password, // Admin'in belirlediği şifre
        licenseKey,
        planType: actualPlanType, // 'premium' veya 'enterprise'
        startDate: new Date().toLocaleDateString('tr-TR'),
        endDate: endDate ? new Date(endDate).toLocaleDateString('tr-TR') : 'Süresiz',
        monthlyPrice: actualPlanType === 'enterprise' ? 999 : 499, // Enterprise: 999₺, Premium: 499₺
        maxUsers: actualMaxUsers // Kamera limiti (premium=10, enterprise=50)
      }).then((result) => {
        if (result.success) {
          console.log('✅ Hoşgeldin email\'i gönderildi:', email);
        } else {
          console.error('⚠️ Email gönderilemedi:', result.error);
        }
      }).catch((err) => {
        console.error('⚠️ Email hatası:', err);
      });
    } else {
      console.warn('⚠️ RESEND_API_KEY tanımlı değil, email gönderilmedi');
    }

    return NextResponse.json({
      success: true,
      message: 'Business üye başarıyla eklendi',
      data: {
        userId,
        email,
        companyName,
        licenseKey,
        startDate,
        endDate
      }
    });

  } catch (error: any) {
    console.error('❌ Business member add error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Üye eklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Business üye güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updateData } = body;

    // Subscription güncelle
    if (updateData.subscription) {
      await query(`
        UPDATE business_subscriptions
        SET 
          end_date = COALESCE($1, end_date),
          is_active = COALESCE($2, is_active),
          plan_type = COALESCE($3, plan_type)
        WHERE user_id = $4
      `, [
        updateData.subscription.endDate,
        updateData.subscription.isActive,
        updateData.subscription.planType,
        userId
      ]);
    }

    // User bilgilerini güncelle
    if (updateData.user) {
      await query(`
        UPDATE business_users
        SET 
          is_active = COALESCE($1, is_active),
          admin_notes = COALESCE($2, admin_notes)
        WHERE id = $3
      `, [
        updateData.user.isActive,
        updateData.user.adminNotes,
        userId
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Üye bilgileri güncellendi'
    });

  } catch (error) {
    console.error('❌ Business member update error:', error);
    return NextResponse.json(
      { success: false, error: 'Üye güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Business üyeliği iptal et (kullanıcıyı free üyeliğe dönüştür)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId gerekli' },
        { status: 400 }
      );
    }

    // 1. Business user'ı free'e düşür (YENİ SİSTEM)
    await query(`
      UPDATE business_users
      SET 
        membership_type = 'free',
        max_cameras = 1,
        membership_expiry_date = NULL
      WHERE id = $1
    `, [userId]);

    console.log(`✅ Business user ${userId} reverted to free membership`);

    // 2. Normal users tablosunda varsa membership'i free yap
    const userEmail = await query(
      'SELECT email FROM business_users WHERE id = $1',
      [userId]
    );

    if (userEmail.rows.length > 0) {
      const email = userEmail.rows[0].email;
      
      // Normal users tablosunda bu email'e sahip kullanıcı var mı?
      const normalUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (normalUser.rows.length > 0) {
        // Kullanıcıyı free üyeliğe dönüştür
        await query(`
          UPDATE users
          SET membership_tier = 'free'
          WHERE email = $1
        `, [email]);
        
        console.log(`✅ Normal user ${email} also reverted to free tier`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı business üyelikten çıkarıldı ve free üyeliğe dönüştürüldü'
    });

  } catch (error) {
    console.error('❌ Business member delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Üyelik iptal edilirken hata oluştu' },
      { status: 500 }
    );
  }
}
