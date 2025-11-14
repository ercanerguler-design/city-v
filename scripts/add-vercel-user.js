const { sql } = require('@vercel/postgres');

async function addBusinessUserToVercel() {
  try {
    console.log('🚀 Adding business user to Vercel Postgres...\n');

    // 1. Business user ekle
    console.log('👤 Creating business user...');
    const userResult = await sql`
      INSERT INTO business_users (
        email,
        password_hash,
        full_name,
        phone,
        added_by_admin,
        is_active,
        created_at
      ) VALUES (
        'test@business.com',
        '$2b$10$qPexqbRXkweWPqpCboEzFePfxeoWNQAH7RTr0LV73aRnI1w9OM5P.',
        'Test Business User',
        '+905551234567',
        true,
        true,
        NOW()
      )
      ON CONFLICT (email) 
      DO UPDATE SET
        password_hash = '$2b$10$qPexqbRXkweWPqpCboEzFePfxeoWNQAH7RTr0LV73aRnI1w9OM5P.',
        is_active = true,
        added_by_admin = true
      RETURNING id, email, full_name
    `;
    
    const userId = userResult.rows[0].id;
    console.log('✅ User created/updated:', userResult.rows[0]);

    // 2. Business profile ekle
    console.log('\n🏢 Creating business profile...');
    
    // Önce var mı kontrol et
    const existingProfile = await sql`
      SELECT id FROM business_profiles WHERE user_id = ${userId}
    `;
    
    if (existingProfile.rows.length > 0) {
      await sql`
        UPDATE business_profiles 
        SET business_name = 'Test İşletmesi',
            business_type = 'retail',
            address = 'Test Adres, Ankara',
            city = 'Ankara',
            updated_at = NOW()
        WHERE user_id = ${userId}
      `;
      console.log('✅ Profile updated');
    } else {
      await sql`
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
      `;
      console.log('✅ Profile created');
    }

    // 3. Premium subscription ekle
    console.log('\n💎 Creating premium subscription...');
    
    const existingSub = await sql`
      SELECT id FROM business_subscriptions WHERE user_id = ${userId}
    `;
    
    if (existingSub.rows.length > 0) {
      await sql`
        UPDATE business_subscriptions
        SET plan_type = 'premium',
            is_active = true,
            end_date = NOW() + INTERVAL '1 year',
            monthly_price = 249.00,
            updated_at = NOW()
        WHERE user_id = ${userId}
      `;
      console.log('✅ Subscription updated to premium');
    } else {
      await sql`
        INSERT INTO business_subscriptions (
          user_id,
          plan_type,
          start_date,
          end_date,
          is_active,
          monthly_price,
          license_key
        ) VALUES (
          ${userId},
          'premium',
          NOW(),
          NOW() + INTERVAL '1 year',
          true,
          249.00,
          'TEST-PREMIUM-' || ${userId}
        )
      `;
      console.log('✅ Subscription created');
    }

    console.log('\n🎉 SUCCESS! Test user ready on Vercel!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email: test@business.com');
    console.log('🔑 Password: test123');
    console.log('💎 Plan: Premium (10 cameras)');
    console.log('🌐 URL: https://city-v-kopya-3.vercel.app/business/login');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Direkt çalıştır - environment variables Vercel'den gelecek
addBusinessUserToVercel()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
