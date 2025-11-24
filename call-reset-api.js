console.log('🗑️  Resetting business data...\n');

fetch('https://city-v-ercanergulers-projects.vercel.app/api/business/reset-data?businessUserId=23', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('📡 Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('\n✅ Success!\n');
  console.log('Deleted records:');
  console.log('  - IoT records:', data.deleted?.iotRecords || 0);
  console.log('  - Daily summaries:', data.deleted?.summaries || 0);
  console.log('\n🎉 Business data reset complete!');
})
.catch(error => {
  console.error('\n❌ Error:', error.message);
  console.log('\n💡 Alternatif: Browser console\'da şu komutu çalıştır:');
  console.log('fetch("https://city-v.vercel.app/api/business/reset-data?businessUserId=23", {method:"DELETE"}).then(r=>r.json()).then(console.log)');
});
