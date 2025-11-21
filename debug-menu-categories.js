async function debugMenuCategoriesAPI() {
  console.log('🔍 Menu Categories API Debug...\n');
  
  const baseUrl = 'https://city-v-chi-two.vercel.app';
  
  // Test 1: Database connection test
  console.log('📋 Test 1: Database Connection Test');
  try {
    const response = await fetch(`${baseUrl}/api/test-db`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Database Test Status:', response.status);
    const data = await response.json();
    console.log('Database Test Response:', JSON.stringify(data, null, 2), '\n');
  } catch (error) {
    console.error('❌ Database Test ERROR:', error.message, '\n');
  }
  
  // Test 2: Check if business_menu_categories table exists
  console.log('🗄️ Test 2: Business Menu Categories Table Check');
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/debug`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Menu Debug Status:', response.status);
    if (response.status === 404) {
      console.log('⚠️ Menu Debug API yok, manuel kontrol gerekli\n');
    } else {
      const data = await response.json();
      console.log('Menu Debug Response:', JSON.stringify(data, null, 2), '\n');
    }
  } catch (error) {
    console.error('❌ Menu Debug ERROR:', error.message, '\n');
  }
  
  // Test 3: Test with different JWT
  console.log('🔑 Test 3: JWT Token Test');
  const jwt = require('jsonwebtoken');
  
  // Test farklı secret'lar
  const secrets = [
    'cityv-business-secret-key-2024',
    process.env.JWT_SECRET || 'cityv-business-secret-key-2024',
    'your-jwt-secret-key',
    'cityv-secret-2024'
  ];
  
  secrets.forEach((secret, index) => {
    try {
      const testUser = { userId: 1, email: 'test@business.com' };
      const token = jwt.sign(testUser, secret, { expiresIn: '1h' });
      console.log(`🔑 Secret ${index + 1} (${secret.substring(0, 20)}...): ${token.substring(0, 50)}...`);
    } catch (error) {
      console.log(`❌ Secret ${index + 1} HATA:`, error.message);
    }
  });
  
  console.log('\n🧪 Test 4: Simple GET Request (No Auth)');
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/categories?businessId=1`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('No Auth Status:', response.status);
    const data = await response.json();
    console.log('No Auth Response:', JSON.stringify(data, null, 2), '\n');
  } catch (error) {
    console.error('❌ No Auth Test ERROR:', error.message, '\n');
  }
}

debugMenuCategoriesAPI();