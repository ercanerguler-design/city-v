const fetch = require('node-fetch');

async function testMeAPI() {
  try {
    console.log('🧪 Testing /api/business/me endpoint...\n');
    
    // Get token from login
    const loginRes = await fetch('http://localhost:3003/api/business/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'atmbankde@gmail.com',
        password: 'your_password_here' // Gerçek şifreyi gir
      })
    });
    
    const loginData = await loginRes.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.error);
      console.log('\n⚠️  Please update the password in this script');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful');
    console.log('   Token:', token.substring(0, 20) + '...');
    
    // Test /api/business/me
    console.log('\n🔍 Calling /api/business/me...');
    const meRes = await fetch('http://localhost:3003/api/business/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const meData = await meRes.json();
    
    if (meData.success) {
      console.log('\n✅ /api/business/me response:');
      console.log('   User:');
      console.log(`     ID: ${meData.user.id}`);
      console.log(`     Email: ${meData.user.email}`);
      console.log(`     Name: ${meData.user.fullName}`);
      console.log(`     Membership: ${meData.user.membership_type}`);
      console.log(`     Max Cameras: ${meData.user.max_cameras}`);
      console.log(`     Campaign Credits: ${meData.user.campaign_credits}`);
      
      console.log('\n   Profile:');
      console.log(`     Business Name: ${meData.profile?.business_name || 'NULL'}`);
      console.log(`     City: ${meData.profile?.city || 'NULL'}`);
      console.log(`     Visible on Map: ${meData.profile?.is_visible_on_map}`);
      
      console.log('\n🎉 API works correctly!');
    } else {
      console.log('❌ API error:', meData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMeAPI();
