const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function addMerveUser() {
  try {
    console.log('🔐 Creating user for mervererguler93@gmail.com...');
    
    const password = 'Ka250806Ka';
    const passwordHash = await bcrypt.hash(password, 10);
    
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
        'mervererguler93@gmail.com',
        ${passwordHash},
        'Merve Erguler',
        '+905551234567',
        true,
        true,
        NOW()
      )
      ON CONFLICT (email) 
      DO UPDATE SET
        password_hash = ${passwordHash},
        is_active = true,
        added_by_admin = true
      RETURNING id, email, full_name
    `;
    
    const userId = userResult.rows[0].id;
    console.log('✅ User created:', userResult.rows[0]);

    // Profile
    const existingProfile = await sql`
      SELECT id FROM business_profiles WHERE user_id = ${userId}
    `;
    
    if (existingProfile.rows.length === 0) {
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
          'Merve İşletme',
          'retail',
          'Ankara',
          'Ankara',
          NOW()
        )
      `;
      console.log('✅ Profile created');
    } else {
      console.log('ℹ️  Profile already exists');
    }

    // Subscription
    const existingSub = await sql`
      SELECT id FROM business_subscriptions WHERE user_id = ${userId}
    `;
    
    if (existingSub.rows.length === 0) {
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
          'MERVE-PREMIUM-001'
        )
      `;
      console.log('✅ Subscription created');
    } else {
      console.log('ℹ️  Subscription already exists');
    }

    console.log('\n🎉 SUCCESS!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email: merveerguler@gmail.com');
    console.log('🔑 Password: test123');
    console.log('💎 Plan: Premium (10 cameras)');
    console.log('🌐 URL: https://city-v.com/business/login');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addMerveUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
