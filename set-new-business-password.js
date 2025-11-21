const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function setNewPassword() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔧 Business user için yeni şifre belirleniyor...');
    
    const newPassword = 'test123';
    const saltRounds = 10;
    
    console.log(`🔑 Yeni şifre: "${newPassword}"`);
    console.log('🔐 Hash oluşturuluyor...');
    
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log(`📝 Hash: ${hashedPassword.substring(0, 30)}...`);
    
    const result = await sql`
      UPDATE business_users 
      SET password_hash = ${hashedPassword}
      WHERE email = 'atmbankde@gmail.com'
      RETURNING id, email, full_name
    `;
    
    if (result.length > 0) {
      console.log('✅ Şifre başarıyla güncellendi:');
      console.log(`  - User ID: ${result[0].id}`);
      console.log(`  - Email: ${result[0].email}`);
      console.log(`  - Full Name: ${result[0].full_name}`);
      console.log(`  - New Password: ${newPassword}`);
    } else {
      console.log('❌ User güncellenemedi');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

setNewPassword();