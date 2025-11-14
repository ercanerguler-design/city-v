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
        bu.license_key,
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

    // Tarih kontrolü - eğer verilmemişse otomatik ata
    const actualStartDate = startDate || new Date().toISOString().split('T')[0];
    const actualEndDate = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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

    // Email kontrolü - SADECE AKTIF admin eklentilerini kontrol et
    const existingUser = await query(
      'SELECT id, added_by_admin FROM business_users WHERE email = $1 AND added_by_admin = true',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Bu email adresi zaten aktif business üye!' },
        { status: 400 }
      );
    }

    console.log(`✅ Email ${email} kullanılabilir (added_by_admin=true olan kayıt yok)`);

    // Ek kontrol: Herhangi bir business_users kaydı var mı?
    const anyUser = await query(
      'SELECT id, email, added_by_admin FROM business_users WHERE email = $1',
      [email]
    );
    
    if (anyUser.rows.length > 0) {
      console.log(`⚠️ UYARI: ${email} için business_users kaydı mevcut ama added_by_admin=false:`, anyUser.rows[0]);
      // Bu durumda eski kaydı sil
      await query('DELETE FROM business_users WHERE email = $1 AND added_by_admin = false', [email]);
      console.log(`🗑️ Eski (added_by_admin=false) kayıt silindi`);
    }

    // BACKUP kontrolü - Daha önce silinmiş mi?
    const backupProfiles = await query(
      'SELECT * FROM business_profiles_backup WHERE user_email = $1 ORDER BY deleted_at DESC',
      [email]
    );

    const hasBackup = backupProfiles.rows.length > 0;
    console.log(hasBackup ? `📦 ${email} için ${backupProfiles.rows.length} backup bulundu` : '🆕 Yeni kullanıcı, backup yok');

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
        max_cameras,
        license_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13, true, true, $14, $15, $16, $17)
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
      actualEndDate, // membership_expiry_date - otomatik atanan veya gelen tarih
      actualMaxUsers, // max_cameras (premium=10, enterprise=50)
      licenseKey // license_key
    ]);

    const userId = userResult.rows[0].id;

    // 2. Business profile oluştur (veya backup'tan restore et)
    let profileId;
    
    if (hasBackup) {
      // BACKUP varsa restore et
      const backup = backupProfiles.rows[0];
      const profileResult = await query(`
        INSERT INTO business_profiles (
          user_id, business_name, business_type, logo_url, description,
          address, city, district, postal_code, latitude, longitude,
          phone, email, website, working_hours, social_media, photos
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        userId, backup.business_name, backup.business_type, backup.logo_url,
        backup.description, backup.address, backup.city, backup.district,
        backup.postal_code, backup.latitude, backup.longitude, backup.phone,
        backup.email, backup.website, backup.working_hours, backup.social_media,
        backup.photos
      ]);
      profileId = profileResult.rows[0].id;
      
      // Backup kaydını güncelle
      await query(`
        UPDATE business_profiles_backup 
        SET restore_count = restore_count + 1, last_restored_at = NOW()
        WHERE id = $1
      `, [backup.id]);
      
      console.log(`✅ Profile backup'tan restore edildi (ID: ${profileId})`);
    } else {
      // Yeni profil oluştur
      const profileResult = await query(`
        INSERT INTO business_profiles (
          user_id, business_name, business_type, address, city, district, phone, email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        userId, companyName, companyType, companyAddress, companyCity,
        companyDistrict, phone, email
      ]);
      profileId = profileResult.rows[0].id;
      console.log(`✅ Yeni profile oluşturuldu (ID: ${profileId})`);
    }

    // 2.1. Eğer backup varsa cameras ve campaigns'i de restore et
    if (hasBackup) {
      // Cameras restore
      const backupCameras = await query(`
        SELECT * FROM business_cameras_backup WHERE user_email = $1
      `, [email]);
      
      for (const cam of backupCameras.rows) {
        await query(`
          INSERT INTO business_cameras (
            business_id, camera_name, ip_address, port, location_description,
            stream_url, resolution, ai_enabled, zones, calibration_line, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
        `, [
          profileId, cam.camera_name, cam.ip_address, cam.port,
          cam.location_description, cam.stream_url, cam.resolution,
          cam.ai_enabled, cam.zones, cam.calibration_line
        ]);
      }
      console.log(`✅ ${backupCameras.rows.length} kamera restore edildi`);
      
      // Campaigns restore
      const backupCampaigns = await query(`
        SELECT * FROM business_campaigns_backup WHERE user_email = $1
      `, [email]);
      
      for (const camp of backupCampaigns.rows) {
        await query(`
          INSERT INTO business_campaigns (
            business_id, title, description, discount_percent, discount_amount,
            start_date, end_date, target_audience, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        `, [
          profileId, camp.title, camp.description, camp.discount_percent,
          camp.discount_amount, camp.start_date, camp.end_date, camp.target_audience
        ]);
      }
      console.log(`✅ ${backupCampaigns.rows.length} kampanya restore edildi`);
    }

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
      actualStartDate, // otomatik atanan başlangıç tarihi
      actualEndDate, // otomatik atanan bitiş tarihi
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
    console.log('📧 Email gönderim kontrolü başlıyor...');
    console.log('🔑 RESEND_API_KEY var mı:', !!process.env.RESEND_API_KEY);
    
    if (process.env.RESEND_API_KEY) {
      console.log('📧 Hoşgeldin email\'i gönderiliyor:', email);
      
      try {
        const emailResult = await sendBusinessWelcomeEmail({
          companyName,
          email,
          authorizedPerson,
          password, // Admin'in belirlediği şifre
          licenseKey,
          planType: actualPlanType, // 'premium' veya 'enterprise'
          startDate: new Date(actualStartDate).toLocaleDateString('tr-TR'),
          endDate: new Date(actualEndDate).toLocaleDateString('tr-TR'),
          monthlyPrice: actualPlanType === 'enterprise' ? 5000 : 2500,
          maxUsers: actualMaxUsers // Kamera limiti (premium=10, enterprise=50)
        });
        
        if (emailResult.success) {
          console.log('✅ Hoşgeldin email\'i başarıyla gönderildi:', email);
        } else {
          console.error('❌ Email gönderilemedi:', emailResult.error);
        }
      } catch (err) {
        console.error('❌ Email gönderim hatası:', err);
      }
    } else {
      console.warn('⚠️ RESEND_API_KEY tanımlı değil, email gönderilmedi');
      console.warn('💡 Email göndermek için .env.local dosyasına RESEND_API_KEY ekleyin');
    }

    const message = hasBackup 
      ? `Business üye başarıyla eklendi ve eski verileri restore edildi! ${backupProfiles.rows.length} mekan verisi geri yüklendi.`
      : 'Business üye başarıyla eklendi';

    return NextResponse.json({
      success: true,
      message,
      restored: hasBackup,
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

// PUT - Business üye güncelle (Üyelik süresi uzatma dahil)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updateData } = body;

    console.log(`📝 Business user ${userId} güncelleniyor...`, updateData);

    // Membership bilgilerini güncelle (membership_expiry_date dahil)
    if (updateData.membership) {
      // Membership type'a göre otomatik max_cameras ayarla
      const membershipType = updateData.membership.membershipType;
      let maxCameras = updateData.membership.maxCameras;
      
      if (membershipType && !maxCameras) {
        // Eğer max_cameras belirtilmemişse, plan tipine göre otomatik ata
        const cameraLimits: { [key: string]: number } = {
          'free': 1,
          'premium': 10,
          'enterprise': 50,
          'business': 10
        };
        maxCameras = cameraLimits[membershipType] || 1;
        console.log(`📸 ${membershipType} planı için ${maxCameras} kamera limiti otomatik atandı`);
      }
      
      await query(`
        UPDATE business_users
        SET 
          membership_type = COALESCE($1, membership_type),
          membership_expiry_date = COALESCE($2, membership_expiry_date),
          max_cameras = COALESCE($3, max_cameras)
        WHERE id = $4
      `, [
        membershipType,
        updateData.membership.expiryDate,
        maxCameras,
        userId
      ]);
      console.log(`✅ Membership bilgileri güncellendi - ${membershipType}: ${maxCameras} kamera`);
    }

    // Subscription güncelle
    if (updateData.subscription) {
      await query(`
        UPDATE business_subscriptions
        SET 
          end_date = COALESCE($1, end_date),
          is_active = COALESCE($2, is_active),
          plan_type = COALESCE($3, plan_type),
          monthly_price = COALESCE($4, monthly_price)
        WHERE user_id = $5
      `, [
        updateData.subscription.endDate,
        updateData.subscription.isActive,
        updateData.subscription.planType,
        updateData.subscription.monthlyPrice,
        userId
      ]);
      console.log(`✅ Subscription güncellendi`);
    }

    // User bilgilerini güncelle
    if (updateData.user) {
      await query(`
        UPDATE business_users
        SET 
          is_active = COALESCE($1, is_active),
          admin_notes = COALESCE($2, admin_notes),
          full_name = COALESCE($3, full_name),
          phone = COALESCE($4, phone)
        WHERE id = $5
      `, [
        updateData.user.isActive,
        updateData.user.adminNotes,
        updateData.user.fullName,
        updateData.user.phone,
        userId
      ]);
      console.log(`✅ User bilgileri güncellendi`);
    }

    return NextResponse.json({
      success: true,
      message: 'Üye bilgileri başarıyla güncellendi'
    });

  } catch (error) {
    console.error('❌ Business member update error:', error);
    return NextResponse.json(
      { success: false, error: 'Üye güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Business üyeyi VE TÜM VERİLERİNİ tamamen sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    console.log(`🗑️ DELETE request alındı. User ID: ${userId}`);

    if (!userId) {
      console.error('❌ userId parametresi yok');
      return NextResponse.json(
        { success: false, error: 'userId gerekli' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Business user ${userId} siliniyor...`);

    // 1. Email'i al
    console.log(`📧 Email alınıyor...`);
    const userResult = await query(
      'SELECT email FROM business_users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`❌ Kullanıcı bulunamadı: ${userId}`);
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const email = userResult.rows[0].email;
    console.log(`✅ Email bulundu: ${email}`);

    // 2. İlişkili kayıtları sil (try-catch ile güvenli silme)
    console.log(`🗑️ İlişkili veriler siliniyor...`);
    
    // 1. Önce business_profiles'dan ID'leri al
    try {
      const profiles = await query('SELECT id FROM business_profiles WHERE user_id = $1', [userId]);
      const profileIds = profiles.rows.map((p: any) => p.id);
      console.log(`📋 ${profileIds.length} business profile bulundu`);
      
      // 2. Profile'a bağlı tabloları sil (varsa)
      if (profileIds.length > 0) {
        // Campaigns
        try {
          const campaignsDeleted = await query(
            'DELETE FROM business_campaigns WHERE business_id = ANY($1)',
            [profileIds]
          );
          console.log(`✅ ${campaignsDeleted.rowCount || 0} kampanya silindi`);
        } catch (e: any) {
          console.log(`ℹ️ Campaigns silinemedi (tablo yok olabilir): ${e.message}`);
        }
        
        // Cameras (business_id field'ı ile)
        try {
          const camerasByProfile = await query(
            'DELETE FROM business_cameras WHERE business_id = ANY($1)',
            [profileIds]
          );
          console.log(`✅ ${camerasByProfile.rowCount || 0} kamera (business_id) silindi`);
        } catch (e: any) {
          console.log(`ℹ️ Cameras (business_id) silinemedi: ${e.message}`);
        }
      }
    } catch (e: any) {
      console.log(`ℹ️ Profiles sorgusu başarısız: ${e.message}`);
    }
    
    // 3. Business_user_id ile kameraları sil
    try {
      const camerasByUser = await query(
        'DELETE FROM business_cameras WHERE business_user_id = $1',
        [userId]
      );
      console.log(`✅ ${camerasByUser.rowCount || 0} kamera (business_user_id) silindi`);
    } catch (e: any) {
      console.log(`ℹ️ Cameras (business_user_id) silinemedi: ${e.message}`);
    }
    
    // 4. Business subscriptions sil
    try {
      const subscriptionsDeleted = await query(
        'DELETE FROM business_subscriptions WHERE user_id = $1',
        [userId]
      );
      console.log(`✅ ${subscriptionsDeleted.rowCount || 0} subscription silindi`);
    } catch (e: any) {
      console.log(`ℹ️ Subscriptions silinemedi: ${e.message}`);
    }
    
    // 5. Business profiles sil
    try {
      const profilesDeleted = await query(
        'DELETE FROM business_profiles WHERE user_id = $1',
        [userId]
      );
      console.log(`✅ ${profilesDeleted.rowCount || 0} profil silindi`);
    } catch (e: any) {
      console.log(`ℹ️ Profiles silinemedi: ${e.message}`);
    }
    
    // 6. Son olarak business_users'ı sil (bu MUTLAKA başarılı olmalı)
    const userDeleted = await query(
      'DELETE FROM business_users WHERE id = $1',
      [userId]
    );
    console.log(`✅ Business user silindi (${userDeleted.rowCount || 0} satır)`);
    
    // 7. Normal users tablosunda varsa membership'i free yap
    try {
      const normalUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (normalUser.rows.length > 0) {
        await query(
          'UPDATE users SET membership_tier = $1 WHERE email = $2',
          ['free', email]
        );
        console.log(`✅ Normal user free üyeliğe dönüştürüldü`);
      }
    } catch (e) {
      console.log('ℹ️ Normal user tabloda bulunamadı (sorun değil)');
    }

    return NextResponse.json({
      success: true,
      message: 'Business üye ve tüm ilişkili veriler başarıyla silindi'
    });

  } catch (error: any) {
    console.error('❌ Business member delete error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Üyelik silinirken hata oluştu', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
