const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function resetBusinessUserPassword() {
  try {
    const email = 'atmbankde@gmail.com';
    const newPassword = 'test123';
    
    console.log(`🔄 Resetting password for ${email}...`);
    console.log(`🔑 New password: ${newPassword}`);
    
    // Hash yeni şifreyi
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log(`📋 New hash generated (length: ${hashedPassword.length})`);
    
    // Database'i güncelle
    const result = await sql`
      UPDATE business_users 
      SET password_hash = ${hashedPassword}
      WHERE email = ${email}
      RETURNING email, full_name
    `;
    
    if (result.length > 0) {
      console.log(`✅ Password updated for: ${result[0].full_name} (${result[0].email})`);
      
      // Test et
      console.log('\n🧪 Testing new password...');
      const isValid = await bcrypt.compare(newPassword, hashedPassword);
      console.log(`✅ Password test: ${isValid ? 'VALID' : 'FAILED'}`);
      
    } else {
      console.log('❌ No user updated');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetBusinessUserPassword();