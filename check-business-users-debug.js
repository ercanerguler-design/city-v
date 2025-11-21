const { neon } = require('@neondatabase/serverless');

async function checkBusinessUsers() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('📋 Business users kontrol ediliyor...');
    
    const users = await sql`
      SELECT id, email, created_at
      FROM business_users
    `;
    
    console.log('👥 Toplam business user:', users.length);
    
    users.forEach(u => {
      console.log(`  - ID: ${u.id}`);
      console.log(`    Email: ${u.email}`);
      console.log(`    Created: ${u.created_at}`);
      console.log('');
    });
    
    // Business profile'larını kontrol et
    const profiles = await sql`
      SELECT id, user_id, business_name 
      FROM business_profiles
    `;
    
    console.log('🏢 Business profiles:');
    profiles.forEach(p => {
      console.log(`  - Profile ID: ${p.id}, User ID: ${p.user_id}, Name: ${p.business_name}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkBusinessUsers();