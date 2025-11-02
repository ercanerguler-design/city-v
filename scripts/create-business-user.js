const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function createBusinessUser() {
  try {
    // Test kullanıcısı bilgileri
    const email = 'test@business.com';
    const password = 'test123';
    const fullName = 'Test Business User';
    const phone = '+905551234567';
    
    console.log('🔐 Creating business user...');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    
    // Şifreyi hashle
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');
    
    // Kullanıcıyı ekle
    const result = await sql`
      INSERT INTO business_users (
        email,
        password_hash,
        full_name,
        phone,
        added_by_admin,
        is_active,
        created_at
      ) VALUES (
        ${email},
        ${passwordHash},
        ${fullName},
        ${phone},
        true,
        true,
        NOW()
      )
      ON CONFLICT (email) 
      DO UPDATE SET
        password_hash = ${passwordHash},
        full_name = ${fullName},
        phone = ${phone},
        added_by_admin = true,
        is_active = true
      RETURNING id, email, full_name
    `;
    
    console.log('✅ Business user created/updated:', result.rows[0]);
    
    // Business profile oluştur
    const userId = result.rows[0].id;
    
    // Önce mevcut profil var mı kontrol et
    const existingProfile = await sql`
      SELECT id FROM business_profiles WHERE user_id = ${userId}
    `;
    
    let profileResult;
    if (existingProfile.rows.length > 0) {
      // Güncelle
      profileResult = await sql`
        UPDATE business_profiles 
        SET business_name = 'Test İşletmesi',
            business_type = 'retail',
            address = 'Test Adres, Ankara',
            city = 'Ankara',
            updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING id, business_name, business_type
      `;
      console.log('✅ Business profile updated');
    } else {
      // Yeni oluştur
      profileResult = await sql`
        INSERT INTO business_profiles (
          user_id,
          business_name,
          business_type,
          address,
          city,
          created_at
        ) VALUES (
          ${userId},
          'Test İşletmesi',
          'retail',
          'Test Adres, Ankara',
          'Ankara',
          NOW()
        )
        RETURNING id, business_name, business_type
      `;
      console.log('✅ Business profile created');
    }
    
    console.log('✅ Business profile:', profileResult.rows[0]);
    
    // Business subscription'ı atlıyoruz (tablo yapısı farklı olabilir)
    console.log('ℹ️  Skipping subscription creation (optional)');
    
    console.log('\n🎉 SUCCESS! Use these credentials to login:');
    console.log('📧 Email: test@business.com');
    console.log('🔑 Password: test123');
    console.log('🌐 URL: http://localhost:3000/business/login');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

createBusinessUser()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
