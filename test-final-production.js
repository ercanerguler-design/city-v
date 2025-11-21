const testData = {
  businessName: "Production Test Final",
  businessType: "Test Business", 
  location: "Final Test Location",
  ownerName: "Final Test Owner",
  email: "final.test@production.com",
  phone: "0555 111 2233",
  website: "https://final-test.com",
  averageDaily: "200-300",
  openingHours: "08:00-22:00", 
  currentSolution: "Final test solution",
  goals: ["Final Test Goal 1", "Final Test Goal 2"],
  heardFrom: "production-test",
  additionalInfo: "Final production test after environment variables fix"
};

async function testFinalProductionBeta() {
  try {
    console.log('🎯 FINAL Production Beta API Test...');
    console.log('📋 Test data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('https://city-v-chi-two.vercel.app/api/beta/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('\n📊 Response Status:', response.status);
    
    const result = await response.text();
    console.log('📄 Response Body:', result);
    
    if (response.ok) {
      console.log('\n✅ FINAL PRODUCTION BETA BAŞVURU BAŞARILI!');
      try {
        const jsonResult = JSON.parse(result);
        console.log('🎉 Final Başvuru ID:', jsonResult.applicationId);
        console.log('⏰ Timestamp:', jsonResult.timestamp);
        console.log('📧 Email gönderim durumu:', jsonResult.message);
      } catch (e) {
        console.log('📄 Response text formatında geldi');
      }
    } else {
      console.log('\n❌ FINAL Production Beta başvuru hatası!');
      console.log('🔍 Hata detayı:', result);
    }
    
  } catch (error) {
    console.error('❌ Final fetch hatası:', error.message);
  }
}

testFinalProductionBeta();