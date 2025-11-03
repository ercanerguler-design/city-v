/**
 * Database Setup Script for Transport & AI Analytics System
 * Run: node database/setupTransportSystem.js
 */

require('dotenv').config({ path: '.env.local' });

const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'transport_ai_system.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Split by semicolon and filter empty statements
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        // Log first 50 chars of statement
        const preview = statement.substring(0, 50).replace(/\n/g, ' ');
        console.log(`   ${preview}...`);

        await sql.query(statement + ';');
        console.log(`✅ Success!\n`);
      } catch (error) {
        // Check if error is "table already exists"
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Table/constraint already exists, skipping...\n`);
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`);
          console.error(`   ${error.message}\n`);
          // Continue with other statements
        }
      }
    }

    console.log('✅ Database setup completed!\n');
    console.log('📊 Created tables:');
    console.log('   - business_crowd_analytics');
    console.log('   - seating_analytics');
    console.log('   - heatmap_data');
    console.log('   - ai_recognition_logs');
    console.log('   - transport_cities');
    console.log('   - transport_routes');
    console.log('   - transport_stops');
    console.log('   - route_stops');
    console.log('   - transport_vehicles');
    console.log('   - vehicle_locations');
    console.log('   - stop_arrivals');
    console.log('   - stop_crowd_analysis');
    console.log('   - passenger_counts\n');

    // Insert demo data
    console.log('📝 Inserting demo data...\n');
    await insertDemoData();

    console.log('🎉 Setup complete! Ready for testing.\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

async function insertDemoData() {
  try {
    // Check if Ankara city exists
    const cityCheck = await sql`SELECT id FROM transport_cities WHERE name = 'Ankara' LIMIT 1`;
    
    let cityId;
    if (cityCheck.rows.length === 0) {
      console.log('   Adding Ankara city...');
      const cityResult = await sql`
        INSERT INTO transport_cities (name, country, timezone)
        VALUES ('Ankara', 'Turkey', 'Europe/Istanbul')
        RETURNING id
      `;
      cityId = cityResult.rows[0].id;
      console.log('   ✅ City added\n');
    } else {
      cityId = cityCheck.rows[0].id;
      console.log('   ⚠️  City already exists\n');
    }

    // Check if route exists
    const routeCheck = await sql`SELECT id FROM transport_routes WHERE route_name = '250 - Kızılay - Eryaman' LIMIT 1`;
    
    let routeId;
    if (routeCheck.rows.length === 0) {
      console.log('   Adding 250 route...');
      const routeResult = await sql`
        INSERT INTO transport_routes (city_id, route_name, route_type, start_stop, end_stop)
        VALUES (${cityId}, '250 - Kızılay - Eryaman', 'bus', 'Kızılay', 'Eryaman')
        RETURNING id
      `;
      routeId = routeResult.rows[0].id;
      console.log('   ✅ Route added\n');
    } else {
      routeId = routeCheck.rows[0].id;
      console.log('   ⚠️  Route already exists\n');
    }

    // Check if stop exists
    const stopCheck = await sql`SELECT id FROM transport_stops WHERE stop_name = 'Kızılay Meydanı' LIMIT 1`;
    
    let stopId;
    if (stopCheck.rows.length === 0) {
      console.log('   Adding Kızılay stop...');
      const stopResult = await sql`
        INSERT INTO transport_stops (city_id, stop_name, latitude, longitude, max_capacity, has_esp32_camera)
        VALUES (${cityId}, 'Kızılay Meydanı', 39.9199, 32.8543, 150, true)
        RETURNING id
      `;
      stopId = stopResult.rows[0].id;
      console.log('   ✅ Stop added\n');
    } else {
      stopId = stopCheck.rows[0].id;
      console.log('   ⚠️  Stop already exists\n');
    }

    // Add route-stop relationship
    const routeStopCheck = await sql`
      SELECT id FROM route_stops 
      WHERE route_id = ${routeId} AND stop_id = ${stopId} 
      LIMIT 1
    `;

    if (routeStopCheck.rows.length === 0) {
      console.log('   Linking route to stop...');
      await sql`
        INSERT INTO route_stops (route_id, stop_id, stop_order, arrival_time_offset)
        VALUES (${routeId}, ${stopId}, 1, 0)
      `;
      console.log('   ✅ Route-stop linked\n');
    } else {
      console.log('   ⚠️  Route-stop already linked\n');
    }

    // Add demo vehicles
    const vehicleCheck = await sql`SELECT id FROM transport_vehicles WHERE vehicle_code = 'BUS-250-01' LIMIT 1`;
    
    if (vehicleCheck.rows.length === 0) {
      console.log('   Adding demo vehicles...');
      await sql`
        INSERT INTO transport_vehicles (city_id, route_id, vehicle_code, vehicle_type, total_capacity, status)
        VALUES 
          (${cityId}, ${routeId}, 'BUS-250-01', 'bus', 60, 'active'),
          (${cityId}, ${routeId}, 'BUS-250-02', 'bus', 60, 'active')
      `;
      console.log('   ✅ Vehicles added\n');
    } else {
      console.log('   ⚠️  Vehicles already exist\n');
    }

    console.log('✅ Demo data insertion complete!\n');

  } catch (error) {
    console.error('❌ Demo data insertion failed:', error.message);
  }
}

// Run setup
setupDatabase();
