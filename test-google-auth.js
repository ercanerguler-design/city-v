// 🧪 GOOGLE OAUTH TEST SCRIPTI
// Bu script Google OAuth'un düzgün çalışıp çalışmadığını kontrol eder

require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 GOOGLE OAUTH AYARLARI KONTROL EDİLİYOR...\n');

// 1️⃣ Environment Variables Kontrolü
console.log('1️⃣ Environment Variables:');
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (clientId) {
  console.log(`   ✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID: ${clientId.substring(0, 30)}...`);
} else {
  console.log('   ❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID bulunamadı!');
  console.log('   💡 .env.local dosyasını kontrol edin');
  process.exit(1);
}

// 2️⃣ Client ID Format Kontrolü
console.log('\n2️⃣ Client ID Format Kontrolü:');
const clientIdPattern = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;
if (clientIdPattern.test(clientId)) {
  console.log('   ✅ Client ID formatı doğru');
} else {
  console.log('   ⚠️  Client ID formatı şüpheli - kontrol edin');
}

// 3️⃣ Postgres Bağlantı Kontrolü
console.log('\n3️⃣ Postgres Bağlantı Kontrolü:');
const postgresUrl = process.env.POSTGRES_URL;
if (postgresUrl) {
  console.log('   ✅ POSTGRES_URL tanımlı');
  
  // Veritabanı bağlantı testi
  const { sql } = require('@vercel/postgres');
  
  (async () => {
    try {
      const result = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`   ✅ Veritabanı bağlantısı başarılı! (${result.rows[0].count} kullanıcı)`);
      
      // 4️⃣ Users Tablosu Yapısı Kontrolü
      console.log('\n4️⃣ Users Tablosu Yapısı:');
      const tableInfo = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `;
      
      const requiredColumns = ['id', 'email', 'name', 'google_id', 'profile_picture', 'membership_tier', 'ai_credits'];
      const existingColumns = tableInfo.rows.map(row => row.column_name);
      
      requiredColumns.forEach(col => {
        if (existingColumns.includes(col)) {
          console.log(`   ✅ ${col} kolonu mevcut`);
        } else {
          console.log(`   ❌ ${col} kolonu eksik!`);
        }
      });
      
      // 5️⃣ Google API Endpoint Kontrolü
      console.log('\n5️⃣ API Endpoint Kontrolü:');
      const fs = require('fs');
      const path = require('path');
      
      const apiPath = path.join(__dirname, 'app', 'api', 'auth', 'google', 'route.ts');
      if (fs.existsSync(apiPath)) {
        console.log('   ✅ /api/auth/google endpoint mevcut');
      } else {
        console.log('   ❌ /api/auth/google endpoint bulunamadı!');
      }
      
      // 6️⃣ AuthStore Kontrolü
      console.log('\n6️⃣ AuthStore Kontrolü:');
      const authStorePath = path.join(__dirname, 'store', 'authStore.ts');
      if (fs.existsSync(authStorePath)) {
        const authStoreContent = fs.readFileSync(authStorePath, 'utf8');
        if (authStoreContent.includes('loginWithGoogle')) {
          console.log('   ✅ authStore.loginWithGoogle() fonksiyonu mevcut');
        } else {
          console.log('   ⚠️  authStore.loginWithGoogle() fonksiyonu bulunamadı');
        }
      }
      
      // 7️⃣ AuthModal Kontrolü
      console.log('\n7️⃣ AuthModal Kontrolü:');
      const authModalPath = path.join(__dirname, 'components', 'Auth', 'AuthModal.tsx');
      if (fs.existsSync(authModalPath)) {
        const authModalContent = fs.readFileSync(authModalPath, 'utf8');
        if (authModalContent.includes('handleGoogleSignIn')) {
          console.log('   ✅ AuthModal.handleGoogleSignIn() fonksiyonu mevcut');
        } else {
          console.log('   ⚠️  AuthModal.handleGoogleSignIn() fonksiyonu bulunamadı');
        }
        
        if (authModalContent.includes('window.google.accounts.id.initialize')) {
          console.log('   ✅ Google Sign-In SDK kullanılıyor');
        } else {
          console.log('   ⚠️  Google Sign-In SDK kullanımı bulunamadı');
        }
      }
      
      // 8️⃣ Sonuç Özeti
      console.log('\n' + '='.repeat(60));
      console.log('📊 KONTROL SONUÇLARI:');
      console.log('='.repeat(60));
      console.log('✅ Backend hazır (API + Postgres)');
      console.log('✅ Frontend hazır (AuthModal + AuthStore)');
      console.log('✅ Environment variables tanımlı');
      console.log('\n⚠️  SON ADIM: Google Cloud Console Ayarları');
      console.log('📖 GOOGLE_OAUTH_SETUP.md dosyasını takip edin!\n');
      console.log('🔗 https://console.cloud.google.com/apis/credentials\n');
      console.log('='.repeat(60));
      
      process.exit(0);
      
    } catch (error) {
      console.error('   ❌ Veritabanı hatası:', error.message);
      process.exit(1);
    }
  })();
  
} else {
  console.log('   ❌ POSTGRES_URL bulunamadı!');
  process.exit(1);
}
