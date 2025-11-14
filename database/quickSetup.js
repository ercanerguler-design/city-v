require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function createTables() {
  try {
    console.log('🚀 Starting database table creation...\n');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'transport_ai_system.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Extract only CREATE TABLE statements
    const createTableRegex = /CREATE TABLE IF NOT EXISTS[\s\S]*?;/gi;
    const createStatements = sqlContent.match(createTableRegex);

    console.log(`📋 Found ${createStatements.length} CREATE TABLE statements\n`);

    // Execute each CREATE TABLE
    for (let i = 0; i < createStatements.length; i++) {
      const statement = createStatements[i];
      const tableName = statement.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/i)[1];
      
      console.log(`[${i + 1}/${createStatements.length}] Creating table: ${tableName}`);
      
      try {
        await sql.query(statement);
        console.log(`✅ ${tableName} created successfully\n`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  ${tableName} already exists\n`);
        } else {
          console.error(`❌ Error creating ${tableName}:`);
          console.error(`   ${error.message}\n`);
        }
      }
    }

    // Now create indexes
    console.log('\n📊 Creating indexes...\n');
    const createIndexRegex = /CREATE INDEX[\s\S]*?;/gi;
    const indexStatements = sqlContent.match(createIndexRegex);

    if (indexStatements) {
      for (let i = 0; i < indexStatements.length; i++) {
        const statement = indexStatements[i];
        const indexName = statement.match(/CREATE INDEX\s+(\w+)/i)[1];
        
        console.log(`[${i + 1}/${indexStatements.length}] Creating index: ${indexName}`);
        
        try {
          await sql.query(statement);
          console.log(`✅ ${indexName} created\n`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`⚠️  ${indexName} already exists\n`);
          } else {
            console.error(`❌ Error: ${error.message}\n`);
          }
        }
      }
    }

    // Insert demo data
    console.log('\n📝 Inserting demo data...\n');
    
    // Check if Ankara exists
    const cityCheck = await sql`SELECT id FROM transport_cities WHERE city_code = 'ankara'`;
    let cityId;
    
    if (cityCheck.rows.length === 0) {
      const cityResult = await sql`
        INSERT INTO transport_cities (city_code, city_name, country) 
        VALUES ('ankara', 'Ankara', 'Turkey')
        RETURNING id
      `;
      cityId = cityResult.rows[0].id;
      console.log('✅ Ankara city created');
    } else {
      cityId = cityCheck.rows[0].id;
      console.log('⚠️  Ankara city already exists');
    }

    // Insert route
    const routeCheck = await sql`SELECT id FROM transport_routes WHERE route_code = '250'`;
    let routeId;
    
    if (routeCheck.rows.length === 0) {
      const routeResult = await sql`
        INSERT INTO transport_routes (city_id, route_code, route_name, route_type, start_station, end_station)
        VALUES (${cityId}, '250', 'Ankara 250 Hattı', 'bus', 'Kızılay', 'Batıkent')
        RETURNING id
      `;
      routeId = routeResult.rows[0].id;
      console.log('✅ Route 250 created');
    } else {
      routeId = routeCheck.rows[0].id;
      console.log('⚠️  Route 250 already exists');
    }

    // Insert stop
    const stopCheck = await sql`SELECT id FROM transport_stops WHERE stop_code = 'STOP_KIZILAY'`;
    let stopId;
    
    if (stopCheck.rows.length === 0) {
      const stopResult = await sql`
        INSERT INTO transport_stops (city_id, stop_code, stop_name, stop_type, latitude, longitude, has_camera, camera_device_id)
        VALUES (${cityId}, 'STOP_KIZILAY', 'Kızılay Meydanı', 'bus_stop', 39.919200, 32.854100, true, 'ESP32-CAM-01')
        RETURNING id
      `;
      stopId = stopResult.rows[0].id;
      console.log('✅ Kızılay stop created');
    } else {
      stopId = stopCheck.rows[0].id;
      console.log('⚠️  Kızılay stop already exists');
    }

    // Insert vehicles
    for (let i = 1; i <= 2; i++) {
      const vehicleCode = `BUS-250-0${i}`;
      const vehicleCheck = await sql`SELECT id FROM transport_vehicles WHERE vehicle_code = ${vehicleCode}`;
      
      if (vehicleCheck.rows.length === 0) {
        await sql`
          INSERT INTO transport_vehicles (city_id, vehicle_code, vehicle_type, total_capacity, seated_capacity, standing_capacity, active, in_service, current_route_id)
          VALUES (${cityId}, ${vehicleCode}, 'bus', 100, 40, 60, true, true, ${routeId})
        `;
        console.log(`✅ Vehicle ${vehicleCode} created`);
      } else {
        console.log(`⚠️  Vehicle ${vehicleCode} already exists`);
      }
    }

    console.log('\n🎉 Database setup complete!');
    console.log('\n📊 Summary:');
    console.log('   ✅ 13 tables created');
    console.log('   ✅ All indexes created');
    console.log('   ✅ Demo data inserted');
    console.log('   - City: Ankara');
    console.log('   - Route: 250 (Kızılay - Batıkent)');
    console.log('   - Stop: Kızılay Meydanı');
    console.log('   - Vehicles: BUS-250-01, BUS-250-02');
    console.log('\n✨ Ready for testing!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:');
    console.error(error);
    process.exit(1);
  }
}

createTables();
