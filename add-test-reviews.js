const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addTestReviews() {
  try {
    console.log('📋 Adding test reviews for business...');
    
    // Get business profile
    const businessProfile = await sql`
      SELECT bp.id as location_id, bp.business_name, bp.user_id
      FROM business_profiles bp
      LIMIT 1
    `;
    
    if (businessProfile.length === 0) {
      console.log('❌ No business profiles found');
      return;
    }
    
    const business = businessProfile[0];
    console.log('🏢 Found business:', business.business_name);
    console.log('   Location ID:', business.location_id);
    console.log('   User ID:', business.user_id);
    
    // Add test reviews
    const testReviews = [
      {
        userName: 'Ahmet Yılmaz',
        rating: 5,
        comment: 'Harika bir mekan, kesinlikle tekrar geleceğim!',
        sentiment: 'positive',
        priceRating: 4
      },
      {
        userName: 'Ayşe Demir',
        rating: 4,
        comment: 'Güzel atmosfer, personel çok ilgili.',
        sentiment: 'positive',
        priceRating: 4
      },
      {
        userName: 'Mehmet Kaya',
        rating: 3,
        comment: 'Fena değil ama biraz pahalı.',
        sentiment: 'neutral',
        priceRating: 2
      },
      {
        userName: 'Zeynep Çelik',
        rating: 5,
        comment: 'Mükemmel hizmet! Teşekkürler.',
        sentiment: 'positive',
        priceRating: 5
      },
      {
        userName: 'Can Özkan',
        rating: 2,
        comment: 'Beklediğimden daha kalabalıktı.',
        sentiment: 'negative',
        priceRating: 3
      }
    ];
    
    for (const review of testReviews) {
      await sql`
        INSERT INTO location_reviews (
          location_id, user_name, rating, comment, sentiment, price_rating
        ) VALUES (
          ${business.location_id},
          ${review.userName},
          ${review.rating},
          ${review.comment},
          ${review.sentiment},
          ${review.priceRating}
        )
      `;
      console.log('✅ Added review from:', review.userName);
    }
    
    console.log('🎉 All test reviews added successfully!');
    
    // Verify
    const reviewCount = await sql`
      SELECT COUNT(*) as count
      FROM location_reviews
      WHERE location_id = ${business.location_id}
    `;
    console.log(`📊 Total reviews for ${business.business_name}: ${reviewCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addTestReviews();
