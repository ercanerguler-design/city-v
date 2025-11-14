import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 💬 Location Reviews API
 * Kullanıcılar işletmelere yorum ve duygu ekleyebilir
 */

// POST: Yeni review ekle
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      locationId,
      userId,
      userEmail,
      userName,
      rating,
      comment,
      sentiment,
      priceRating,
      tags
    } = body;

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'Location ID gerekli' },
        { status: 400 }
      );
    }

    console.log('💬 Adding review:', { locationId, userId, sentiment, priceRating });

    // Insert review - WITHOUT tags (column doesn't exist)
    const result = await query(
      `INSERT INTO location_reviews (
        location_id, user_id, user_email, user_name,
        rating, comment, sentiment, price_rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at`,
      [
        locationId,
        userId || null,
        userEmail || null,
        userName || 'Anonim Kullanıcı',
        rating || null,
        comment || null,
        sentiment || null,
        priceRating || null
      ]
    );

    console.log('✅ Review added:', result.rows[0]);

    // 🔔 Create notification for business owner
    try {
      // Find business_user_id from location_id
      const businessResult = await query(
        `SELECT bp.user_id, bp.business_name
         FROM business_profiles bp
         WHERE bp.location_id = $1`,
        [locationId]
      );

      if (businessResult.rows.length > 0) {
        const businessUserId = businessResult.rows[0].user_id;
        const businessName = businessResult.rows[0].business_name;

        // Create sentiment emoji
        const sentimentEmoji = sentiment === 'positive' ? '😊' 
                             : sentiment === 'negative' ? '😞' 
                             : sentiment === 'neutral' ? '😐' : '';

        // Create rating stars
        const ratingStars = rating ? '⭐'.repeat(rating) : '';

        await query(
          `INSERT INTO business_notifications (
            business_user_id, type, title, message, data
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            businessUserId,
            'review',
            'Yeni Yorum Aldınız!',
            `${userName} ${businessName} için ${ratingStars} ${sentimentEmoji} yorum yaptı`,
            JSON.stringify({
              locationId,
              userId,
              userName,
              rating,
              sentiment,
              priceRating,
              comment: comment ? comment.substring(0, 100) : null,
              reviewId: result.rows[0].id
            })
          ]
        );

        console.log(`🔔 Notification created for business user ${businessUserId}`);
      }
    } catch (notifError) {
      // Don't fail the review if notification fails
      console.error('⚠️ Notification creation failed:', notifError.message);
    }

    return NextResponse.json({
      success: true,
      reviewId: result.rows[0].id,
      createdAt: result.rows[0].created_at,
      message: 'Yorum başarıyla eklendi!'
    });

  } catch (error: any) {
    console.error('❌ Review add error:', error);
    
    // Handle unique constraint violation (spam prevention)
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Bu işletme için zaten yorum yaptınız' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Yorum eklenemedi',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET: Reviews listele
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId');
    const businessUserId = searchParams.get('businessUserId');
    const limit = searchParams.get('limit') || '50';
    const getSummary = searchParams.get('summary') === 'true';

    // Business sayfası için: businessUserId'ye göre filtrele
    if (businessUserId) {
      const businessResult = await query(
        `SELECT lr.*, bp.business_name
         FROM location_reviews lr
         JOIN business_profiles bp ON lr.location_id = bp.location_id
         WHERE bp.user_id = $1
         ORDER BY lr.created_at DESC
         LIMIT $2`,
        [businessUserId, parseInt(limit)]
      );

      // Stats hesapla
      const stats = {
        total: businessResult.rows.length,
        avgRating: businessResult.rows.reduce((sum, r) => sum + (r.rating || 0), 0) / businessResult.rows.length || 0,
        sentimentCounts: businessResult.rows.reduce((acc: any, r) => {
          if (r.sentiment) {
            acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
          }
          return acc;
        }, {})
      };

      console.log(`📊 Found ${businessResult.rows.length} reviews for business user ${businessUserId}`);

      return NextResponse.json({
        success: true,
        reviews: businessResult.rows,
        stats,
        count: businessResult.rows.length
      });
    }

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'Location ID veya Business User ID gerekli' },
        { status: 400 }
      );
    }

    if (getSummary) {
      // Summary view
      const summaryResult = await query(
        `SELECT * FROM location_review_summary WHERE location_id = $1`,
        [locationId]
      );

      const summary = summaryResult.rows[0] || {
        location_id: locationId,
        total_reviews: 0,
        avg_rating: 0,
        unique_reviewers: 0,
        happy_count: 0,
        sad_count: 0,
        angry_count: 0,
        excited_count: 0,
        disappointed_count: 0,
        very_cheap_count: 0,
        cheap_count: 0,
        fair_count: 0,
        expensive_count: 0,
        very_expensive_count: 0
      };

      return NextResponse.json({
        success: true,
        summary
      });
    }

    // Full reviews
    const result = await query(
      `SELECT 
        id,
        user_name,
        rating,
        comment,
        sentiment,
        price_rating,
        tags,
        helpful_count,
        created_at,
        is_verified
       FROM location_reviews
       WHERE location_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [locationId, parseInt(limit)]
    );

    console.log(`📊 Found ${result.rows.length} reviews for ${locationId}`);

    return NextResponse.json({
      success: true,
      reviews: result.rows,
      count: result.rows.length
    });

  } catch (error: any) {
    console.error('❌ Review fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Yorumlar getirilemedi',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT: Helpful vote
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID gerekli' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE location_reviews 
       SET helpful_count = helpful_count + 1 
       WHERE id = $1`,
      [reviewId]
    );

    return NextResponse.json({
      success: true,
      message: 'Faydalı oy eklendi'
    });

  } catch (error: any) {
    console.error('❌ Helpful vote error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Oy eklenemedi',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
