require('dotenv').config({ path: '.env.local' });

const VERCEL_ENVIRONMENT_VARIABLES = {
  // Database
  DATABASE_URL: process.env.POSTGRES_URL,
  POSTGRES_URL: process.env.POSTGRES_URL,
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
  
  // Google Services
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  
  // API Configuration
  NEXT_PUBLIC_API_URL: 'https://city-v-ercanerguler-design-ercanergulers-projects.vercel.app',
  JWT_SECRET: process.env.JWT_SECRET || 'cityv-business-secret-2024',
  
  // Email Service
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  
  // Weather API
  WEATHER_API_KEY: process.env.WEATHER_API_KEY,
  
  // KV Storage
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  
  // Notification System
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY
};

console.log('🔧 Vercel Environment Variables for city-v-chi.vercel.app\n');
console.log('📋 Copy these to Vercel Dashboard > Settings > Environment Variables:\n');

Object.entries(VERCEL_ENVIRONMENT_VARIABLES).forEach(([key, value]) => {
  if (value) {
    const displayValue = key.includes('SECRET') || key.includes('TOKEN') || key.includes('KEY') || key.includes('URL')
      ? `${value.substring(0, 20)}...`
      : value;
    console.log(`${key}=${displayValue}`);
  } else {
    console.log(`${key}=*** NOT_SET ***`);
  }
});

console.log('\n🌐 Domain Configuration:');
console.log('Production URL:', VERCEL_ENVIRONMENT_VARIABLES.NEXT_PUBLIC_API_URL);
console.log('Google OAuth Origins: http://localhost:3000, https://city-v-chi.vercel.app');
console.log('Database Ready:', !!VERCEL_ENVIRONMENT_VARIABLES.POSTGRES_URL);

console.log('\n🚀 Next Steps:');
console.log('1. Copy environment variables to Vercel Dashboard');
console.log('2. Update Google OAuth settings in Google Cloud Console');
console.log('3. Test deployment: https://city-v-chi.vercel.app');
console.log('4. Test business login: https://city-v-chi.vercel.app/business/dashboard');

// Test database connection
async function testConnection() {
  try {
    const { sql } = require('@vercel/postgres');
    const result = await sql`SELECT COUNT(*) as total FROM business_users`;
    console.log('\n✅ Database Connection Test Successful');
    console.log(`📊 Business Users: ${result.rows[0].total}`);
  } catch (error) {
    console.error('\n❌ Database Connection Test Failed:', error.message);
  }
}

testConnection();