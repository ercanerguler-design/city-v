import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    console.log('📊 Admin stats API - fetching real database statistics...');

    // 1. Toplam kullanıcı sayıları (last_login kullan, last_sign_in_at yok)
    const usersResult = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN membership_tier != 'free' THEN 1 END) as premium_users,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as today_signups,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as week_signups,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as month_signups
      FROM users
    `;

    // 2. Business kullanıcıları
    const businessResult = await sql`
      SELECT 
        COUNT(*) as total_business,
        COUNT(CASE WHEN membership_type = 'premium' THEN 1 END) as premium_business,
        COUNT(CASE WHEN membership_type = 'enterprise' THEN 1 END) as enterprise_business
      FROM business_users 
      WHERE added_by_admin = true
    `;

    // 3. Beta başvuruları
    const betaResult = await sql`
      SELECT COUNT(*) as total_beta FROM beta_applications
    `;

    // 4. Business mekanları (profiles)
    const locationsResult = await sql`
      SELECT COUNT(*) as total_locations FROM business_profiles
    `;

    // 5. IoT cihazları (business_cameras)
    const devicesResult = await sql`
      SELECT COUNT(*) as total_devices FROM business_cameras WHERE is_active = true
    `;

    // 6. Crowd analysis verileri
    const crowdResult = await sql`
      SELECT COUNT(*) as total_analysis FROM iot_crowd_analysis
    `;

    // 7. Kampanyalar
    const campaignsResult = await sql`
      SELECT 
        COUNT(*) as total_campaigns,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_campaigns
      FROM business_campaigns
    `;

    // 8. Popüler mekanlar (business profiles'tan)
    const popularLocationsResult = await sql`
      SELECT 
        bp.id,
        bp.business_name as name,
        bp.business_type as category,
        bp.city,
        bp.district,
        COALESCE(COUNT(ica.id), 0) as visits
      FROM business_profiles bp
      LEFT JOIN business_cameras bc ON bp.id = bc.business_id
      LEFT JOIN iot_crowd_analysis ica ON bc.id = ica.camera_id
      GROUP BY bp.id, bp.business_name, bp.business_type, bp.city, bp.district
      ORDER BY visits DESC
      LIMIT 5
    `;

    // 9. Gelir hesaplama (business members)
    const revenueResult = await sql`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN membership_type = 'premium' THEN 2500
          WHEN membership_type = 'enterprise' THEN 5000
          ELSE 0
        END), 0) as business_revenue
      FROM business_users
      WHERE added_by_admin = true 
        AND membership_expiry_date > NOW()
    `;

    // Normal kullanıcılardan premium geliri (aylık + yıllık)
    const normalPremiumRevenue = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE premium_subscription_type = 'monthly') as monthly_count,
        COUNT(*) FILTER (WHERE premium_subscription_type = 'yearly') as yearly_count,
        COALESCE(SUM(CASE WHEN premium_subscription_type = 'monthly' THEN 49.99 ELSE 0 END), 0) as monthly_revenue,
        COALESCE(SUM(CASE WHEN premium_subscription_type = 'yearly' THEN 399.99 ELSE 0 END), 0) as yearly_revenue
      FROM users
      WHERE membership_tier = 'premium'
    `;

    const stats = usersResult[0];
    const business = businessResult[0];
    const beta = betaResult[0];
    const locations = locationsResult[0];
    const devices = devicesResult[0];
    const crowd = crowdResult[0];
    const campaigns = campaignsResult[0];
    const popularLocations = popularLocationsResult;
    const revenue = revenueResult[0];
    const normalRevenue = normalPremiumRevenue[0];

    console.log('💰 Revenue Data:', {
      business: revenue.business_revenue,
      monthlyCount: normalRevenue.monthly_count,
      yearlyCount: normalRevenue.yearly_count,
      monthlyRevenue: normalRevenue.monthly_revenue,
      yearlyRevenue: normalRevenue.yearly_revenue
    });

    const businessMonthlyRevenue = parseFloat(revenue.business_revenue || 0);
    
    // Premium gelir hesaplaması (toplam fiyatlar)
    const monthlyPremiumRevenue = parseFloat(normalRevenue.monthly_revenue || 0);
    const yearlyPremiumRevenue = parseFloat(normalRevenue.yearly_revenue || 0);
    const normalTotalRevenue = monthlyPremiumRevenue + yearlyPremiumRevenue;
    
    const totalRevenue = businessMonthlyRevenue + normalTotalRevenue;
    
    console.log('💰 Calculated Revenue:', {
      businessMonthly: businessMonthlyRevenue,
      monthlyPremium: monthlyPremiumRevenue,
      yearlyPremium: yearlyPremiumRevenue,
      normalTotal: normalTotalRevenue,
      grandTotal: totalRevenue
    });

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
          monthly: businessMonthlyRevenue, // Sadece aylık business geliri
          yearly: totalRevenue, // Toplam gelir (business aylık + tüm premium)
          total: totalRevenue,
          businessRevenue: businessMonthlyRevenue,
          normalPremiumRevenue: normalTotalRevenue,
          premiumBreakdown: {
            monthly: {
              count: parseInt(normalRevenue.monthly_count || 0),
              revenue: monthlyPremiumRevenue,
              price: 49.99
            },
            yearly: {
              count: parseInt(normalRevenue.yearly_count || 0),
              revenue: yearlyPremiumRevenue,
              price: 399.99
            }
          }
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
