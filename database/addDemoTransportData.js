const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function addDemoTransportData() {
  try {
    console.log('🚇 Demo transport verilerini ekleniyor...');

    // İstanbul - İETT ve Metro İstanbul
    console.log('🏙️ İstanbul transport verileri...');
    
    // İETT kurumu
    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('İETT', 'IETT', 
        (SELECT id FROM turkey_cities WHERE city_code = 'IST'), 
        'municipal', 'https://iett.istanbul', '#E31E24')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    // Metro İstanbul
    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('Metro İstanbul', 'METRO_IST', 
        (SELECT id FROM turkey_cities WHERE city_code = 'IST'), 
        'municipal', 'https://metro.istanbul', '#0052CC')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    // İstanbul Metro Hatları
    const istanbulMetroLines = [
      { code: 'M1A', name: 'Yenikapı - Atatürk Havalimanı', type: 'metro', color: '#FF0000' },
      { code: 'M1B', name: 'Yenikapı - Kirazlı', type: 'metro', color: '#FF6600' },
      { code: 'M2', name: 'Veliefendi - Hacıosman', type: 'metro', color: '#00AA44' },
      { code: 'M3', name: 'Olimpiyat - Başakşehir', type: 'metro', color: '#0066CC' },
      { code: 'M4', name: 'Kadıköy - Sabiha Gökçen', type: 'metro', color: '#FF1493' },
      { code: 'M5', name: 'Üsküdar - Çekmeköy', type: 'metro', color: '#800080' },
      { code: 'M6', name: 'Levent - Boğaziçi Üniversitesi', type: 'metro', color: '#8B4513' },
      { code: 'M7', name: 'Mecidiyeköy - Mahmutbey', type: 'metro', color: '#FF69B4' },
      { code: 'M8', name: 'Bostancı - Parseller', type: 'metro', color: '#32CD32' },
      { code: 'M9', name: 'Ataköy - İkitelli', type: 'metro', color: '#FFD700' }
    ];

    for (const line of istanbulMetroLines) {
      await sql`
        INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
        SELECT ${line.code}, ${line.name}, ${line.type}, c.id, a.id, 15.00, 3, 500, ${line.color}
        FROM turkey_cities c, transport_agencies a 
        WHERE c.city_code = 'IST' AND a.agency_code = 'METRO_IST'
        ON CONFLICT DO NOTHING
      `;
    }

    // İstanbul Otobüs Hatları
    const istanbulBusLines = [
      { code: '15F', name: 'Eminönü - Bağcılar', type: 'bus' },
      { code: '28', name: 'Edirnekapı - Etiler', type: 'bus' },
      { code: '34', name: 'Avcılar - Mecidiyeköy', type: 'bus' },
      { code: '34AS', name: 'Avcılar - Söğütlüçeşme', type: 'bus' },
      { code: '500T', name: 'Taksim - Sarıyer', type: 'bus' },
      { code: '16C', name: 'Cevizlibağ - Sarıyer', type: 'bus' }
    ];

    for (const line of istanbulBusLines) {
      await sql`
        INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
        SELECT ${line.code}, ${line.name}, ${line.type}, c.id, a.id, 15.00, 8, 120, '#E31E24'
        FROM turkey_cities c, transport_agencies a 
        WHERE c.city_code = 'IST' AND a.agency_code = 'IETT'
        ON CONFLICT DO NOTHING
      `;
    }

    // İzmir - ESHOT
    console.log('🏙️ İzmir transport verileri...');
    
    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('ESHOT', 'ESHOT', 
        (SELECT id FROM turkey_cities WHERE city_code = 'IZM'), 
        'municipal', 'https://eshot.gov.tr', '#FF6600')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('İzmir Metro A.Ş.', 'IZMIR_METRO', 
        (SELECT id FROM turkey_cities WHERE city_code = 'IZM'), 
        'municipal', 'https://izmirmetro.com.tr', '#0066CC')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    // İzmir Metro Hatları
    const izmirMetroLines = [
      { code: 'M1', name: 'Fahrettin Altay - Evka 3', type: 'metro', color: '#FF0000' },
      { code: 'M2', name: 'Aliağa - Menderes', type: 'metro', color: '#00AA44' }
    ];

    for (const line of izmirMetroLines) {
      await sql`
        INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
        SELECT ${line.code}, ${line.name}, ${line.type}, c.id, a.id, 12.00, 5, 400, ${line.color}
        FROM turkey_cities c, transport_agencies a 
        WHERE c.city_code = 'IZM' AND a.agency_code = 'IZMIR_METRO'
        ON CONFLICT DO NOTHING
      `;
    }

    // İzmir Otobüs Hatları
    const izmirBusLines = [
      { code: '35', name: 'Alsancak - Güzelbahçe', type: 'bus' },
      { code: '202', name: 'Konak - Ödemiş', type: 'bus' },
      { code: '754', name: 'Karşıyaka - Bornova', type: 'bus' },
      { code: '851', name: 'Alsancak - Çiğli', type: 'bus' }
    ];

    for (const line of izmirBusLines) {
      await sql`
        INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
        SELECT ${line.code}, ${line.name}, ${line.type}, c.id, a.id, 7.00, 12, 90, '#FF6600'
        FROM turkey_cities c, transport_agencies a 
        WHERE c.city_code = 'IZM' AND a.agency_code = 'ESHOT'
        ON CONFLICT DO NOTHING
      `;
    }

    // Bursa - Burulaş
    console.log('🏙️ Bursa transport verileri...');
    
    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('Burulaş', 'BURULAS', 
        (SELECT id FROM turkey_cities WHERE city_code = 'BUR'), 
        'municipal', 'https://burulas.com.tr', '#006633')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    const bursaLines = [
      { code: 'BursaRay', name: 'Emek - Kestel', type: 'metro', color: '#0066CC' },
      { code: '1/A', name: 'Otogar - Setbaşı', type: 'bus', color: '#006633' },
      { code: '1/C', name: 'Otogar - Görükle', type: 'bus', color: '#006633' },
      { code: '2', name: 'Şehreküstü - Mudanya', type: 'bus', color: '#006633' }
    ];

    for (const line of bursaLines) {
      await sql`
        INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
        SELECT ${line.code}, ${line.name}, ${line.type}, c.id, a.id, 6.50, 10, 
          ${line.type === 'metro' ? 300 : 90}, ${line.color}
        FROM turkey_cities c, transport_agencies a 
        WHERE c.city_code = 'BUR' AND a.agency_code = 'BURULAS'
        ON CONFLICT DO NOTHING
      `;
    }

    // Antalya - ATAK
    console.log('🏙️ Antalya transport verileri...');
    
    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('ATAK', 'ATAK', 
        (SELECT id FROM turkey_cities WHERE city_code = 'ANT'), 
        'municipal', 'https://atak.gov.tr', '#FF8800')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    const antalyaLines = [
      { code: 'AntRay', name: 'Expo 2016 - Antalya Havalimanı', type: 'tram', color: '#FF8800' },
      { code: '07', name: 'Konyaaltı - Lara', type: 'bus', color: '#FF8800' },
      { code: '600', name: 'Otogar - Havalimanı', type: 'bus', color: '#FF8800' },
      { code: '08', name: 'Kaleiçi - Aksu', type: 'bus', color: '#FF8800' }
    ];

    for (const line of antalyaLines) {
      await sql`
        INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
        SELECT ${line.code}, ${line.name}, ${line.type}, c.id, a.id, 5.00, 12, 
          ${line.type === 'tram' ? 200 : 80}, ${line.color}
        FROM turkey_cities c, transport_agencies a 
        WHERE c.city_code = 'ANT' AND a.agency_code = 'ATAK'
        ON CONFLICT DO NOTHING
      `;
    }

    // Adana - BUAS
    console.log('🏙️ Adana transport verileri...');
    
    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('BUAS', 'BUAS', 
        (SELECT id FROM turkey_cities WHERE city_code = 'ADA'), 
        'municipal', 'https://buas.gov.tr', '#CC0000')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    const adanaLines = [
      { code: 'M1', name: 'Adana Merkez - Şakirpaşa', type: 'metro', color: '#CC0000' },
      { code: '101', name: 'Otogar - Çukurova Üniversitesi', type: 'bus', color: '#CC0000' },
      { code: '170', name: 'Seyhan - Sarıçam', type: 'bus', color: '#CC0000' }
    ];

    for (const line of adanaLines) {
      await sql`
        INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
        SELECT ${line.code}, ${line.name}, ${line.type}, c.id, a.id, 4.50, 8, 
          ${line.type === 'metro' ? 250 : 85}, ${line.color}
        FROM turkey_cities c, transport_agencies a 
        WHERE c.city_code = 'ADA' AND a.agency_code = 'BUAS'
        ON CONFLICT DO NOTHING
      `;
    }

    // Konya - KOTRA
    console.log('🏙️ Konya transport verileri...');
    
    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('KOTRA', 'KOTRA', 
        (SELECT id FROM turkey_cities WHERE city_code = 'KON'), 
        'municipal', 'https://kotra.konya.bel.tr', '#00AA44')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    const konyaLines = [
      { code: 'T1', name: 'Necmettin Erbakan Üniversitesi - Meram', type: 'tram', color: '#00AA44' },
      { code: '35', name: 'Terminal - Meram', type: 'bus', color: '#00AA44' },
      { code: '41', name: 'Sille - Şeker Fabrikası', type: 'bus', color: '#00AA44' }
    ];

    for (const line of konyaLines) {
      await sql`
        INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
        SELECT ${line.code}, ${line.name}, ${line.type}, c.id, a.id, 4.00, 10, 
          ${line.type === 'tram' ? 180 : 75}, ${line.color}
        FROM turkey_cities c, transport_agencies a 
        WHERE c.city_code = 'KON' AND a.agency_code = 'KOTRA'
        ON CONFLICT DO NOTHING
      `;
    }

    // Gaziantep - GAZIULAŞ
    console.log('🏙️ Gaziantep transport verileri...');
    
    await sql`
      INSERT INTO transport_agencies (agency_name, agency_code, city_id, agency_type, website, primary_color) 
      VALUES ('GAZIULAŞ', 'GAZIULAS', 
        (SELECT id FROM turkey_cities WHERE city_code = 'GAZ'), 
        'municipal', 'https://gaziantep.bel.tr', '#800080')
      ON CONFLICT (agency_code) DO NOTHING
    `;

    const gaziantepLines = [
      { code: '100', name: 'Şahinbey - İslahiye', type: 'bus', color: '#800080' },
      { code: '200', name: 'Şehitkamil - Karataş', type: 'bus', color: '#800080' },
      { code: '500', name: 'Üniversite - Havalimanı', type: 'bus', color: '#800080' }
    ];

    for (const line of gaziantepLines) {
      await sql`
        INSERT INTO transport_lines (line_code, line_name, line_type, city_id, agency_id, fare_price, frequency_minutes, vehicle_capacity, color_code) 
        SELECT ${line.code}, ${line.name}, ${line.type}, c.id, a.id, 4.00, 15, 80, ${line.color}
        FROM turkey_cities c, transport_agencies a 
        WHERE c.city_code = 'GAZ' AND a.agency_code = 'GAZIULAS'
        ON CONFLICT DO NOTHING
      `;
    }

    // İstatistikler
    const cityStats = await sql`
      SELECT 
        c.city_name,
        c.city_code,
        COUNT(tl.id) as line_count,
        COUNT(DISTINCT ta.id) as agency_count
      FROM turkey_cities c
      LEFT JOIN transport_lines tl ON c.id = tl.city_id
      LEFT JOIN transport_agencies ta ON c.id = ta.city_id
      WHERE c.transport_tier IN ('megapol', 'metropol', 'büyük')
      GROUP BY c.id, c.city_name, c.city_code
      ORDER BY line_count DESC
    `;

    console.log('\n🚌 TRANSPORT İSTATİSTİKLERİ:');
    for (const stat of cityStats.rows) {
      if (stat.line_count > 0) {
        console.log(`   ${stat.city_name} (${stat.city_code}): ${stat.line_count} hat, ${stat.agency_count} kurum`);
      }
    }

    const totalLines = await sql`SELECT COUNT(*) as total FROM transport_lines`;
    const totalAgencies = await sql`SELECT COUNT(*) as total FROM transport_agencies`;
    
    console.log(`\n🎉 TOPLAM: ${totalLines.rows[0].total} hat, ${totalAgencies.rows[0].total} kurum`);
    console.log('✅ Demo transport verileri başarıyla eklendi!');

  } catch (error) {
    console.error('❌ Demo veri ekleme hatası:', error);
    process.exit(1);
  }
}

addDemoTransportData();