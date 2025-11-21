const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';
const jwt = require('jsonwebtoken');

async function finalMenuCategoriesTest() {
  console.log('🎯 FINAL Menu Categories API Test\n');
  
  // Test JWT token oluştur
  const testUser = { userId: 1, email: 'test@business.com' };
  const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });
  
  console.log('🔑 JWT Token:', token.substring(0, 80) + '...\n');
  
  const baseUrl = 'https://city-v-chi-two.vercel.app';
  
  // Test 1: GET Categories WITH AUTH
  console.log('📋 Test 1: GET Categories (WITH AUTH)');
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/categories?businessId=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Status:', response.status);
    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success) {
      console.log('🎉 GET Categories BAŞARILI!\n');
      console.log(`📊 Toplam kategori: ${data.categories?.length || 0}\n`);
    } else {
      console.log('❌ GET Categories BAŞARISIZ\n');
    }
  } catch (error) {
    console.error('❌ GET ERROR:', error.message, '\n');
  }
  
  // Test 2: POST New Category WITH AUTH
  console.log('📝 Test 2: POST New Category (WITH AUTH)');
  try {
    const newCategory = {
      businessId: 1,
      name: `Final Test ${Date.now()}`,
      icon: '🎯',
      displayOrder: 100
    };
    
    const response = await fetch(`${baseUrl}/api/business/menu/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCategory)
    });
    
    console.log('✅ Status:', response.status);
    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success) {
      console.log('🎉 POST Category BAŞARILI!\n');
      
      // Yeni eklenen kategoriyi sil (cleanup)
      if (data.category?.id) {
        console.log('🗑️ Cleanup: Test kategorisini siliniyor...');
        const deleteResponse = await fetch(`${baseUrl}/api/business/menu/categories?categoryId=${data.category.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (deleteResponse.status === 200) {
          console.log('✅ Test kategorisi silindi\n');
        } else {
          console.log('⚠️ Test kategorisi silinemedi\n');
        }
      }
    } else {
      console.log('❌ POST Category BAŞARISIZ\n');
    }
  } catch (error) {
    console.error('❌ POST ERROR:', error.message, '\n');
  }
  
  // Test 3: PUT Update Category WITH AUTH
  console.log('🔄 Test 3: PUT Update Category (WITH AUTH)');
  try {
    const updateData = {
      categoryId: 11, // Test kategorisi ID'si
      name: 'Updated API Test Category',
      icon: '✅',
      displayOrder: 1000,
      isActive: true
    };
    
    const response = await fetch(`${baseUrl}/api/business/menu/categories`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('✅ Status:', response.status);
    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success) {
      console.log('🎉 PUT Category BAŞARILI!\n');
    } else {
      console.log('❌ PUT Category BAŞARISIZ\n');
    }
  } catch (error) {
    console.error('❌ PUT ERROR:', error.message, '\n');
  }
  
  // Test 4: Authentication Tests (No Auth)
  console.log('🚫 Test 4: No Auth Tests (401 bekleniyor)');
  
  // GET without auth
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/categories?businessId=1`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('GET No Auth Status:', response.status);
    if (response.status === 401) {
      console.log('✅ GET Authentication kontrolü çalışıyor');
    } else {
      console.log('❌ GET Authentication kontrolü çalışmıyor');
    }
  } catch (error) {
    console.error('❌ GET No Auth ERROR:', error.message);
  }
  
  // POST without auth
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: 1, name: 'Unauthorized Test' })
    });
    
    console.log('POST No Auth Status:', response.status);
    if (response.status === 401) {
      console.log('✅ POST Authentication kontrolü çalışıyor');
    } else {
      console.log('❌ POST Authentication kontrolü çalışmıyor');
    }
  } catch (error) {
    console.error('❌ POST No Auth ERROR:', error.message);
  }
  
  console.log('\n🎯 FINAL TEST COMPLETED!');
}

finalMenuCategoriesTest();