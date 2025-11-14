require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function insertTestData() {
  try {
    console.log('📝 Inserting test analytics data...\n');

    // Business test data (ESP32'den gelecek gibi)
    console.log('1️⃣ Business Crowd Analytics...');
    await sql`
      INSERT INTO business_crowd_analytics (business_id, device_id, zone_name, current_people_count, max_capacity, entry_count, exit_count, queue_length, avg_wait_time, crowd_level, crowd_density)
      VALUES 
        (6, 'ESP32-001', 'Giriş', 45, 100, 67, 22, 8, 120, 'medium', 45.0),
        (6, 'ESP32-001', 'Kasa', 12, 30, 15, 3, 5, 90, 'medium', 40.0),
        (6, 'ESP32-001', 'Oturma Alanı', 28, 60, 32, 4, 0, 0, 'medium', 46.7)
    `;
    console.log('✅ Business crowd analytics inserted\n');

    // Seating Analytics
    console.log('2️⃣ Seating Analytics...');
    await sql`
      INSERT INTO seating_analytics (business_id, device_id, table_id, total_seats, occupied_seats, occupancy_rate)
      VALUES 
        (6, 'ESP32-001', 'T01', 4, 4, 100.0),
        (6, 'ESP32-001', 'T02', 4, 3, 75.0),
        (6, 'ESP32-001', 'T03', 6, 2, 33.3),
        (6, 'ESP32-001', 'T04', 4, 0, 0.0),
        (6, 'ESP32-001', 'T05', 4, 4, 100.0)
    `;
    console.log('✅ Seating analytics inserted\n');

    // Heatmap Data
    console.log('3️⃣ Heatmap Data...');
    await sql`
      INSERT INTO heatmap_data (business_id, device_id, heatmap_points, hottest_zone, coldest_zone, avg_intensity, start_time, end_time)
      VALUES (
        6, 
        'ESP32-001',
        '[{"x": 10, "y": 10, "intensity": 85}, {"x": 50, "y": 30, "intensity": 95}, {"x": 80, "y": 60, "intensity": 40}]'::jsonb,
        'Kasa Bölgesi',
        'Arka Kapı',
        65.5,
        NOW() - INTERVAL '1 hour',
        NOW()
      )
    `;
    console.log('✅ Heatmap data inserted\n');

    // AI Recognition Logs
    console.log('4️⃣ AI Recognition Logs...');
    await sql`
      INSERT INTO ai_recognition_logs (business_id, device_id, recognition_type, detected_object, confidence, bounding_box, zone_name)
      VALUES 
        (6, 'ESP32-001', 'person', 'person', 0.95, '{"x": 100, "y": 150, "width": 80, "height": 200}'::jsonb, 'Giriş'),
        (6, 'ESP32-001', 'person', 'person', 0.89, '{"x": 300, "y": 200, "width": 75, "height": 190}'::jsonb, 'Kasa'),
        (6, 'ESP32-001', 'object', 'chair', 0.92, '{"x": 500, "y": 400, "width": 60, "height": 80}'::jsonb, 'Oturma')
    `;
    console.log('✅ AI recognition logs inserted\n');

    // Transport Stop Crowd Analysis
    console.log('5️⃣ Stop Crowd Analysis...');
    const stops = await sql`SELECT id FROM transport_stops WHERE stop_code = 'STOP_KIZILAY'`;
    const stopId = stops.rows[0].id;

    await sql`
      INSERT INTO stop_crowd_analysis (stop_id, device_id, people_waiting, people_in_queue, crowd_level, crowd_density, avg_wait_time, max_wait_time)
      VALUES 
        (${stopId}, 'ESP32-CAM-01', 15, 8, 'medium', 60.0, 180, 360),
        (${stopId}, 'ESP32-CAM-01', 22, 12, 'high', 75.0, 240, 480)
    `;
    console.log('✅ Stop crowd analysis inserted\n');

    // Vehicle Locations
    console.log('6️⃣ Vehicle Locations...');
    const vehicles = await sql`SELECT id FROM transport_vehicles WHERE vehicle_code LIKE 'BUS-250-%'`;
    const routes = await sql`SELECT id FROM transport_routes WHERE route_code = '250'`;
    
    const vehicle1 = vehicles.rows[0].id;
    const vehicle2 = vehicles.rows[1].id;
    const routeId = routes.rows[0].id;

    await sql`
      INSERT INTO vehicle_locations (vehicle_id, route_id, latitude, longitude, speed, direction, current_stop_id, next_stop_id, distance_to_next_stop, eta_to_next_stop, current_passengers, crowd_level)
      VALUES 
        (${vehicle1}, ${routeId}, 39.925000, 32.854000, 40, 'north', null, ${stopId}, 850, 120, 65, 'medium'),
        (${vehicle2}, ${routeId}, 39.910000, 32.850000, 35, 'south', ${stopId}, null, 0, 0, 82, 'high')
    `;
    console.log('✅ Vehicle locations inserted\n');

    // Stop Arrivals
    console.log('7️⃣ Stop Arrivals...');
    await sql`
      INSERT INTO stop_arrivals (vehicle_id, route_id, stop_id, arrival_status, scheduled_time, actual_time, delay_minutes, passengers_boarding, passengers_alighting, passengers_waiting, stop_crowd_level)
      VALUES 
        (${vehicle1}, ${routeId}, ${stopId}, 'approaching', NOW() + INTERVAL '2 minutes', NOW() + INTERVAL '2 minutes', 0, 0, 0, 15, 'medium'),
        (${vehicle2}, ${routeId}, ${stopId}, 'arrived', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '3 minutes', -2, 12, 8, 18, 'medium')
    `;
    console.log('✅ Stop arrivals inserted\n');

    // Passenger Counts
    console.log('8️⃣ Passenger Counts...');
    await sql`
      INSERT INTO passenger_counts (vehicle_id, stop_id, boarding_count, alighting_count, current_load, occupancy_rate, comfort_level)
      VALUES 
        (${vehicle1}, ${stopId}, 12, 5, 65, 65.0, 'comfortable'),
        (${vehicle2}, ${stopId}, 15, 8, 82, 82.0, 'crowded')
    `;
    console.log('✅ Passenger counts inserted\n');

    console.log('🎉 All test data inserted successfully!');
    console.log('\n📊 Data Summary:');
    console.log('   ✅ Business crowd analytics: 3 entries');
    console.log('   ✅ Seating analytics: 5 tables');
    console.log('   ✅ Heatmap data: 1 session');
    console.log('   ✅ AI recognition logs: 3 detections');
    console.log('   ✅ Stop crowd analysis: 2 readings');
    console.log('   ✅ Vehicle locations: 2 buses');
    console.log('   ✅ Stop arrivals: 2 events');
    console.log('   ✅ Passenger counts: 2 records');
    console.log('\n✨ Ready for UI testing!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error inserting test data:');
    console.error(error);
    process.exit(1);
  }
}

insertTestData();
