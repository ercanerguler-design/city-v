// Test business login API directly
async function testBusinessLogin() {
  const loginData = {
    email: 'atmbankde@gmail.com',
    password: 'test123'
  };

  try {
    console.log('🧪 Testing business login API...');
    console.log('📧 Email:', loginData.email);
    console.log('🔑 Password:', loginData.password);

    const response = await fetch('https://city-v.com/api/business/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📋 Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Login API test SUCCESS!');
    } else {
      console.log('❌ Login API test FAILED!');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser
  testBusinessLogin();
} else {
  // Node.js
  const fetch = require('node-fetch');
  testBusinessLogin();
}