/**
 * ESP32-CAM Connection Test
 * Tests if ESP32 is accessible and streaming
 */

const http = require('http');

const ESP32_IP = '192.168.1.3';
const ESP32_PORT = 80;

// Test endpoints
const endpoints = [
  '/stream',           // MJPEG stream
  '/capture',          // Single frame capture
  '/',                 // Root
  '/status',          // Status endpoint
];

console.log('🔍 ESP32-CAM Connection Test Starting...\n');
console.log(`Testing IP: ${ESP32_IP}:${ESP32_PORT}\n`);

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: ESP32_IP,
      port: ESP32_PORT,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    console.log(`📡 Testing: http://${ESP32_IP}:${ESP32_PORT}${path}`);

    const req = http.request(options, (res) => {
      console.log(`   ✅ Status: ${res.statusCode}`);
      console.log(`   📋 Headers:`, JSON.stringify(res.headers, null, 2));
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        if (data.length > 200) {
          // For streams, just check we got data
          res.destroy();
        }
      });

      res.on('end', () => {
        if (data.length > 0) {
          console.log(`   📦 Data received: ${data.length} bytes`);
          if (data.length < 500) {
            console.log(`   💬 Response: ${data.substring(0, 200)}`);
          }
        }
        console.log('');
        resolve({ success: true, status: res.statusCode, headers: res.headers });
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      console.log('');
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      console.log(`   ⏱️ Timeout: No response after 5 seconds`);
      console.log('');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function runTests() {
  const results = {};

  for (const endpoint of endpoints) {
    results[endpoint] = await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));

  let successCount = 0;
  for (const [endpoint, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${endpoint}: ${result.success ? `HTTP ${result.status}` : result.error}`);
    if (result.success) successCount++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${successCount}/${endpoints.length} endpoints accessible`);
  console.log('='.repeat(50));

  if (successCount === 0) {
    console.log('\n⚠️  CRITICAL: ESP32 is not responding!');
    console.log('\nTroubleshooting steps:');
    console.log('1. Check if ESP32 is powered on');
    console.log('2. Verify WiFi connection (LED should be solid, not blinking)');
    console.log('3. Check if IP address is correct');
    console.log('4. Try accessing http://192.168.1.3/stream in browser');
    console.log('5. Restart ESP32 and wait for WiFi connection');
  } else if (!results['/stream']?.success) {
    console.log('\n⚠️  Stream endpoint not accessible!');
    console.log('ESP32 is online but /stream endpoint is not responding.');
    console.log('Check ESP32 firmware configuration.');
  } else {
    console.log('\n✅ ESP32 is accessible and streaming!');
    console.log(`Stream URL: http://${ESP32_IP}:${ESP32_PORT}/stream`);
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
