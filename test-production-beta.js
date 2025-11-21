const testData = {
  businessName: "Test Beta Cafe",
  businessType: "Cafe/Restoran", 
  location: "Ankara/Çankaya",
  ownerName: "Test User Production",
  email: "production.test@example.com",
  phone: "0555 999 8877",
  website: "https://testbetacafe.com",
  averageDaily: "100-200",
  openingHours: "07:00-23:00", 
  currentSolution: "Manuel takip",
  goals: ["Traffic Analytics", "Customer Insights", "Real-time Monitoring"],
  heardFrom: "website",
  additionalInfo: "Production beta başvuru testi - Environment variables fix sonrası"
};

async function testProductionBeta() {
  try {
    console.log('🧪 Production Beta API testi başlıyor...');
    console.log('📋 Test data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('https://city-v-chi-two.vercel.app/api/beta/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('📄 Response Body:', result);
    
    if (response.ok) {
      console.log('✅ Production Beta başvuru başarılı!');
      try {
        const jsonResult = JSON.parse(result);
        console.log('🎉 Başvuru ID:', jsonResult.applicationId);
      } catch (e) {
        console.log('📄 Response text formatında geldi');
      }
    } else {
      console.log('❌ Production Beta başvuru hatası!');
      console.log('🔍 Hata detayı:', result);
    }
    
  } catch (error) {
    console.error('❌ Fetch hatası:', error.message);
  }
}

testProductionBeta();