const bcrypt = require('bcryptjs');

async function testPassword() {
  const hash = '$2b$12$3KSpJThvta19kjUTL2jAM.PAGkbGoBaiZkhSBSkb9gr6MQ7OB3VMi';
  
  console.log('🔐 Password hash test');
  
  const passwords = ['cityv123', '123456', 'password', 'admin', '12345'];
  
  for (const pwd of passwords) {
    try {
      const isMatch = await bcrypt.compare(pwd, hash);
      console.log(`"${pwd}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
    } catch (error) {
      console.log(`"${pwd}": ❌ Error - ${error.message}`);
    }
  }
}

testPassword();