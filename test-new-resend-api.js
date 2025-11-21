const testData = {
  businessName: "New Resend API Test",
  businessType: "Test Business", 
  location: "Test Location",
  ownerName: "Test Owner New API",
  email: "new.resend.test@example.com",
  phone: "0555 444 5566",
  website: "https://newresendtest.com",
  averageDaily: "150-250",
  openingHours: "09:00-21:00", 
  currentSolution: "New Resend API test",
  goals: ["Email Test", "New API Integration"],
  heardFrom: "new-api-test",
  additionalInfo: "Testing new Resend API key: re_cCquoo3C_2KkNeVyQjEgAB2hcREQsaLhC"
};

async function testNewResendAPI() {
  try {
    console.log('🔧 NEW RESEND API TEST...');
    console.log('📧 Testing with new API key: re_cCquoo3C_2KkNeVyQjEgAB2hcREQsaLhC');
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
      console.log('\n✅ NEW RESEND API TEST SUCCESSFUL!');
      try {
        const jsonResult = JSON.parse(result);
        console.log('🎉 Application ID:', jsonResult.applicationId);
        console.log('📧 Email Status:', jsonResult.message);
      } catch (e) {
        console.log('📄 Response in text format');
      }
    } else {
      console.log('\n❌ NEW RESEND API TEST FAILED!');
      console.log('🔍 Error details:', result);
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
}

testNewResendAPI();