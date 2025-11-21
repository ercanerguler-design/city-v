const testData = {
  businessName: "Test Cafe",
  businessType: "Cafe/Restoran",
  location: "Ankara/Çankaya",
  ownerName: "Test User",
  email: "test@example.com",
  phone: "0555 123 4567",
  website: "https://testcafe.com",
  averageDaily: "50-100",
  openingHours: "08:00-22:00",
  currentSolution: "Excel tabloları",
  goals: ["Traffic Analytics", "Customer Insights"],
  heardFrom: "web",
  additionalInfo: "Test beta başvurusu"
};

async function testBetaAPI() {
  try {
    console.log('🧪 Beta başvuru API testi başlıyor...');
    
    const response = await fetch('http://localhost:3000/api/beta/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.text();
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📄 Response Body:', result);
    
    if (response.ok) {
      console.log('✅ Beta başvuru başarılı!');
    } else {
      console.log('❌ Beta başvuru hatası!');
    }
    
  } catch (error) {
    console.error('❌ Fetch hatası:', error.message);
  }
}

testBetaAPI();