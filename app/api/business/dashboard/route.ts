import { NextRequest, NextResponse } from 'next/server';

// Generate realistic business metrics with live patterns
function generateBusinessMetrics() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Professional business patterns
  let timeMultiplier = 0.5; // Base night/early morning
  
  // Business hours pattern (realistic for retail/restaurants)
  if (hour >= 9 && hour <= 11) timeMultiplier = 0.7 + Math.random() * 0.2; // Morning
  else if (hour >= 12 && hour <= 14) timeMultiplier = 1.2 + Math.random() * 0.3; // Lunch peak
  else if (hour >= 15 && hour <= 17) timeMultiplier = 0.9 + Math.random() * 0.2; // Afternoon
  else if (hour >= 18 && hour <= 21) timeMultiplier = 1.4 + Math.random() * 0.4; // Evening peak
  else if (hour >= 22 || hour <= 8) timeMultiplier = 0.3 + Math.random() * 0.2; // Night
  
  // Weekend boost for retail/entertainment
  const dayMultiplier = now.getDay() === 0 || now.getDay() === 6 ? 1.3 : 1.0;
  
  // Add minute-level fluctuation for real-time feeling
  const minuteFluctuation = 1 + (Math.sin(minute / 60 * 2 * Math.PI) * 0.1);
  
  const baseRevenue = 52000; // Higher base for professional appearance
  const revenue = Math.round(baseRevenue * timeMultiplier * dayMultiplier * minuteFluctuation);
  const customers = Math.round(revenue / 28); // ~28 TL average per customer
  const occupancy = Math.min(98, Math.round(45 + (timeMultiplier * 35) + Math.random() * 10));
  
  return {
    totalRevenue: revenue,
    totalCustomers: customers,
    averageOccupancy: occupancy,
    aiAccuracy: 95.2 + Math.random() * 3.8, // 95-99% range
    energySavings: Math.round(3200 + Math.random() * 600),
    costReduction: Math.round(22 + Math.random() * 6),
    timestamp: now.toISOString(),
    peakTime: hour >= 12 && hour <= 14 || hour >= 18 && hour <= 21
  };
}

// Generate location-specific data
function generateLocationData() {
  const locations = [
    {
      id: 'retail-001',
      name: 'Kızılay Retail Store',
      type: 'Retail',
      status: 'active',
      customers: Math.round(45 + Math.random() * 30),
      revenue: Math.round(8000 + Math.random() * 4000),
      occupancy: Math.round(65 + Math.random() * 25),
      alerts: Math.random() > 0.8 ? 1 : 0,
      aiAccuracy: 96 + Math.round(Math.random() * 3)
    },
    {
      id: 'restaurant-001',
      name: 'Tunalı Restaurant',
      type: 'Restaurant',
      status: 'active',
      customers: Math.round(35 + Math.random() * 25),
      revenue: Math.round(12000 + Math.random() * 8000),
      occupancy: Math.round(70 + Math.random() * 20),
      alerts: 0,
      aiAccuracy: 97 + Math.round(Math.random() * 2)
    },
    {
      id: 'office-001',
      name: 'Çankaya Office',
      type: 'Office',
      status: 'active',
      customers: Math.round(80 + Math.random() * 40),
      revenue: Math.round(15000 + Math.random() * 5000),
      occupancy: Math.round(75 + Math.random() * 15),
      alerts: 0,
      aiAccuracy: 99 + Math.round(Math.random() * 1)
    },
    {
      id: 'parking-001',
      name: 'Kavaklıdere Parking',
      type: 'Parking',
      status: 'active',
      customers: Math.round(120 + Math.random() * 80),
      revenue: Math.round(6000 + Math.random() * 3000),
      occupancy: Math.round(55 + Math.random() * 35),
      alerts: Math.random() > 0.9 ? 1 : 0,
      aiAccuracy: 94 + Math.round(Math.random() * 4)
    }
  ];

  return locations;
}

// Generate hourly analytics for charts
function generateHourlyData() {
  const hours = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
    const hourValue = hour.getHours();
    
    // Realistic business patterns
    let multiplier = 0.3;
    if (hourValue >= 9 && hourValue <= 18) multiplier = 0.8 + Math.random() * 0.4;
    else if (hourValue >= 19 && hourValue <= 22) multiplier = 1.0 + Math.random() * 0.3;
    
    hours.push({
      hour: hour.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      revenue: Math.round(2000 * multiplier),
      customers: Math.round(80 * multiplier),
      occupancy: Math.round(30 + (multiplier * 50))
    });
  }
  
  return hours;
}

// Generate recent activities
function generateRecentActivities() {
  const activities = [
    'Customer flow increased by 15% in Kızılay store',
    'AI detection optimized - accuracy improved to 99.2%',
    'Energy consumption reduced by 8% across all locations',
    'Peak occupancy alert resolved in Tunalı restaurant',
    'New customer behavior pattern detected',
    'Revenue milestone: 50K TL daily target achieved',
    'System performance optimized - response time improved',
    'Security alert: Unusual activity detected and resolved'
  ];

  return activities
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((activity, index) => ({
      id: index + 1,
      message: activity,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      type: Math.random() > 0.7 ? 'alert' : 'info'
    }));
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataType = searchParams.get('type') || 'all';

    let responseData: any = {};

    if (dataType === 'all' || dataType === 'metrics') {
      responseData.metrics = generateBusinessMetrics();
    }

    if (dataType === 'all' || dataType === 'locations') {
      responseData.locations = generateLocationData();
    }

    if (dataType === 'all' || dataType === 'analytics') {
      responseData.hourlyAnalytics = generateHourlyData();
    }

    if (dataType === 'all' || dataType === 'activities') {
      responseData.recentActivities = generateRecentActivities();
    }

    // Add summary for investors
    if (dataType === 'all') {
      responseData.summary = {
        totalLocations: 4,
        activeDevices: 12,
        monthlyGrowth: 23.5,
        customerSatisfaction: 94.2,
        systemUptime: 99.8,
        roiPercentage: 285,
        lastUpdated: new Date().toISOString()
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Business dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business data' },
      { status: 500 }
    );
  }
}
