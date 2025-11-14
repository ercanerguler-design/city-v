// Test API endpoint
fetch('http://localhost:3000/api/locations?city=Ankara')
  .then(r => r.json())
  .then(data => {
    console.log('📍 API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.locations) {
      console.log(`\n✅ Total: ${data.locations.length} locations`);
      data.locations.forEach(loc => {
        console.log(`\n📌 ${loc.name}`);
        console.log(`   ID: ${loc.id}`);
        console.log(`   Category: ${loc.category}`);
        console.log(`   Coordinates: [${loc.coordinates[0]}, ${loc.coordinates[1]}]`);
        console.log(`   Address: ${loc.address}`);
        console.log(`   Source: ${loc.source}`);
        console.log(`   Working Hours: ${loc.workingHours ? 'YES' : 'NO'}`);
        console.log(`   Current People Count: ${loc.currentPeopleCount || 0}`);
        console.log(`   Business User ID: ${loc.businessUserId || 'N/A'}`);
      });
    } else {
      console.log('\n❌ No locations returned');
    }
  })
  .catch(err => console.error('❌ Error:', err));
