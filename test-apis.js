// Business dashboard API test
const businessUserId = 23;

// Test business cameras analytics
async function testBusinessAnalytics() {
  console.log('🧪 Testing Business Analytics API...');
  
  try {
    const response = await fetch(`http://localhost:3000/api/business/cameras/analytics/summary?businessUserId=${businessUserId}`);
    const data = await response.json();
    
    console.log('📊 Analytics Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Analytics API working!');
      console.log('📈 Summary:', {
        activeCameras: data.summary.activeCameras,
        totalPeople: data.summary.totalPeople,
        onlineCameras: data.summary.onlineCameras,
        cameras: data.summary.cameras.length
      });
    } else {
      console.log('❌ Analytics API failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

// Test crowd analytics
async function testCrowdAnalytics() {
  console.log('\n🧪 Testing Crowd Analytics API...');
  
  try {
    const response = await fetch(`http://localhost:3000/api/business/crowd-analytics?businessId=${businessUserId}&range=1hour`);
    const data = await response.json();
    
    console.log('👥 Crowd Response (summary):', {
      success: data.success,
      currentStatus: data.currentStatus,
      zones: data.zones?.length || 0,
      historicalData: data.historicalData?.length || 0
    });
    
    if (data.success) {
      console.log('✅ Crowd Analytics API working!');
    } else {
      console.log('❌ Crowd Analytics failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Crowd API Test Error:', error.message);
  }
}

// Run tests
testBusinessAnalytics();
setTimeout(testCrowdAnalytics, 1000);

console.log('⏳ Running API tests... (wait 2 seconds)');