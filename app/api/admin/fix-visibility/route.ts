import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 🔧 Admin API - Fix Business Visibility
 * Tüm business profiles'ları haritada görünür yap
 */
export async function POST() {
  try {
    console.log('🔧 Fixing business visibility settings...');
    
    // Check current state
    const checkResult = await query(
      `SELECT 
        user_id, 
        business_name, 
        city,
        is_visible_on_map, 
        auto_sync_to_cityv, 
        latitude, 
        longitude 
      FROM business_profiles`
    );
    
    console.log(`📊 Total business profiles: ${checkResult.rows.length}`);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No business profiles found'
      });
    }
    
    // Show current state
    const needsUpdate = checkResult.rows.filter(p => 
      !p.is_visible_on_map || !p.auto_sync_to_cityv
    );
    
    console.log(`⚠️ Profiles needing update: ${needsUpdate.length}`);
    
    // Update all profiles
    const updateResult = await query(
      `UPDATE business_profiles 
       SET 
         is_visible_on_map = true,
         auto_sync_to_cityv = true,
         updated_at = NOW()
       WHERE is_visible_on_map = false 
          OR auto_sync_to_cityv = false
          OR is_visible_on_map IS NULL
          OR auto_sync_to_cityv IS NULL
       RETURNING user_id, business_name, city, latitude, longitude`
    );
    
    console.log(`✅ Updated ${updateResult.rows.length} profiles`);
    
    // Verify
    const verifyResult = await query(
      `SELECT COUNT(*) as count
       FROM business_profiles
       WHERE is_visible_on_map = true 
         AND auto_sync_to_cityv = true
         AND latitude IS NOT NULL
         AND longitude IS NOT NULL`
    );
    
    return NextResponse.json({
      success: true,
      message: 'Business visibility fixed successfully',
      stats: {
        total: checkResult.rows.length,
        updated: updateResult.rows.length,
        visible: verifyResult.rows[0].count
      },
      updatedProfiles: updateResult.rows.map(p => ({
        userId: p.user_id,
        name: p.business_name,
        city: p.city,
        hasCoordinates: !!(p.latitude && p.longitude)
      }))
    });
    
  } catch (error: any) {
    console.error('❌ Fix visibility error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fix visibility',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Check current visibility status
 */
export async function GET() {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_visible_on_map = true) as visible,
        COUNT(*) FILTER (WHERE auto_sync_to_cityv = true) as auto_sync,
        COUNT(*) FILTER (
          WHERE is_visible_on_map = true 
            AND auto_sync_to_cityv = true 
            AND latitude IS NOT NULL 
            AND longitude IS NOT NULL
        ) as ready_for_map
      FROM business_profiles`
    );
    
    return NextResponse.json({
      success: true,
      stats: result.rows[0]
    });
    
  } catch (error: any) {
    console.error('❌ Check visibility error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
