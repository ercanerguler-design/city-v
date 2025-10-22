const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function generateDemoCrowdingReports() {
  try {
    console.log('📊 Demo yoğunluk raporları oluşturuluyor...');

    // Mevcut hatları al
    const lines = await sql`
      SELECT tl.*, tc.city_name, tc.city_code 
      FROM transport_lines tl
      JOIN turkey_cities tc ON tl.city_id = tc.id
      ORDER BY tc.population DESC
    `;

    if (lines.rows.length === 0) {
      console.log('❌ Transport hatları bulunamadı');
      return;
    }

    const crowdingLevels = ['Boş', 'Az Dolu', 'Orta', 'Dolu', 'Çok Dolu'];
    const reportMethods = ['manual', 'automatic', 'sensor'];
    const weatherConditions = ['Güneşli', 'Yağmurlu', 'Karlı', 'Bulutlu', 'Rüzgarlı'];

    // Her hat için son 7 günde random raporlar oluştur
    for (const line of lines.rows) {
      const reportCount = Math.floor(Math.random() * 20) + 5; // 5-25 rapor per hat
      
      for (let i = 0; i < reportCount; i++) {
        // Son 7 gün içinde random zaman
        const daysAgo = Math.floor(Math.random() * 7);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        
        const reportTime = new Date();
        reportTime.setDate(reportTime.getDate() - daysAgo);
        reportTime.setHours(reportTime.getHours() - hoursAgo);
        reportTime.setMinutes(reportTime.getMinutes() - minutesAgo);

        const crowdingLevel = crowdingLevels[Math.floor(Math.random() * crowdingLevels.length)];
        const crowdingPercentage = getCrowdingPercentage(crowdingLevel);
        const estimatedPassengers = Math.floor((crowdingPercentage / 100) * line.vehicle_capacity);
        const reportingMethod = reportMethods[Math.floor(Math.random() * reportMethods.length)];
        const weatherCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const isVerified = Math.random() > 0.3; // 70% verified
        const verificationCount = isVerified ? Math.floor(Math.random() * 5) + 1 : 0;

        // Random GPS koordinatları (şehir merkezi yakını)
        const cityLat = getRandomCoordinate(line, 'lat');
        const cityLng = getRandomCoordinate(line, 'lng');

        await sql`
          INSERT INTO transport_crowding_reports (
            report_type, line_id, crowding_level, crowding_percentage, 
            estimated_passengers, current_latitude, current_longitude,
            reported_by, reporting_method, verification_count, is_verified,
            weather_condition, notes, created_at
          ) VALUES (
            'line_crowding', ${line.id}, ${crowdingLevel}, ${crowdingPercentage},
            ${estimatedPassengers}, ${cityLat}, ${cityLng}, 1,
            ${reportingMethod}, ${verificationCount}, ${isVerified},
            ${weatherCondition}, 
            ${generateReportNote(crowdingLevel, line.line_code, line.city_name)},
            ${reportTime.toISOString()}
          )
        `;
      }
      
      console.log(`✅ ${line.city_name} - ${line.line_code}: ${reportCount} rapor eklendi`);
    }

    // İstatistikler
    const totalReports = await sql`SELECT COUNT(*) as total FROM transport_crowding_reports`;
    const recentReports = await sql`
      SELECT COUNT(*) as recent 
      FROM transport_crowding_reports 
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `;
    const verifiedReports = await sql`SELECT COUNT(*) as verified FROM transport_crowding_reports WHERE is_verified = true`;

    console.log('\n📈 DEMO RAPOR İSTATİSTİKLERİ:');
    console.log(`   📊 Toplam Rapor: ${totalReports.rows[0].total}`);
    console.log(`   🕐 Son 24 Saat: ${recentReports.rows[0].recent}`);
    console.log(`   ✅ Doğrulanmış: ${verifiedReports.rows[0].verified}`);
    
    console.log('\n🎉 Demo yoğunluk raporları başarıyla oluşturuldu!');

  } catch (error) {
    console.error('❌ Demo rapor oluşturma hatası:', error);
    process.exit(1);
  }
}

function getCrowdingPercentage(level) {
  switch (level) {
    case 'Boş': return Math.floor(Math.random() * 20); // 0-20%
    case 'Az Dolu': return Math.floor(Math.random() * 20) + 20; // 20-40%
    case 'Orta': return Math.floor(Math.random() * 20) + 40; // 40-60%
    case 'Dolu': return Math.floor(Math.random() * 20) + 60; // 60-80%
    case 'Çok Dolu': return Math.floor(Math.random() * 20) + 80; // 80-100%
    default: return 50;
  }
}

function getRandomCoordinate(line, type) {
  // Türkiye için yaklaşık koordinat aralıkları
  const turkeyBounds = {
    lat: { min: 36.0, max: 42.0 },
    lng: { min: 26.0, max: 45.0 }
  };
  
  const bounds = turkeyBounds[type];
  return (Math.random() * (bounds.max - bounds.min) + bounds.min).toFixed(6);
}

function generateReportNote(crowdingLevel, lineCode, cityName) {
  const notes = {
    'Boş': [
      `${lineCode} hattı çok rahat, oturma yeri bol`,
      `${cityName}'da ${lineCode} boş, ideal seyahat zamanı`,
      'Araç neredeyse boş, çok konforlu'
    ],
    'Az Dolu': [
      `${lineCode} rahat, ayakta birkaç kişi var`,
      `${cityName} ${lineCode} hattında yer var`,
      'Oturma yeri bulabilirsiniz'
    ],
    'Orta': [
      `${lineCode} normal yoğunluk, idare eder`,
      `${cityName}'da standart yoğunluk`,
      'Ayakta seyahat etmek gerekebilir'
    ],
    'Dolu': [
      `${lineCode} hattı dolu, sıkışık`,
      `${cityName} ${lineCode} yoğun, sabır gerekli`,
      'Araç dolu, biraz beklemek iyi olabilir'
    ],
    'Çok Dolu': [
      `${lineCode} çok yoğun! Bir sonraki araç daha iyi`,
      `${cityName} ${lineCode} sardina kutusu gibi`,
      'Çok kalabalık, mümkünse bekleyin'
    ]
  };
  
  const levelNotes = notes[crowdingLevel] || notes['Orta'];
  return levelNotes[Math.floor(Math.random() * levelNotes.length)];
}

generateDemoCrowdingReports();