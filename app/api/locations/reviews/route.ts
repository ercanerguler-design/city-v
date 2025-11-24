import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

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

    console.log('💬 Adding review:', { 
      locationId, 
      userId, 
      userEmail,
      userName,
      rating,
      comment: comment ? comment.substring(0, 50) + '...' : null,
      sentiment, 
      priceRating 
    });

    // locationId aslında business_profiles.id (frontend'den gelen)
    // Bunu VARCHAR olarak cast edip location_id'ye yazıyoruz
    const locationIdStr = String(locationId);

    // Insert review - location_id VARCHAR olarak
    const result = await sql`
      INSERT INTO location_reviews (
        location_id, user_id, user_email, user_name,
        rating, comment, sentiment, price_rating
      ) VALUES (
        ${locationIdStr},
        ${userId || null},
        ${userEmail || null},
        ${userName || 'Anonim Kullanıcı'},
        ${rating || null},
        ${comment || null},
        ${sentiment || null},
        ${priceRating || null}
      )
      RETURNING id, created_at
    `;

    console.log('✅ Review added successfully:', result[0]);

    // 🔔 Create notification for business owner
    try {
      // locationId = business_profiles.id (frontend'den gelen)
      // Cast to integer for query
      const businessProfileId = parseInt(locationId);
      
      const businessResult = await sql`
        SELECT bp.user_id, bp.business_name
        FROM business_profiles bp
        WHERE bp.id = ${businessProfileId}
      `;

      if (businessResult.length > 0) {
        const businessUserId = businessResult[0].user_id;
        const businessName = businessResult[0].business_name;

        // Create sentiment emoji
        const sentimentEmoji = sentiment === 'positive' ? '😊' 
                             : sentiment === 'negative' ? '😞' 
                             : sentiment === 'neutral' ? '😐' : '';

        // Create rating stars
        const ratingStars = rating ? '⭐'.repeat(rating) : '';

        await sql`
          INSERT INTO business_notifications (
            business_user_id, type, title, message, data
          ) VALUES (
            ${businessUserId},
            ${'review'},
            ${'Yeni Yorum Aldınız!'},
            ${`${userName} ${businessName} için ${ratingStars} ${sentimentEmoji} yorum yaptı`},
            ${JSON.stringify({
              locationId,
              userId,
              userName,
              rating,
              sentiment,
              priceRating,
              comment: comment ? comment.substring(0, 100) : null,
              reviewId: result[0].id
            })}
          )
        `;

        console.log(`🔔 Notification created for business user ${businessUserId}`);
      }
    } catch (notifError) {
      // Don't fail the review if notification fails
      console.error('⚠️ Notification creation failed:', notifError.message);
    }

    return NextResponse.json({
      success: true,
      reviewId: result[0].id,
      createdAt: result[0].created_at,
      message: 'Yorum başarıyla eklendi!'
    });

  } catch (error: any) {
    console.error('❌ Review add error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    // Handle unique constraint violation (spam prevention)
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Bu işletme için zaten yorum yaptınız' },
        { status: 409 }
      );
    }

    // Handle foreign key violation
    if (error.code === '23503') {
      return NextResponse.json(
        { success: false, error: 'Geçersiz konum veya kullanıcı ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Yorum eklenemedi',
        details: error.message,
        code: error.code
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
      console.log('🔍 Business reviews query for user ID:', businessUserId);
      
      // Önce business_profiles'dan location_id'yi al
      const profileResult = await sql`
        SELECT location_id FROM business_profiles WHERE user_id = ${businessUserId}
      `;
      
      if (profileResult.length === 0) {
        console.log('⚠️ Business profile not found for user:', businessUserId);
        return NextResponse.json({
          success: true,
          reviews: [],
          stats: { total: 0, avgRating: 0, sentimentCounts: {} },
          count: 0
        });
      }
      
      const locationId = profileResult[0].location_id;
      console.log('🏪 Location ID for business:', locationId);
      
      const businessResult = await sql`
        SELECT lr.*, bp.business_name
        FROM location_reviews lr
        JOIN business_profiles bp ON lr.location_id = bp.location_id
        WHERE lr.location_id = ${locationId}
        ORDER BY lr.created_at DESC
        LIMIT ${parseInt(limit)}
      `;

      console.log('📊 Found reviews:', businessResult.length);
      if (businessResult.length > 0) {
        console.log('📝 Sample review:', {
          id: businessResult[0].id,
          location_id: businessResult[0].location_id,
          user_name: businessResult[0].user_name,
          sentiment: businessResult[0].sentiment,
          comment: businessResult[0].comment
        });
      }

      // Stats hesapla
      const stats = {
        total: businessResult.length,
        avgRating: businessResult.reduce((sum, r) => sum + (r.rating || 0), 0) / businessResult.length || 0,
        sentimentCounts: businessResult.reduce((acc: any, r) => {
          if (r.sentiment) {
            acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
          }
          return acc;
        }, {})
      };

      console.log(`📊 Found ${businessResult.length} reviews for business user ${businessUserId}`);

      return NextResponse.json({
        success: true,
        reviews: businessResult,
        stats: stats,
        count: businessResult.length
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
      const summaryResult = await sql`
        SELECT * FROM location_review_summary WHERE location_id = ${locationId}
      `;

      const summary = summaryResult[0] || {
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
    const result = await sql`
      SELECT 
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
       WHERE location_id = ${locationId}
       ORDER BY created_at DESC
       LIMIT ${parseInt(limit)}
    `;

    console.log(`📊 Found ${result.length} reviews for ${locationId}`);

    return NextResponse.json({
      success: true,
      reviews: result,
      count: result.length
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

    await sql(
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
