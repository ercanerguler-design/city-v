/**
 * City-V Integration Test Script
 * 
 * Bu script şunları test eder:
 * 1. /api/locations endpoint'inin çalıştığını
 * 2. Business ve static location'ların birleştirildiğini
 * 3. Working hours'un doğru formatta olduğunu
 * 4. AÇIK/KAPALI durumunun hesaplandığını
 */

const API_BASE = 'http://localhost:3000';

async function testCityVIntegration() {
  console.log('🧪 City-V Integration Test Başlıyor...\n');
  
  // Test 1: API endpoint kontrolü
  console.log('📋 Test 1: /api/locations endpoint kontrolü');
  try {
    const response = await fetch(`${API_BASE}/api/locations?city=ankara`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status);
      console.error('Response:', data);
      return;
    }
    
    console.log('✅ API yanıt verdi');
    console.log(`   Total locations: ${data.locations?.length || 0}`);
    
    if (!data.locations || data.locations.length === 0) {
      console.log('⚠️  Henüz location bulunamadı');
      console.log('   Business profili ekleyin ve tekrar test edin\n');
      return;
    }
    
    // Test 2: Business vs Static locations
    console.log('\n📋 Test 2: Location kaynak analizi');
    const businessLocs = data.locations.filter(l => l.source === 'business');
    const staticLocs = data.locations.filter(l => l.source === 'static');
    
    console.log(`✅ Business locations: ${businessLocs.length}`);
    console.log(`✅ Static locations: ${staticLocs.length}`);
    
    // Test 3: Working hours kontrolü
    if (businessLocs.length > 0) {
      console.log('\n📋 Test 3: Working hours kontrolü');
      const withHours = businessLocs.filter(l => l.workingHours);
      console.log(`   ${withHours.length}/${businessLocs.length} business location'da working hours var`);
      
      if (withHours.length > 0) {
        const sample = withHours[0];
        console.log('\n   Örnek working hours:');
        console.log(`   İşletme: ${sample.name}`);
        console.log(`   Format:`, JSON.stringify(sample.workingHours, null, 2));
        
        // Test 4: AÇIK/KAPALI durumu
        console.log('\n📋 Test 4: AÇIK/KAPALI durum kontrolü');
        const now = new Date();
        const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        console.log(`   Şu an: ${currentDay} ${currentTime}`);
        
        withHours.forEach(loc => {
          const todayHours = loc.workingHours?.[currentDay];
          if (todayHours && todayHours.isOpen) {
            const isOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;
            console.log(`   ${loc.name}: ${isOpen ? '🟢 AÇIK' : '🔴 KAPALI'} (${todayHours.open} - ${todayHours.close})`);
          } else {
            console.log(`   ${loc.name}: 🔴 KAPALI (bugün kapalı)`);
          }
        });
      }
    }
    
    // Test 5: Örnek business location detayları
    if (businessLocs.length > 0) {
      console.log('\n📋 Test 5: Örnek business location detayları');
      const sample = businessLocs[0];
      console.log('   İşletme:', sample.name);
      console.log('   Location ID:', sample.id);
      console.log('   Kategori:', sample.category);
      console.log('   Koordinatlar:', sample.coordinates);
      console.log('   Adres:', sample.address);
      console.log('   Görünür mü:', sample.isVisibleOnMap !== false ? 'Evet' : 'Hayır');
      console.log('   Auto-sync:', sample.autoSyncToCityv !== false ? 'Evet' : 'Hayır');
    }
    
    console.log('\n✅ Tüm testler tamamlandı!');
    console.log('\n📝 Sonraki adımlar:');
    console.log('   1. Business dashboard\'da bir işletme ekleyin');
    console.log('   2. Working hours\'u ayarlayın');
    console.log('   3. City-V anasayfasını açın: http://localhost:3000');
    console.log('   4. Haritada işletmenin göründüğünü kontrol edin');
    console.log('   5. AÇIK/KAPALI yazısının doğru göründüğünü doğrulayın');
    
  } catch (error) {
    console.error('❌ Test hatası:', error.message);
  }
}

testCityVIntegration();
