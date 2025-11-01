import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Toplam kullanıcı sayıları (last_login kullan, last_sign_in_at yok)
    const usersResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN membership_tier != 'free' THEN 1 END) as premium_users,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as today_signups,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as week_signups,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as month_signups
      FROM users
    `);

    // 2. Business kullanıcıları
    const businessResult = await query(`
      SELECT 
        COUNT(*) as total_business,
        COUNT(CASE WHEN membership_type = 'premium' THEN 1 END) as premium_business,
        COUNT(CASE WHEN membership_type = 'enterprise' THEN 1 END) as enterprise_business
      FROM business_users 
      WHERE added_by_admin = true
    `);

    // 3. Beta başvuruları
    const betaResult = await query(`
      SELECT COUNT(*) as total_beta FROM beta_applications
    `);

    // 4. Business mekanları (profiles)
    const locationsResult = await query(`
      SELECT COUNT(*) as total_locations FROM business_profiles
    `);

    // 5. IoT cihazları
    const devicesResult = await query(`
      SELECT COUNT(*) as total_devices FROM iot_devices
    `);

    // 6. Crowd analysis verileri
    const crowdResult = await query(`
      SELECT COUNT(*) as total_analysis FROM iot_crowd_analysis
    `);

    // 7. Kampanyalar
    const campaignsResult = await query(`
      SELECT 
        COUNT(*) as total_campaigns,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_campaigns
      FROM business_campaigns
    `);

    // 8. Popüler mekanlar (business profiles'tan)
    const popularLocationsResult = await query(`
      SELECT 
        bp.id,
        bp.business_name as name,
        bp.business_type as category,
        bp.city,
        bp.district,
        COALESCE(COUNT(ica.id), 0) as visits
      FROM business_profiles bp
      LEFT JOIN iot_devices id ON bp.id = id.business_id
      LEFT JOIN iot_crowd_analysis ica ON id.device_id = ica.device_id
      GROUP BY bp.id, bp.business_name, bp.business_type, bp.city, bp.district
      ORDER BY visits DESC
      LIMIT 5
    `);

    // 9. Gelir hesaplama (business members'tan)
    const revenueResult = await query(`
      SELECT 
        SUM(CASE 
          WHEN membership_type = 'premium' THEN 499
          WHEN membership_type = 'enterprise' THEN 999
          ELSE 0
        END) as monthly_revenue
      FROM business_users
      WHERE added_by_admin = true 
        AND membership_expiry_date > NOW()
    `);

    const stats = usersResult.rows[0];
    const business = businessResult.rows[0];
    const beta = betaResult.rows[0];
    const locations = locationsResult.rows[0];
    const devices = devicesResult.rows[0];
    const crowd = crowdResult.rows[0];
    const campaigns = campaignsResult.rows[0];
    const popularLocations = popularLocationsResult.rows;
    const revenue = revenueResult.rows[0];

    const monthlyRevenue = parseInt(revenue.monthly_revenue || 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: parseInt(stats.total_users),
        activeUsers: parseInt(stats.active_users),
        premiumUsers: parseInt(stats.premium_users),
        totalBusinessMembers: parseInt(business.total_business),
        premiumBusiness: parseInt(business.premium_business),
        enterpriseBusiness: parseInt(business.enterprise_business),
        totalBetaApplications: parseInt(beta.total_beta),
        totalLocations: parseInt(locations.total_locations),
        totalDevices: parseInt(devices.total_devices),
        totalCrowdAnalysis: parseInt(crowd.total_analysis),
        totalCampaigns: parseInt(campaigns.total_campaigns),
        activeCampaigns: parseInt(campaigns.active_campaigns),
        totalReports: 0, // Eğer reports tablosu varsa buraya eklenebilir
        totalCheckIns: 0, // Eğer check-ins tablosu varsa buraya eklenebilir
        totalFavorites: 0,
        totalTrackedLocations: 0,
        totalComments: 0,
        totalPhotos: 0,
        revenue: {
          monthly: monthlyRevenue,
          yearly: monthlyRevenue * 12,
          total: monthlyRevenue * 12, // Basitleştirilmiş hesaplama
        },
        userGrowth: {
          today: parseInt(stats.today_signups),
          week: parseInt(stats.week_signups),
          month: parseInt(stats.month_signups),
        },
        popularLocations: popularLocations.map(loc => ({
          id: loc.id?.toString() || '',
          name: loc.name || 'İsimsiz Mekan',
          category: loc.category || 'Diğer',
          location: `${loc.district || ''}, ${loc.city || ''}`.trim(),
          visits: parseInt(loc.visits) || 0,
          reports: 0
        })),
        recentActivities: [] // Eğer activity log varsa buraya eklenebilir
      }
    });

  } catch (error) {
    console.error('❌ Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'İstatistikler yüklenemedi' },
      { status: 500 }
    );
  }
}
