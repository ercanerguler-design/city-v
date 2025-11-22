import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 🔄 Business Profile Sync to City-V
 * Business profile güncellendiğinde çalışma saatlerini ve bilgileri senkronize eder
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessUserId,
      workingHours,
      isVisibleOnMap,
      autoSyncToCityv,
      category
    } = body;

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'Business User ID gerekli' },
        { status: 400 }
      );
    }

    console.log('🔄 Syncing business to City-V:', {
      businessUserId,
      hasWorkingHours: !!workingHours,
      isVisibleOnMap,
      autoSyncToCityv
    });

    // Update business profile
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (workingHours !== undefined) {
      updateFields.push(`working_hours = $${paramIndex}::jsonb`);
      updateValues.push(JSON.stringify(workingHours));
      paramIndex++;
    }

    if (isVisibleOnMap !== undefined) {
      updateFields.push(`is_visible_on_map = $${paramIndex}`);
      updateValues.push(isVisibleOnMap);
      paramIndex++;
    }

    if (autoSyncToCityv !== undefined) {
      updateFields.push(`auto_sync_to_cityv = $${paramIndex}`);
      updateValues.push(autoSyncToCityv);
      paramIndex++;
    }

    if (category !== undefined) {
      updateFields.push(`category = $${paramIndex}`);
      updateValues.push(category);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Güncellenecek alan yok' },
        { status: 400 }
      );
    }

    updateValues.push(businessUserId);

    const result = await query(
      `UPDATE business_profiles 
       SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE user_id = $${paramIndex}
       RETURNING location_id, business_name, category, is_visible_on_map, auto_sync_to_cityv`,
      updateValues
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Business profile bulunamadı' },
        { status: 404 }
      );
    }

    const profile = result.rows[0];

    console.log('✅ Business synced:', profile);

    // Dispatch event to refresh map (optional)
    // You can use this in frontend to refresh locations

    return NextResponse.json({
      success: true,
      message: 'Business City-V\'ye senkronize edildi',
      profile: {
        locationId: profile.location_id,
        businessName: profile.business_name,
        category: profile.category,
        isVisibleOnMap: profile.is_visible_on_map,
        autoSyncToCityv: profile.auto_sync_to_cityv
      }
    });

  } catch (error: any) {
    console.error('❌ Business sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Senkronizasyon başarısız',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * 📊 Get Business Sync Status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUserId = searchParams.get('businessUserId');

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'Business User ID gerekli' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        location_id,
        business_name,
        category,
        latitude,
        longitude,
        is_visible_on_map,
        auto_sync_to_cityv,
        working_hours,
        current_crowd_level,
        average_wait_time,
        rating,
        review_count
       FROM business_profiles
       WHERE user_id = $1`,
      [businessUserId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        synced: false,
        message: 'Henüz City-V\'de görünmüyor'
      });
    }

    const profile = result.rows[0];
    const isSynced = profile.is_visible_on_map && 
                     profile.auto_sync_to_cityv && 
                     profile.latitude && 
                     profile.longitude;

    return NextResponse.json({
      success: true,
      synced: isSynced,
      profile: {
        locationId: profile.location_id,
        businessName: profile.business_name,
        category: profile.category,
        hasCoordinates: !!(profile.latitude && profile.longitude),
        isVisibleOnMap: profile.is_visible_on_map,
        autoSyncToCityv: profile.auto_sync_to_cityv,
        hasWorkingHours: !!profile.working_hours,
        currentCrowdLevel: profile.current_crowd_level,
        averageWaitTime: profile.average_wait_time,
        rating: parseFloat(profile.rating || 0),
        reviewCount: parseInt(profile.review_count || 0)
      }
    });

  } catch (error: any) {
    console.error('❌ Sync status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Durum alınamadı',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

