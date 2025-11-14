// Test /api/locations/crowd for business location
fetch('http://localhost:3000/api/locations/crowd?locationId=nkara')
  .then(r => r.json())
  .then(data => {
    console.log('📊 Crowd API Response for location_id="nkara":');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.location) {
      const loc = data.location;
      console.log('\n✅ Live Crowd Data:');
      console.log(`  Business: ${loc.businessName}`);
      console.log(`  Total Cameras: ${loc.totalCameras}`);
      console.log(`  Active Cameras: ${loc.activeCameras}`);
      console.log(`  Current People: ${loc.currentPeople}`);
      console.log(`  Avg Occupancy: ${loc.avgOccupancy}`);
      console.log(`  Crowd Level: ${loc.crowdLevel}`);
      console.log(`  Is Live: ${loc.isLive}`);
      console.log(`  Last Update: ${loc.lastUpdate}`);
    } else {
      console.log('\n❌ No live data available');
    }
  })
  .catch(err => console.error('❌ Error:', err));
