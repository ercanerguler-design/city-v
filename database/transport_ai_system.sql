-- ============================================
-- CITYV AI TRANSPORT & ANALYTICS SYSTEM
-- Complete Database Schema
-- ============================================

-- ============================================
-- BUSINESS ANALYTICS TABLES
-- ============================================

-- Gerçek zamanlı insan sayımı ve yoğunluk (ESP32'den geliyor)
CREATE TABLE IF NOT EXISTS business_crowd_analytics (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  zone_name VARCHAR(100), -- Hangi bölge (kasa, oturma, giriş vs)
  
  -- İnsan sayımı
  current_people_count INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 100,
  
  -- Giriş-Çıkış sayımı
  entry_count INTEGER DEFAULT 0,
  exit_count INTEGER DEFAULT 0,
  
  -- Sıra ve bekleme
  queue_length INTEGER DEFAULT 0, -- Sırada kaç kişi
  avg_wait_time INTEGER DEFAULT 0, -- Ortalama bekleme süresi (saniye)
  
  -- Yoğunluk analizi
  crowd_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, very_high
  crowd_density FLOAT DEFAULT 0, -- 0-100 arası yüzde
  
  -- Timestamp
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (business_id) REFERENCES business_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_business_crowd_timestamp ON business_crowd_analytics(business_id, timestamp DESC);
CREATE INDEX idx_business_crowd_device ON business_crowd_analytics(device_id, timestamp DESC);

-- Masa ve sandalye yoğunluk analizi
CREATE TABLE IF NOT EXISTS seating_analytics (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  
  -- Masa bilgileri
  table_id VARCHAR(50), -- Masa numarası
  total_seats INTEGER DEFAULT 4,
  occupied_seats INTEGER DEFAULT 0,
  
  -- Yoğunluk
  occupancy_rate FLOAT DEFAULT 0, -- 0-100 yüzde
  
  -- Timestamp
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (business_id) REFERENCES business_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_seating_analytics ON seating_analytics(business_id, timestamp DESC);

-- Heatmap (Isı haritası) verisi
CREATE TABLE IF NOT EXISTS heatmap_data (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  
  -- Heatmap koordinatları (JSON array)
  heatmap_points JSONB, -- [{x, y, intensity}, ...]
  
  -- İstatistikler
  hottest_zone VARCHAR(100), -- En yoğun bölge
  coldest_zone VARCHAR(100), -- En az yoğun bölge
  avg_intensity FLOAT DEFAULT 0,
  
  -- Zaman aralığı
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (business_id) REFERENCES business_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_heatmap ON heatmap_data(business_id, start_time DESC);

-- AI Tanıma Logları (İnsan ve Nesne tanıma)
CREATE TABLE IF NOT EXISTS ai_recognition_logs (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  
  -- Tanıma türü
  recognition_type VARCHAR(50) NOT NULL, -- 'person', 'object', 'face'
  
  -- Tanımlanan nesne/kişi
  detected_object VARCHAR(100), -- 'person', 'chair', 'table', 'vehicle', etc.
  confidence FLOAT DEFAULT 0, -- 0-1 arası güven skoru
  
  -- Konum bilgisi
  bounding_box JSONB, -- {x, y, width, height}
  zone_name VARCHAR(100),
  
  -- Kişi tanıma (opsiyonel)
  person_id VARCHAR(100), -- Unique person identifier
  person_features JSONB, -- Facial features, clothing, etc.
  
  -- Timestamp
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (business_id) REFERENCES business_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_recognition_logs ON ai_recognition_logs(business_id, recognition_type, timestamp DESC);

-- ============================================
-- TRANSPORT SYSTEM TABLES
-- ============================================

-- Şehirler
CREATE TABLE IF NOT EXISTS transport_cities (
  id SERIAL PRIMARY KEY,
  city_code VARCHAR(10) UNIQUE NOT NULL, -- 'ankara', 'istanbul', etc.
  city_name VARCHAR(100) NOT NULL,
  country VARCHAR(50) DEFAULT 'Turkey',
  timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ulaşım hatları (Bus, Metro, Tram, etc.)
CREATE TABLE IF NOT EXISTS transport_routes (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL,
  route_code VARCHAR(50) NOT NULL, -- '348', 'M1', 'T1', etc.
  route_name VARCHAR(200) NOT NULL,
  route_type VARCHAR(50) NOT NULL, -- 'bus', 'metro', 'tram', 'train'
  
  -- Hat bilgileri
  start_station VARCHAR(200),
  end_station VARCHAR(200),
  total_stops INTEGER DEFAULT 0,
  
  -- Çalışma saatleri
  first_departure TIME,
  last_departure TIME,
  
  -- Durum
  active BOOLEAN DEFAULT true,
  color VARCHAR(20), -- Hat rengi (UI için)
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (city_id) REFERENCES transport_cities(id) ON DELETE CASCADE
);

CREATE INDEX idx_routes ON transport_routes(city_id, route_code);

-- Duraklar ve İstasyonlar
CREATE TABLE IF NOT EXISTS transport_stops (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL,
  stop_code VARCHAR(50) UNIQUE NOT NULL,
  stop_name VARCHAR(200) NOT NULL,
  stop_type VARCHAR(50) NOT NULL, -- 'bus_stop', 'metro_station', 'tram_stop', 'train_station'
  
  -- Konum
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  
  -- Kapasite
  max_capacity INTEGER DEFAULT 50, -- Maksimum kaç kişi bekleyebilir
  
  -- ESP32 kamera entegrasyonu
  has_camera BOOLEAN DEFAULT false,
  camera_device_id VARCHAR(100),
  
  -- Durum
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (city_id) REFERENCES transport_cities(id) ON DELETE CASCADE
);

CREATE INDEX idx_stops_location ON transport_stops(latitude, longitude);
CREATE INDEX idx_stops_city ON transport_stops(city_id, stop_type);

-- Hat-Durak ilişkisi (Hangi hat hangi duraklardan geçiyor)
CREATE TABLE IF NOT EXISTS route_stops (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL,
  stop_id INTEGER NOT NULL,
  stop_order INTEGER NOT NULL, -- Sıra numarası (1, 2, 3...)
  
  -- Mesafe ve süre
  distance_from_start INTEGER DEFAULT 0, -- Başlangıçtan km cinsinden
  estimated_time_from_start INTEGER DEFAULT 0, -- Dakika cinsinden
  
  FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES transport_stops(id) ON DELETE CASCADE,
  UNIQUE(route_id, stop_order)
);

CREATE INDEX idx_route_stops ON route_stops(route_id, stop_order);

-- Araçlar (Otobüs, Metro, Tramvay)
CREATE TABLE IF NOT EXISTS transport_vehicles (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL,
  vehicle_code VARCHAR(50) UNIQUE NOT NULL, -- Araç plakası veya kodu
  vehicle_type VARCHAR(50) NOT NULL, -- 'bus', 'metro', 'tram', 'train'
  
  -- Kapasite
  total_capacity INTEGER DEFAULT 100,
  seated_capacity INTEGER DEFAULT 40,
  standing_capacity INTEGER DEFAULT 60,
  
  -- Durum
  active BOOLEAN DEFAULT true,
  in_service BOOLEAN DEFAULT false,
  
  -- Şu anki atama
  current_route_id INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (city_id) REFERENCES transport_cities(id) ON DELETE CASCADE,
  FOREIGN KEY (current_route_id) REFERENCES transport_routes(id) ON DELETE SET NULL
);

CREATE INDEX idx_vehicles ON transport_vehicles(city_id, vehicle_type, active);

-- Araç konumu ve durumu (Gerçek zamanlı)
CREATE TABLE IF NOT EXISTS vehicle_locations (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL,
  route_id INTEGER NOT NULL,
  
  -- Konum
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed INTEGER DEFAULT 0, -- km/h
  direction VARCHAR(50), -- 'north', 'south', 'east', 'west'
  
  -- Durak bilgisi
  current_stop_id INTEGER,
  next_stop_id INTEGER,
  distance_to_next_stop INTEGER DEFAULT 0, -- Metre cinsinden
  eta_to_next_stop INTEGER DEFAULT 0, -- Saniye cinsinden
  
  -- Araç içi yoğunluk (ESP32'den gelecek)
  current_passengers INTEGER DEFAULT 0,
  crowd_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, full
  
  -- Timestamp
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (vehicle_id) REFERENCES transport_vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (current_stop_id) REFERENCES transport_stops(id) ON DELETE SET NULL,
  FOREIGN KEY (next_stop_id) REFERENCES transport_stops(id) ON DELETE SET NULL
);

CREATE INDEX idx_vehicle_locations ON vehicle_locations(vehicle_id, timestamp DESC);
CREATE INDEX idx_vehicle_route ON vehicle_locations(route_id, timestamp DESC);

-- Durak varış kayıtları (Araç durağa yaklaştı mı, geldi mi)
CREATE TABLE IF NOT EXISTS stop_arrivals (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL,
  route_id INTEGER NOT NULL,
  stop_id INTEGER NOT NULL,
  
  -- Varış durumu
  arrival_status VARCHAR(50) NOT NULL, -- 'approaching', 'arrived', 'departed'
  
  -- Zaman bilgileri
  scheduled_time TIMESTAMP, -- Planlanan varış
  actual_time TIMESTAMP DEFAULT NOW(), -- Gerçek varış
  delay_minutes INTEGER DEFAULT 0, -- Gecikme (dakika)
  
  -- Yolcu hareketleri (ESP32'den)
  passengers_boarding INTEGER DEFAULT 0, -- Binen
  passengers_alighting INTEGER DEFAULT 0, -- İnen
  passengers_waiting INTEGER DEFAULT 0, -- Bekleyen
  
  -- Durak yoğunluğu
  stop_crowd_level VARCHAR(20) DEFAULT 'low',
  
  FOREIGN KEY (vehicle_id) REFERENCES transport_vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES transport_stops(id) ON DELETE CASCADE
);

CREATE INDEX idx_stop_arrivals ON stop_arrivals(stop_id, actual_time DESC);
CREATE INDEX idx_stop_arrivals_vehicle ON stop_arrivals(vehicle_id, actual_time DESC);

-- Durak yoğunluk analizi (ESP32 kamera ile)
CREATE TABLE IF NOT EXISTS stop_crowd_analysis (
  id SERIAL PRIMARY KEY,
  stop_id INTEGER NOT NULL,
  device_id VARCHAR(100) NOT NULL, -- ESP32 kamera ID
  
  -- İnsan sayımı
  people_waiting INTEGER DEFAULT 0, -- Bekleyen kişi sayısı
  people_in_queue INTEGER DEFAULT 0, -- Sırada bekleyen
  
  -- Yoğunluk
  crowd_level VARCHAR(20) DEFAULT 'low',
  crowd_density FLOAT DEFAULT 0, -- 0-100 yüzde
  
  -- Bekleme analizi
  avg_wait_time INTEGER DEFAULT 0, -- Ortalama bekleme süresi (saniye)
  max_wait_time INTEGER DEFAULT 0,
  
  -- Heatmap verisi (opsiyonel)
  heatmap_data JSONB,
  
  -- Timestamp
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (stop_id) REFERENCES transport_stops(id) ON DELETE CASCADE
);

CREATE INDEX idx_stop_crowd ON stop_crowd_analysis(stop_id, timestamp DESC);

-- Yolcu sayım logları
CREATE TABLE IF NOT EXISTS passenger_counts (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL,
  stop_id INTEGER NOT NULL,
  
  -- Sayımlar
  boarding_count INTEGER DEFAULT 0, -- Binen
  alighting_count INTEGER DEFAULT 0, -- İnen
  current_load INTEGER DEFAULT 0, -- Araçtaki toplam
  
  -- Yoğunluk
  occupancy_rate FLOAT DEFAULT 0, -- 0-100 yüzde doluluk
  comfort_level VARCHAR(20) DEFAULT 'comfortable', -- comfortable, crowded, full
  
  -- Timestamp
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (vehicle_id) REFERENCES transport_vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES transport_stops(id) ON DELETE CASCADE
);

CREATE INDEX idx_passenger_counts ON passenger_counts(vehicle_id, timestamp DESC);

-- ============================================
-- DEMO DATA INSERT
-- ============================================

-- Şehir ekle
INSERT INTO transport_cities (city_code, city_name, country) 
VALUES ('ankara', 'Ankara', 'Turkey')
ON CONFLICT (city_code) DO NOTHING;

-- Durak ekle
INSERT INTO transport_stops (city_id, stop_code, stop_name, stop_type, latitude, longitude, has_camera)
VALUES (
  (SELECT id FROM transport_cities WHERE city_code = 'ankara'),
  'STOP_KIZILAY', 
  'Kızılay Meydanı', 
  'bus_stop',
  39.919200,
  32.854100,
  true
)
ON CONFLICT (stop_code) DO NOTHING;

COMMENT ON TABLE business_crowd_analytics IS 'Gerçek zamanlı insan sayımı ve yoğunluk analizi';
COMMENT ON TABLE seating_analytics IS 'Masa ve sandalye yoğunluk analizi';
COMMENT ON TABLE heatmap_data IS 'Isı haritası (heatmap) verisi';
COMMENT ON TABLE ai_recognition_logs IS 'AI insan ve nesne tanıma logları';
COMMENT ON TABLE transport_routes IS 'Ulaşım hatları (otobüs, metro, tramvay)';
COMMENT ON TABLE transport_stops IS 'Duraklar ve istasyonlar';
COMMENT ON TABLE stop_arrivals IS 'Araç varış kayıtları';
COMMENT ON TABLE stop_crowd_analysis IS 'Durak yoğunluk analizi (ESP32 kamera)';
COMMENT ON TABLE passenger_counts IS 'Yolcu biniş-iniş sayımları';
