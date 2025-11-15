/**
 * Ankara Static Locations Migration
 * lib/ankaraData.ts'deki lokasyonları database'e ekler
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Ankara Locations (lib/ankaraData.ts'den)
const locations = [
  {
    id: 'ank-1',
    name: 'Kızılay Kahve Diyarı',
    category: 'cafe',
    coordinates: [39.9208, 32.8541],
    address: 'Kızılay Meydanı No:5, Çankaya, Ankara',
    currentCrowdLevel: 'high',
    description: 'Kızılay meydanında merkezi lokasyon'
  },
  {
    id: 'ank-2',
    name: 'Tunalı Keyif Kahve',
    category: 'cafe',
    coordinates: [39.9168, 32.8573],
    address: 'Tunalı Hilmi Caddesi No:112, Kavaklıdere, Çankaya',
    currentCrowdLevel: 'moderate',
    description: 'Tunalı\'nın en popüler kahvelerinden'
  },
  {
    id: 'ank-3',
    name: 'Armada Bahçe Cafe',
    category: 'cafe',
    coordinates: [39.9228, 32.8563],
    address: 'Armada AVM, Söğütözü, Çankaya',
    currentCrowdLevel: 'low',
    description: 'AVM içinde huzurlu ortam'
  },
  {
    id: 'ank-4',
    name: 'Bahçelievler Lezzet Durağı',
    category: 'restaurant',
    coordinates: [39.9588, 32.8541],
    address: 'Bahçelievler Mahallesi, Çankaya',
    currentCrowdLevel: 'moderate',
    description: 'Aile dostu restaurant'
  },
  {
    id: 'ank-5',
    name: 'Ulus İskender',
    category: 'restaurant',
    coordinates: [39.9456, 32.8585],
    address: 'Ulus Meydanı, Altındağ',
    currentCrowdLevel: 'high',
    description: 'Ünlü İskender kebap'
  },
  {
    id: 'ank-6',
    name: 'Çankaya Alışveriş Merkezi',
    category: 'shopping',
    coordinates: [39.9138, 32.8548],
    address: 'Çankaya Caddesi No:28, Çankaya',
    currentCrowdLevel: 'high',
    description: 'Merkezi AVM'
  },
  {
    id: 'ank-7',
    name: 'Anıtpark',
    category: 'park',
    coordinates: [39.9388, 32.8532],
    address: 'Ulus, Altındağ',
    currentCrowdLevel: 'low',
    description: 'Tarihi park alanı'
  },
  {
    id: 'ank-8',
    name: 'Kuğulu Park',
    category: 'park',
    coordinates: [39.9028, 32.8565],
    address: 'Adnan Saygun Caddesi, Çankaya',
    currentCrowdLevel: 'moderate',
    description: 'Kuğulu göl manzarası'
  },
  {
    id: 'ank-9',
    name: 'Dikmen Vadisi',
    category: 'park',
    coordinates: [39.8928, 32.8645],
    address: 'Dikmen Vadisi, Çankaya',
    currentCrowdLevel: 'low',
    description: 'Doğa yürüyüşü parkuru'
  },
  {
    id: 'ank-10',
    name: 'Ankara Tren İstasyonu',
    category: 'transport',
    coordinates: [39.9408, 32.8532],
    address: 'Talat Paşa Bulvarı, Altındağ',
    currentCrowdLevel: 'high',
    description: 'Ana tren istasyonu'
  },
  {
    id: 'ank-11',
    name: 'Kızılay Metro İstasyonu',
    category: 'transport',
    coordinates: [39.9208, 32.8545],
    address: 'Kızılay Meydanı, Çankaya',
    currentCrowdLevel: 'very-high',
    description: 'En yoğun metro durağı'
  },
  {
    id: 'ank-12',
    name: 'Ankamall AVM',
    category: 'shopping',
    coordinates: [40.0018, 32.8093],
    address: 'Yaşamkent Mahallesi, Çayyolu',
    currentCrowdLevel: 'moderate',
    description: 'Büyük alışveriş merkezi'
  }
];

async function migrateLocations() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_UNPOOLED,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Database bağlantısı başarılı\n');

    let inserted = 0;
    let skipped = 0;

    for (const loc of locations) {
      try {
        // Önce var mı kontrol et
        const existing = await client.query(
          'SELECT id FROM cityv_locations WHERE id = $1',
          [loc.id]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️  ${loc.name} zaten mevcut`);
          skipped++;
          continue;
        }

        // Yeni lokasyon ekle
        await client.query(`
          INSERT INTO cityv_locations 
          (id, name, category, coordinates, address, description, "currentCrowdLevel", source, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `, [
          loc.id,
          loc.name,
          loc.category,
          loc.coordinates,
          loc.address,
          loc.description,
          loc.currentCrowdLevel,
          'static'
        ]);

        console.log(`✅ ${loc.name} eklendi`);
        inserted++;

      } catch (err) {
        console.error(`❌ ${loc.name} eklenirken hata:`, err.message);
      }
    }

    await client.end();

    console.log(`\n🎉 Migration tamamlandı!`);
    console.log(`  ✅ Eklenen: ${inserted}`);
    console.log(`  ⏭️  Atlanan: ${skipped}`);
    console.log(`  📍 Toplam: ${locations.length}`);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

migrateLocations();
