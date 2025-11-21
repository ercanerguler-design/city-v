const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';
const jwt = require('jsonwebtoken');

async function testMenuCategoriesAPI() {
  console.log('🧪 Menu Categories API Test Başlıyor...\n');
  
  // Test JWT token oluştur
  const testUser = { userId: 1, email: 'test@business.com' };
  const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });
  
  console.log('🔑 JWT Token oluşturuldu:', token.substring(0, 50) + '...\n');
  
  const baseUrl = 'https://city-v-chi-two.vercel.app';
  
  // Test 1: GET Categories (with auth)
  console.log('📋 Test 1: GET Categories (Authentication ile)');
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/categories?businessId=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ GET Categories BAŞARILI\n');
    } else {
      console.log('❌ GET Categories HATA\n');
    }
  } catch (error) {
    console.error('❌ GET Categories ERROR:', error.message, '\n');
  }
  
  // Test 2: POST New Category (with auth)
  console.log('📝 Test 2: POST New Category (Authentication ile)');
  try {
    const newCategory = {
      businessId: 1,
      name: 'Test Kategori API',
      icon: '🧪',
      displayOrder: 99
    };
    
    const response = await fetch(`${baseUrl}/api/business/menu/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCategory)
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ POST Category BAŞARILI\n');
    } else {
      console.log('❌ POST Category HATA\n');
    }
  } catch (error) {
    console.error('❌ POST Category ERROR:', error.message, '\n');
  }
  
  // Test 3: GET Categories without auth (should fail)
  console.log('🚫 Test 3: GET Categories (Authentication olmadan - 401 bekleniyor)');
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/categories?businessId=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Authentication kontrolü çalışıyor (401)\n');
    } else {
      console.log('❌ Authentication kontrolü başarısız\n');
    }
  } catch (error) {
    console.error('❌ No Auth Test ERROR:', error.message, '\n');
  }
  
  // Test 4: POST without auth (should fail)
  console.log('🚫 Test 4: POST Category (Authentication olmadan - 401 bekleniyor)');
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        businessId: 1,
        name: 'Unauthorized Test'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ POST Authentication kontrolü çalışıyor (401)\n');
    } else {
      console.log('❌ POST Authentication kontrolü başarısız\n');
    }
  } catch (error) {
    console.error('❌ POST No Auth Test ERROR:', error.message, '\n');
  }
}

testMenuCategoriesAPI();