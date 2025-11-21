const jwt = require('jsonwebtoken');

async function debugToken() {
  console.log('🔍 Token Debug Test');
  
  try {
    // Test login
    const loginResponse = await fetch('https://city-v-chi-two.vercel.app/api/business/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'atmbankde@gmail.com',
        password: 'test123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🎫 Login response:', loginData.success);
    
    if (!loginData.token) {
      console.log('❌ No token received');
      return;
    }
    
    const token = loginData.token;
    console.log('🔐 Token (full):', token);
    
    // Token'ı decode et (verify etmeden)
    const decoded = jwt.decode(token, { complete: true });
    console.log('\n🧩 Token header:', decoded.header);
    console.log('📦 Token payload:', decoded.payload);
    
    // JWT secret'larını test et
    const secrets = [
      'cityv-business-secret-2024',
      'cityv-business-secret-key-2024'
    ];
    
    console.log('\n🔑 JWT Secret Test:');
    for (const secret of secrets) {
      try {
        const verified = jwt.verify(token, secret);
        console.log(`✅ "${secret}": VALID - ${JSON.stringify(verified)}`);
      } catch (error) {
        console.log(`❌ "${secret}": ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug hatası:', error);
  }
}

debugToken();