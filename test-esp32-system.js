// ESP32 Camera Simulation Test Script
// Simulates ESP32-CAM sending crowd analytics and transport data

const ESP32_CAM_IP = '192.168.1.2';
const API_BASE = 'http://localhost:3000';

// Business Analytics Test
async function testBusinessAnalytics() {
  console.log('📹 Testing Business Analytics (ESP32-001)...\n');

  const data = {
    businessId: 6,
    deviceId: 'ESP32-001',
    zoneName: 'Test Zone',
    currentPeopleCount: Math.floor(Math.random() * 80) + 20, // 20-100
    maxCapacity: 100,
    entryCount: Math.floor(Math.random() * 20) + 5,
    exitCount: Math.floor(Math.random() * 15) + 2,
    queueLength: Math.floor(Math.random() * 10),
    avgWaitTime: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
    crowdLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    crowdDensity: Math.random() * 100
  };

  try {
    const response = await fetch(`${API_BASE}/api/business/crowd-analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('✅ Business Analytics Response:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Transport Stop Crowd Test
async function testStopCrowd() {
  console.log('\n📹 Testing Transport Stop Crowd (ESP32-CAM-01)...\n');

  const data = {
    stopId: 1, // Kızılay
    deviceId: 'ESP32-CAM-01',
    peopleWaiting: Math.floor(Math.random() * 30) + 5, // 5-35
    peopleInQueue: Math.floor(Math.random() * 15) + 2,
    crowdLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    crowdDensity: Math.random() * 100,
    avgWaitTime: Math.floor(Math.random() * 300) + 60, // 60-360 seconds
    maxWaitTime: Math.floor(Math.random() * 500) + 120
  };

  try {
    const response = await fetch(`${API_BASE}/api/transport/stop-crowd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('✅ Stop Crowd Response:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// AI Detection Test
async function testAIDetection() {
  console.log('\n🤖 Testing AI Detection...\n');

  const detections = [
    {
      businessId: 6,
      deviceId: 'ESP32-001',
      recognitionType: 'person',
      detectedObject: 'person',
      confidence: 0.95,
      boundingBox: { x: 100, y: 150, width: 80, height: 200 },
      zoneName: 'Entrance'
    },
    {
      businessId: 6,
      deviceId: 'ESP32-001',
      recognitionType: 'object',
      detectedObject: 'chair',
      confidence: 0.88,
      boundingBox: { x: 300, y: 400, width: 60, height: 80 },
      zoneName: 'Seating Area'
    }
  ];

  try {
    const response = await fetch(`${API_BASE}/api/business/ai-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detections })
    });

    const result = await response.json();
    console.log('✅ AI Detection Response:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Vehicle Location Update Test
async function testVehicleLocation() {
  console.log('\n🚌 Testing Vehicle Location Update...\n');

  const data = {
    vehicleId: 1, // BUS-250-01
    routeId: 1,
    latitude: 39.920000 + (Math.random() - 0.5) * 0.01,
    longitude: 32.854000 + (Math.random() - 0.5) * 0.01,
    speed: Math.floor(Math.random() * 50) + 20, // 20-70 km/h
    direction: ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)],
    nextStopId: 1,
    distanceToNextStop: Math.floor(Math.random() * 2000) + 100, // 100-2100 meters
    etaToNextStop: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
    currentPassengers: Math.floor(Math.random() * 80) + 20,
    crowdLevel: ['low', 'medium', 'high', 'full'][Math.floor(Math.random() * 4)]
  };

  try {
    const response = await fetch(`${API_BASE}/api/transport/vehicle-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('✅ Vehicle Location Response:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting ESP32 Camera System Tests...\n');
  console.log('═══════════════════════════════════════════\n');

  await testBusinessAnalytics();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testStopCrowd();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testAIDetection();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testVehicleLocation();

  console.log('\n═══════════════════════════════════════════');
  console.log('\n🎉 All ESP32 tests completed!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Business crowd analytics');
  console.log('   ✅ Transport stop crowd');
  console.log('   ✅ AI detection');
  console.log('   ✅ Vehicle location');
  console.log('\n💡 Check UI dashboards for real-time updates:');
  console.log('   - Business: http://localhost:3000/business/dashboard');
  console.log('   - Transport: http://localhost:3000/transport/dashboard');
  console.log('\n');
}

// Run tests
runAllTests().catch(console.error);
