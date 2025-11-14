require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function fixWorkingHours() {
  // Bugün Cuma - Friday
  const correctHours = {
    isOpen24Hours: false,
    monday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
    friday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },  // CUMA AÇIK!
    saturday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
    sunday: { isOpen: true, openTime: '09:00', closeTime: '20:00' }
  };

  await sql`
    UPDATE business_profiles
    SET working_hours = ${JSON.stringify(correctHours)}::jsonb
    WHERE user_id = 6
  `;

  console.log('✅ Working hours güncellendi - Cuma açık!');
  console.log('   08:00-22:00 hafta içi, 09:00-23:00 Cumartesi, 09:00-20:00 Pazar');
}

fixWorkingHours();
