// Business API Test Script
const testData = {
  full_name: "Test Personel",
  email: "test@business.com",
  phone: "0555 111 2222",
  role: "staff",
  position: "Servis",
  hire_date: "2025-01-01",
  status: "active",
  permissions: JSON.stringify(["view_dashboard", "manage_inventory"]),
  working_hours: JSON.stringify({
    monday: { start: "09:00", end: "18:00" },
    tuesday: { start: "09:00", end: "18:00" },
    wednesday: { start: "09:00", end: "18:00" },
    thursday: { start: "09:00", end: "18:00" },
    friday: { start: "09:00", end: "18:00" },
    saturday: { start: "10:00", end: "16:00" },
    sunday: { start: "closed", end: "closed" }
  })
};

async function testBusinessAPIs() {
  const baseUrl = 'https://city-v-chi-two.vercel.app';
  
  console.log('🧪 BUSINESS API TEST SUITE...');
  console.log('🌐 Base URL:', baseUrl);
  
  // Test 1: Staff GET
  console.log('\n1️⃣ Testing Staff GET API...');
  try {
    const response = await fetch(`${baseUrl}/api/business/staff?businessId=1`);
    console.log('📊 Staff GET Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Staff GET Success:', data);
    } else {
      const error = await response.text();
      console.log('❌ Staff GET Error:', error);
    }
  } catch (e) {
    console.log('❌ Staff GET Fetch Error:', e.message);
  }
  
  // Test 2: Menu Categories GET
  console.log('\n2️⃣ Testing Menu Categories GET API...');
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/categories?businessId=1`);
    console.log('📊 Categories GET Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Categories GET Success:', data);
    } else {
      const error = await response.text();
      console.log('❌ Categories GET Error:', error);
    }
  } catch (e) {
    console.log('❌ Categories GET Fetch Error:', e.message);
  }
  
  // Test 3: Staff POST (Create)
  console.log('\n3️⃣ Testing Staff POST API...');
  try {
    const response = await fetch(`${baseUrl}/api/business/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        businessId: 1,
        ...testData
      })
    });
    console.log('📊 Staff POST Status:', response.status);
    const result = await response.text();
    console.log('📄 Staff POST Result:', result);
  } catch (e) {
    console.log('❌ Staff POST Fetch Error:', e.message);
  }
  
  // Test 4: Categories POST (Create)
  console.log('\n4️⃣ Testing Categories POST API...');
  try {
    const response = await fetch(`${baseUrl}/api/business/menu/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        businessId: 1,
        name: "Test Kategori",
        description: "Test kategorisi açıklama",
        display_order: 1
      })
    });
    console.log('📊 Categories POST Status:', response.status);
    const result = await response.text();
    console.log('📄 Categories POST Result:', result);
  } catch (e) {
    console.log('❌ Categories POST Fetch Error:', e.message);
  }
  
  console.log('\n🏁 Test completed!');
}

testBusinessAPIs();