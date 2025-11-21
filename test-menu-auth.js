const { neon } = require('@neondatabase/serverless');

async function testMenuAuth() {
  console.log('🔐 Menu API Authentication Test');
  
  try {
    // Production business login API'yi test et
    console.log('1. Business login testi...');
    
    const loginResponse = await fetch('https://city-v-chi-two.vercel.app/api/business/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'atmbankde@gmail.com', // Actual business email
        password: 'test123' // New test password
      })
    });
    
    console.log('📡 Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.success);
    
    if (!loginData.token) {
      console.log('❌ No token received');
      return;
    }
    
    const token = loginData.token;
    console.log('🎫 Token received (first 20 chars):', token.substring(0, 20) + '...');
    
    // 2. Menu categories testi - authentication ile
    console.log('\n2. Menu Categories API testi (authenticated)...');
    
    const categoriesResponse = await fetch('https://city-v-chi-two.vercel.app/api/business/menu/categories?businessId=15', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    });
    
    console.log('📡 Categories response status:', categoriesResponse.status);
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Categories API çalışıyor!');
      console.log('📋 Kategori sayısı:', categoriesData.categories?.length || 0);
    } else {
      const errorText = await categoriesResponse.text();
      console.log('❌ Categories API hatası:', errorText);
    }
    
    // 3. Yeni kategori ekleme testi
    console.log('\n3. Yeni kategori ekleme testi...');
    
    const newCategoryResponse = await fetch('https://city-v-chi-two.vercel.app/api/business/menu/categories', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        businessId: 15,
        name: 'Test Kategori ' + Date.now(),
        icon: '🍕',
        displayOrder: 1
      })
    });
    
    console.log('📡 New category response status:', newCategoryResponse.status);
    
    if (newCategoryResponse.ok) {
      const newCategoryData = await newCategoryResponse.json();
      console.log('✅ Yeni kategori ekleme başarılı!');
      console.log('📝 Kategori ID:', newCategoryData.category.id);
      console.log('📝 Kategori adı:', newCategoryData.category.name);
    } else {
      const errorText = await newCategoryResponse.text();
      console.log('❌ Kategori ekleme hatası:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

testMenuAuth();