// Test: Business locations API ve harita render kontrolü
console.log('🧪 CityV Test Başlıyor...\n');

// 1. API Test
console.log('1️⃣ API TEST');
fetch('/api/cityv/business-locations')
  .then(res => res.json())
  .then(data => {
    console.log('✅ API Yanıt:', data);
    console.log('📊 Business sayısı:', data.count);
    
    if (data.locations && data.locations.length > 0) {
      console.log('\n📍 İlk Business:');
      const first = data.locations[0];
      console.log('   - ID:', first.id);
      console.log('   - İsim:', first.name);
      console.log('   - Koordinat:', first.coordinates);
      console.log('   - Koordinat Tip:', typeof first.coordinates[0], typeof first.coordinates[1]);
      
      // Leaflet için doğru format kontrolü
      if (typeof first.coordinates[0] === 'number' && typeof first.coordinates[1] === 'number') {
        console.log('   ✅ Koordinatlar number formatında');
      } else {
        console.error('   ❌ Koordinatlar string formatında - parseFloat gerekli!');
      }
    }
  })
  .catch(err => {
    console.error('❌ API Hatası:', err);
  });

// 2. Leaflet CSS kontrolü
console.log('\n2️⃣ LEAFLET CSS KONTROL');
setTimeout(() => {
  const leafletCSS = document.querySelector('link[href*="leaflet"]');
  if (leafletCSS) {
    console.log('✅ Leaflet CSS yüklü');
  } else {
    console.warn('⚠️ Leaflet CSS bulunamadı');
  }
}, 2000);

// 3. Client-side render kontrolü
console.log('\n3️⃣ CLIENT-SIDE KONTROL');
if (typeof window !== 'undefined') {
  console.log('✅ window objesi var (client-side)');
  console.log('📦 localStorage:', typeof localStorage);
  console.log('🗺️ navigator.geolocation:', typeof navigator.geolocation);
} else {
  console.error('❌ Server-side rendering hatası!');
}

console.log('\n✅ Test tamamlandı!\n');
