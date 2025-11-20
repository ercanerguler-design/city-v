// Test personel ekleme API'si - debug için
console.log('🧪 Personel API test başlıyor...');

const testData = {
  businessId: 1,
  full_name: "Test Personel",
  email: "test@email.com",
  phone: "05551234567",
  position: "Test Pozisyon",
  role: "employee",
  working_hours: JSON.stringify({ shift: "Sabah (08:00-16:00)" }),
  permissions: { cameras: false, menu: false, reports: false, settings: false }
};

fetch('https://city-v.vercel.app/api/business/staff', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Response status:', response.status);
  console.log('📡 Response headers:', response.headers);
  return response.text();
})
.then(data => {
  console.log('📋 API Response:', data);
  
  try {
    const jsonData = JSON.parse(data);
    console.log('✅ Parsed JSON:', jsonData);
  } catch (e) {
    console.log('❌ JSON parse hatası, HTML döndürülmüş olabilir');
    console.log('🔍 İlk 500 karakter:', data.substring(0, 500));
  }
})
.catch(error => {
  console.error('❌ Fetch hatası:', error);
});