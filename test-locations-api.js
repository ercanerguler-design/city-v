// Test /api/locations endpoint
fetch('http://localhost:3000/api/locations?includeBusiness=true')
  .then(r => r.json())
  .then(data => {
    console.log('📋 Full API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (!data.locations) {
      console.log('\n❌ No locations field in response!');
      return;
    }
    
    console.log(`\n📍 Total locations: ${data.locations.length}`);
    
    const businessLocs = data.locations.filter(l => l.source === 'business');
    console.log(`💼 Business locations: ${businessLocs.length}`);
    
    if (businessLocs.length > 0) {
      console.log('\nBusiness locations:');
      console.table(businessLocs.map(l => ({
        id: l.id,
        name: l.name,
        category: l.category,
        lat: l.coordinates ? l.coordinates[0] : 'N/A',
        lon: l.coordinates ? l.coordinates[1] : 'N/A',
        source: l.source
      })));
    }
    
    const nkaraLoc = businessLocs.find(l => l.id === 'nkara');
    if (nkaraLoc) {
      console.log('\n✅ FOUND location_id="nkara":');
      console.log(JSON.stringify(nkaraLoc, null, 2));
    } else {
      console.log('\n❌ location_id="nkara" NOT FOUND in business locations');
    }
  })
  .catch(err => console.error('❌ Error:', err));
