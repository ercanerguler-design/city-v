const { neon } = require('@neondatabase/serverless');

async function resetBusinessPassword() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔧 Business user şifresini kontrol ediyoruz...');
    
    // Mevcut şifreyi kontrol et
    const currentUser = await sql`
      SELECT id, email, password 
      FROM business_users 
      WHERE email = 'atmbankde@gmail.com'
    `;
    
    if (currentUser.length > 0) {
      console.log('👤 Mevcut user:');
      console.log(`  - ID: ${currentUser[0].id}`);
      console.log(`  - Email: ${currentUser[0].email}`);
      console.log(`  - Password hash (first 20): ${currentUser[0].password.substring(0, 20)}...`);
      
      // Test için basit password hash'i güncelleyelim
      // Production'da proper bcrypt hash kullanılacak
      console.log('\n🔧 Test amaçlı simple password hash güncelleniyor...');
      
      const testPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // bcrypt hash of 'password'
      
      const result = await sql`
        UPDATE business_users 
        SET password = ${testPassword}
        WHERE email = 'atmbankde@gmail.com'
        RETURNING id, email
      `;
      
      console.log('✅ Test password hash güncellendi');
      console.log('🔑 Test password: "password"');
      
    } else {
      console.log('❌ User bulunamadı');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

resetBusinessPassword();