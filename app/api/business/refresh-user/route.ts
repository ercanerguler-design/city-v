import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Refreshing user data for ID: ${userId}`);

    // Get fresh user data from database
    const result = await sql`
      SELECT 
        id, 
        email, 
        full_name, 
        phone,
        membership_type, 
        membership_expiry_date, 
        max_cameras,
        is_active
      FROM business_users 
      WHERE id = ${userId} AND is_active = true
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result[0];

    console.log('✅ Fresh user data retrieved:', {
      id: user.id,
      email: user.email,
      membership_type: user.membership_type
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
        max_cameras: user.max_cameras || 1
      }
    });

  } catch (error: any) {
    console.error('❌ Refresh user error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh user data', details: error.message },
      { status: 500 }
    );
  }
}

