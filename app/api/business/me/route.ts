import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

export async function GET(request: NextRequest) {
  try {
    // Token'ı al
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('business_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Token'ı verify et
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    console.log(`🔍 Fetching fresh user data for ID: ${userId}`);

    // Database'den FRESH user data çek
    const userResult = await sql`
      SELECT 
        id, 
        email, 
        full_name, 
        phone,
        membership_type, 
        membership_expiry_date, 
        max_cameras,
        campaign_credits,
        license_key,
        subscription_tier,
        is_active,
        created_at
      FROM business_users 
      WHERE id = ${userId} AND is_active = true
    `;

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Business profile'ı çek
    const profileResult = await sql`
      SELECT 
        id,
        location_id,
        business_name,
        category,
        address,
        city,
        district,
        postal_code,
        latitude,
        longitude,
        phone as business_phone,
        website,
        description,
        working_hours,
        business_type,
        is_visible_on_map,
        auto_sync_to_cityv,
        current_crowd_level,
        average_wait_time,
        rating,
        review_count,
        photos
      FROM business_profiles 
      WHERE user_id = ${userId}
    `;

    const profile = profileResult.length > 0 ? profileResult[0] : null;

    console.log('✅ Fresh data fetched:', {
      id: user.id,
      email: user.email,
      membership: user.membership_type,
      hasProfile: !!profile
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        membership_type: user.membership_type || 'free',
        membership_expiry_date: user.membership_expiry_date,
        max_cameras: user.max_cameras || 1,
        campaign_credits: user.campaign_credits || 0,
        license_key: user.license_key,
        subscription_tier: user.subscription_tier,
        created_at: user.created_at
      },
      profile: profile ? {
        id: profile.id,
        location_id: profile.location_id,
        business_name: profile.business_name,
        category: profile.category,
        address: profile.address,
        city: profile.city,
        district: profile.district,
        postal_code: profile.postal_code,
        latitude: profile.latitude,
        longitude: profile.longitude,
        phone: profile.business_phone,
        website: profile.website,
        description: profile.description,
        working_hours: profile.working_hours,
        business_type: profile.business_type,
        is_visible_on_map: profile.is_visible_on_map,
        auto_sync_to_cityv: profile.auto_sync_to_cityv,
        current_crowd_level: profile.current_crowd_level,
        average_wait_time: profile.average_wait_time,
        rating: profile.rating,
        review_count: profile.review_count,
        photos: profile.photos
      } : null
    });

  } catch (error: any) {
    console.error('❌ /api/business/me error:', error);
    return NextResponse.json(
      { error: 'Veri çekme hatası', details: error.message },
      { status: 500 }
    );
  }
}
