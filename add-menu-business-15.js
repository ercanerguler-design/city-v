const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addMenuForBusiness15() {
  try {
    console.log('🍽️ Adding menu for business_id=15 (SCE INNOVATION)...');
    
    // Check if business_id=15 exists
    const business = await sql`
      SELECT id, business_name FROM business_profiles WHERE id = 15
    `;
    
    if (business.length === 0) {
      console.log('❌ Business 15 not found');
      return;
    }
    
    console.log('✅ Found business:', business[0].business_name);
    
    // Add categories
    console.log('\n📂 Adding menu categories...');
    const categories = [
      { name: 'Sıcak İçecekler', icon: '☕', order: 1 },
      { name: 'Soğuk İçecekler', icon: '🥤', order: 2 },
      { name: 'Atıştırmalıklar', icon: '🍿', order: 3 },
      { name: 'Tatlılar', icon: '🍰', order: 4 }
    ];
    
    const categoryIds = [];
    for (const cat of categories) {
      const result = await sql`
        INSERT INTO business_menu_categories (business_id, name, icon, display_order, is_active)
        VALUES (15, ${cat.name}, ${cat.icon}, ${cat.order}, true)
        RETURNING id
      `;
      categoryIds.push(result[0].id);
      console.log(`  ✅ ${cat.name} (ID: ${result[0].id})`);
    }
    
    // Add menu items
    console.log('\n🍔 Adding menu items...');
    const menuItems = [
      // Sıcak İçecekler
      { categoryIdx: 0, name: 'Espresso', description: 'Tek shot espresso', price: '35.00', order: 1 },
      { categoryIdx: 0, name: 'Cappuccino', description: 'Espresso + süt köpüğü', price: '45.00', order: 2 },
      { categoryIdx: 0, name: 'Latte', description: 'Espresso + süt', price: '45.00', order: 3 },
      { categoryIdx: 0, name: 'Türk Kahvesi', description: 'Geleneksel Türk kahvesi', price: '40.00', order: 4 },
      { categoryIdx: 0, name: 'Çay', description: 'Demleme çay', price: '15.00', order: 5 },
      
      // Soğuk İçecekler
      { categoryIdx: 1, name: 'Ice Latte', description: 'Buzlu latte', price: '50.00', order: 1 },
      { categoryIdx: 1, name: 'Limonata', description: 'Ev yapımı limonata', price: '40.00', order: 2 },
      { categoryIdx: 1, name: 'Smoothie', description: 'Mevsim meyveli', price: '55.00', order: 3 },
      { categoryIdx: 1, name: 'Ayran', description: 'Yoğurt içeceği', price: '25.00', order: 4 },
      
      // Atıştırmalıklar
      { categoryIdx: 2, name: 'Tost', description: 'Kaşarlı tost', price: '60.00', order: 1 },
      { categoryIdx: 2, name: 'Sandviç', description: 'Özel sandviç', price: '75.00', order: 2 },
      { categoryIdx: 2, name: 'Patates Kızartması', description: 'Çıtır patates', price: '45.00', order: 3 },
      { categoryIdx: 2, name: 'Nachos', description: 'Soslu nachos', price: '50.00', order: 4 },
      
      // Tatlılar
      { categoryIdx: 3, name: 'Cheesecake', description: 'Frambuazlı cheesecake', price: '65.00', order: 1 },
      { categoryIdx: 3, name: 'Tiramisu', description: 'İtalyan tatlısı', price: '70.00', order: 2 },
      { categoryIdx: 3, name: 'Brownie', description: 'Çikolatalı brownie', price: '55.00', order: 3 },
      { categoryIdx: 3, name: 'Kurabiye', description: 'Çeşitli kurabiyeler', price: '35.00', order: 4 }
    ];
    
    for (const item of menuItems) {
      await sql`
        INSERT INTO business_menu_items 
        (business_id, category_id, name, description, price, currency, display_order, is_available, is_featured)
        VALUES 
        (15, ${categoryIds[item.categoryIdx]}, ${item.name}, ${item.description}, ${item.price}, 'TRY', ${item.order}, true, false)
      `;
      console.log(`  ✅ ${item.name} - ${item.price} TRY`);
    }
    
    console.log('\n🎉 Menu successfully added to business 15!');
    console.log(`📊 Total: ${categories.length} categories, ${menuItems.length} items`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addMenuForBusiness15();
