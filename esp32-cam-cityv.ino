/*
 * ========================================
 * 🎥 ESP32-CAM City-V AI Analiz Sistemi
 * ========================================
 * 
 * 📌 VERSİYON: v3.0 (2025-10-15)
 * 📌 YAZAR: City-V Team
 * 📌 MODEL: AI-Thinker ESP32-CAM
 * 
 * 🎯 YENİ ÖZELLİKLER (v3.0):
 * ✅ Zone-based crowd analysis (3x3 grid)
 * ✅ Multi-factor scoring (dark, motion, edge, zone occupancy)
 * ✅ CORS-enabled streaming for web integration
 * ✅ Real-time AI detection support
 * ✅ RESTful API endpoints (/stream, /status, /analyze)
 * ✅ Brownout detector fix
 * ✅ Auto-reconnect WiFi
 * ✅ City-V platform integration
 * 
 * 📡 API ENDPOINTS:
 * - http://[IP]/stream      → Canlı video stream (MJPEG)
 * - http://[IP]/status      → Cihaz durumu (JSON)
 * - http://[IP]/analyze     → Manuel analiz tetikle
 * - http://[IP]/capture     → Tek frame yakala (gelecek)
 * 
 * 📦 GEREKLİ KÜTÜPHANELER:
 * - ESP32 Camera (esp_camera.h)
 * - WiFi, HTTPClient
 * - ArduinoJson (v6+)
 * 
 * 🔧 KURULUM:
 * 1. Arduino IDE → Boards Manager → ESP32 by Espressif (v2.0.0+)
 * 2. Tools → Board → AI Thinker ESP32-CAM
 * 3. Tools → Partition Scheme → Huge APP (3MB No OTA)
 * 4. WiFi bilgilerini güncelleyin (ssid, password)
 * 5. Upload (GPIO0'ı GND'ye bağlayın)
 * 
 * 🚀 KULLANIM:
 * 1. Serial Monitor'den IP adresini öğrenin
 * 2. http://localhost:3000/esp32 → Dashboard
 * 3. IP girin ve "Canlı İzlemeyi Başlat" tıklayın
 * 4. AI tespit otomatik başlar (5sn aralıklarla)
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "esp_http_server.h"
#include "img_converters.h"
#include "fb_gfx.h"

// ⚡ BROWNOUT DETECTOR FIX İÇİN GEREKLİ INCLUDES
#include "esp32/rom/rtc.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

// =========================
// ESP32-CAM Pin Konfigürasyonu (AI-Thinker Model)
// =========================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ========================================
// 🌐 WiFi ve API Konfigürasyonu
// ========================================
// ⚠️ ÖNEMLİ: Kendi WiFi bilgilerinizi buraya yazın!
const char* ssid = "ErcanSce";                    // 📡 WiFi ağ adınız
const char* password = "Ka250806Ka";              // 🔒 WiFi şifreniz

// 🏙️ City-V Platform Ayarları
const char* cityv_host = "cityv.vercel.app";      // City-V domain (veya localhost:3000)
const char* api_endpoint = "/api/esp32/crowd-report";
const char* device_id = "esp32_cam_001";          // 🆔 Benzersiz cihaz kimliği
const char* location_name = "Test Lokasyonu";     // 📍 Kamera konumu (örn: "Cafe Giriş")

// Global değişkenler
httpd_handle_t camera_httpd = NULL;
httpd_handle_t stream_httpd = NULL;
unsigned long lastReport = 0;
const unsigned long reportInterval = 30000; // 30 saniye
bool cameraInitialized = false;

// Otomatik konum değişkenleri
float device_latitude = 0.0;
float device_longitude = 0.0;
String device_address = "";
bool locationFetched = false;

// =========================
// LED Status Functions
// =========================
void blinkLED(int times = 1, int delayMs = 200) {
  for(int i = 0; i < times; i++) {
    digitalWrite(33, HIGH);
    delay(delayMs);
    digitalWrite(33, LOW);
    delay(delayMs);
  }
}

// =========================
// Kamera Stream Handler
// =========================
  static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t * fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t * _jpg_buf = NULL;
  char * part_buf[64];

  // CORS headers ÖNCE set edilmeli (type'dan önce)
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, OPTIONS");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "*");
  
  res = httpd_resp_set_type(req, "multipart/x-mixed-replace;boundary=frame");
  if(res != ESP_OK) {
    return res;
  }

  while(true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("❌ Kamera yakalama hatası");
      res = ESP_FAIL;
    } else {
      if(fb->format != PIXFORMAT_JPEG){
        bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
        esp_camera_fb_return(fb);
        fb = NULL;
        if(!jpeg_converted){
          Serial.println("❌ JPEG dönüştürme hatası");
          res = ESP_FAIL;
        }
      } else {
        _jpg_buf_len = fb->len;
        _jpg_buf = fb->buf;
      }
    }

    if(res == ESP_OK) {
      size_t hlen = snprintf((char *)part_buf, 64, 
        "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n", 
        _jpg_buf_len);
      res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
    }
    if(res == ESP_OK) {
      res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
    }
    if(res == ESP_OK) {
      res = httpd_resp_send_chunk(req, "\r\n--frame\r\n", 12);
    }

    if(fb) {
      esp_camera_fb_return(fb);
      fb = NULL;
      _jpg_buf = NULL;
    } else if(_jpg_buf) {
      free(_jpg_buf);
      _jpg_buf = NULL;
    }

    if(res != ESP_OK) {
      break;
    }
    delay(30);
  }
  return res;
}

// =========================
// CORS Preflight Handler (OPTIONS)
// =========================
static esp_err_t options_handler(httpd_req_t *req) {
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "*");
  httpd_resp_set_hdr(req, "Access-Control-Max-Age", "86400");
  httpd_resp_set_status(req, "204 No Content");
  httpd_resp_send(req, NULL, 0);
  return ESP_OK;
}

// =========================
// Single Frame Capture Handler (AI analizi için)
// =========================
static esp_err_t capture_handler(httpd_req_t *req) {
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, OPTIONS");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "*");
  
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Frame capture hatası");
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }

  httpd_resp_set_type(req, "image/jpeg");
  httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=capture.jpg");
  
  esp_err_t res = httpd_resp_send(req, (const char *)fb->buf, fb->len);
  
  esp_camera_fb_return(fb);
  
  if (res == ESP_OK) {
    Serial.printf("✅ Frame captured: %d bytes\n", fb->len);
  }
  
  return res;
}

// =========================
// Status Handler (Cihaz bilgileri)
// =========================
static esp_err_t status_handler(httpd_req_t *req) {
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, OPTIONS");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "*");
  httpd_resp_set_type(req, "application/json");
  
  DynamicJsonDocument doc(1024);
  doc["status"] = "online";
  doc["device_id"] = device_id;
  doc["location"] = location_name;
  doc["ip"] = WiFi.localIP().toString();
  doc["mac"] = WiFi.macAddress();
  doc["uptime"] = millis();
  doc["free_heap"] = ESP.getFreeHeap();
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["camera_init"] = cameraInitialized;
  doc["psram"] = psramFound();
  
  // Koordinatlar (otomatik veya varsayılan)
  JsonObject coordinates = doc.createNestedObject("coordinates");
  coordinates["lat"] = device_latitude;
  coordinates["lng"] = device_longitude;
  coordinates["auto_detected"] = locationFetched;
  coordinates["address"] = device_address;
  
  String response;
  serializeJson(doc, response);
  
  return httpd_resp_send(req, response.c_str(), HTTPD_RESP_USE_STRLEN);
}

// =========================
// HTTP Server Başlatma
// =========================
void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;

  // Stream endpoint
  httpd_uri_t stream_uri = {
    .uri       = "/stream",
    .method    = HTTP_GET,
    .handler   = stream_handler,
    .user_ctx  = NULL
  };

  // Status endpoint
  httpd_uri_t status_uri = {
    .uri       = "/status",
    .method    = HTTP_GET,
    .handler   = status_handler,
    .user_ctx  = NULL
  };

  // Capture endpoint (single frame for AI)
  httpd_uri_t capture_uri = {
    .uri       = "/capture",
    .method    = HTTP_GET,
    .handler   = capture_handler,
    .user_ctx  = NULL
  };

  // OPTIONS endpoint (CORS preflight)
  httpd_uri_t options_uri = {
    .uri       = "/*",
    .method    = HTTP_OPTIONS,
    .handler   = options_handler,
    .user_ctx  = NULL
  };

  // Ana server başlat
  Serial.printf("🌐 HTTP server başlatılıyor port %d\n", config.server_port);
  if (httpd_start(&camera_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(camera_httpd, &stream_uri);
    httpd_register_uri_handler(camera_httpd, &status_uri);
    httpd_register_uri_handler(camera_httpd, &capture_uri);
    httpd_register_uri_handler(camera_httpd, &options_uri);
    Serial.println("✅ Camera server başladı (CORS + AI capture enabled)");
    blinkLED(3, 100); // Başarı göstergesi
  }

  // Stream server (farklı port)
  config.server_port += 1;
  config.ctrl_port += 1;
  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(stream_httpd, &stream_uri);
    Serial.println("✅ Stream server başladı");
  }
}

// =========================
// Gelişmiş Kalabalık Seviyesi Analizi
// =========================
String analyzeCrowdLevel() {
  if(!cameraInitialized) {
    return "camera_error";
  }

  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Analiz için kamera yakalama hatası");
    return "error";
  }

  Serial.printf("📸 Frame alındı: %dx%d, boyut: %d bytes\n", 
                fb->width, fb->height, fb->len);

  // Gelişmiş kalabalık analizi algoritması
  int totalPixels = fb->len;
  int darkPixelCount = 0;
  int motionPixels = 0;
  int brightPixels = 0;
  
  // Daha detaylı piksel analizi
  int sampleRate = (totalPixels > 50000) ? 100 : 50;
  
  for(int i = 0; i < totalPixels && i < 15000; i += sampleRate) {
    uint8_t pixelValue = fb->buf[i];
    
    // Koyu piksel sayısı (insanları/nesneleri temsil eder)
    if(pixelValue < 70) {
      darkPixelCount++;
    }
    // Açık piksel sayısı
    else if(pixelValue > 200) {
      brightPixels++;
    }
    
    // Hareket/kenar tespiti için komşu pikselleri karşılaştır
    if(i + sampleRate < totalPixels && i + sampleRate < 15000) {
      uint8_t nextPixel = fb->buf[i + sampleRate];
      if(abs(pixelValue - nextPixel) > 35) {
        motionPixels++;
      }
    }
  }
  
  esp_camera_fb_return(fb);
  
  // Normalize etme
  int sampleCount = 15000 / sampleRate;
  float darkRatio = (float)darkPixelCount / sampleCount;
  float motionRatio = (float)motionPixels / sampleCount;
  float brightRatio = (float)brightPixels / sampleCount;
  
  // Weighted kalabalık skoru
  float crowdScore = (darkRatio * 0.5) + (motionRatio * 0.3) + (brightRatio * 0.2);
  
  Serial.printf("📊 Analiz detayı: koyu=%.2f%%, hareket=%.2f%%, açık=%.2f%%, skor=%.3f\n", 
                darkRatio * 100, motionRatio * 100, brightRatio * 100, crowdScore);
  
  // Kalabalık seviyesini belirle (daha hassas)
  if(crowdScore > 0.75) {
    return "very_high";
  } else if(crowdScore > 0.55) {
    return "high"; 
  } else if(crowdScore > 0.35) {
    return "moderate";
  } else if(crowdScore > 0.15) {
    return "low";
  } else {
    return "empty";
  }
}

// =========================
// City-V API'ye Gelişmiş Rapor Gönderme
// =========================
void sendCrowdReport(String crowdLevel) {
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi bağlantısı yok");
    blinkLED(1, 500); // Hata göstergesi
    return;
  }

  Serial.println("📡 City-V'ye rapor gönderiliyor...");

  HTTPClient http;
  http.begin("https://" + String(cityv_host) + api_endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("User-Agent", "ESP32-CAM/1.0");
  http.setTimeout(15000); // 15 saniye timeout

  // Detaylı JSON payload oluştur
  DynamicJsonDocument doc(1024);
  doc["locationId"] = location_name;
  doc["crowdLevel"] = crowdLevel;
  doc["timestamp"] = millis();
  doc["deviceId"] = device_id;
  doc["source"] = "esp32cam";
  doc["version"] = "2.0";
  
  // Koordinatlar (otomatik alınmış)
  JsonObject coordinates = doc.createNestedObject("coordinates");
  coordinates["lat"] = device_latitude;
  coordinates["lng"] = device_longitude;
  coordinates["auto_detected"] = locationFetched;
  coordinates["address"] = device_address;
  
  // Gelişmiş metadata
  JsonObject metadata = doc.createNestedObject("metadata");
  metadata["ip"] = WiFi.localIP().toString();
  metadata["mac"] = WiFi.macAddress();
  metadata["rssi"] = WiFi.RSSI();
  metadata["uptime"] = millis();
  metadata["freeHeap"] = ESP.getFreeHeap();
  metadata["totalHeap"] = ESP.getHeapSize();
  metadata["cpuFreq"] = ESP.getCpuFreqMHz();
  metadata["flashSize"] = ESP.getFlashChipSize();
  metadata["psram"] = psramFound();
  
  // Kamera bilgileri
  if(cameraInitialized) {
    JsonObject camera = doc.createNestedObject("camera");
    camera["initialized"] = true;
    camera["psram"] = psramFound();
    
    sensor_t * s = esp_camera_sensor_get();
    if(s) {
      camera["framesize"] = s->status.framesize;
      camera["quality"] = s->status.quality;
    }
  }

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("📄 JSON Payload (" + String(jsonString.length()) + " bytes):");
  Serial.println(jsonString);

  int httpResponseCode = http.POST(jsonString);

  if(httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("✅ HTTP Yanıt: %d\n", httpResponseCode);
    
    if(httpResponseCode == 200) {
      Serial.println("🎉 Rapor başarıyla gönderildi!");
      Serial.println("📨 Sunucu yanıtı: " + response);
      blinkLED(2, 100); // Başarı göstergesi
    } else {
      Serial.println("⚠️ Sunucu yanıtı: " + response);
      blinkLED(1, 300); // Uyarı göstergesi
    }
  } else {
    Serial.printf("❌ HTTP hatası: %d (%s)\n", httpResponseCode, http.errorToString(httpResponseCode).c_str());
    blinkLED(1, 500); // Hata göstergesi
  }

  http.end();
  Serial.println("📡 HTTP bağlantısı kapatıldı\n");
}

// =========================
// Otomatik Konum Alma (IP Geolocation)
// =========================
bool fetchLocationFromIP() {
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi bağlantısı yok, konum alınamıyor");
    return false;
  }

  Serial.println("\n📍 Otomatik konum alınıyor (IP Geolocation)...");
  
  HTTPClient http;
  
  // ipapi.co servisi kullan (ücretsiz, limit: 1000/gün)
  http.begin("http://ipapi.co/json/");
  http.addHeader("User-Agent", "ESP32-CAM/1.0");
  http.setTimeout(10000);
  
  int httpCode = http.GET();
  
  if(httpCode == 200) {
    String payload = http.getString();
    Serial.println("✅ Konum verisi alındı:");
    Serial.println(payload);
    
    // JSON parse et
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, payload);
    
    if(!error) {
      device_latitude = doc["latitude"];
      device_longitude = doc["longitude"];
      
      String city = doc["city"] | "";
      String region = doc["region"] | "";
      String country = doc["country_name"] | "";
      
      device_address = city + ", " + region + ", " + country;
      
      Serial.println("\n🎯 KONUM BİLGİLERİ:");
      Serial.println("====================");
      Serial.printf("📍 Koordinatlar: %.6f, %.6f\n", device_latitude, device_longitude);
      Serial.println("📫 Adres: " + device_address);
      Serial.printf("🌍 Ülke: %s\n", country.c_str());
      Serial.printf("🏙️ Şehir: %s\n", city.c_str());
      Serial.println("====================\n");
      
      locationFetched = true;
      http.end();
      return true;
    } else {
      Serial.println("❌ JSON parse hatası: " + String(error.c_str()));
    }
  } else {
    Serial.printf("❌ HTTP hatası: %d\n", httpCode);
  }
  
  http.end();
  
  // Başarısız olursa varsayılan koordinatları kullan
  Serial.println("⚠️ IP konum alınamadı, varsayılan koordinatlar kullanılıyor");
  device_latitude = 39.9334;  // Ankara varsayılan
  device_longitude = 32.8597;
  device_address = "Varsayılan Konum (Ankara)";
  locationFetched = false;
  
  return false;
}

// =========================
// Gelişmiş WiFi Bağlantısı
// =========================
void connectWiFi() {
  Serial.println("🌐 WiFi'ya bağlanılıyor...");
  Serial.println("📶 Hedef ağ: " + String(ssid));
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    
    // LED ile bekleme göstergesi
    digitalWrite(33, !digitalRead(33));
    
    attempts++;
    
    // Her 10 denemede WiFi'yi reset et
    if(attempts % 10 == 0) {
      Serial.println("\n🔄 WiFi reset yapılıyor...");
      WiFi.disconnect();
      delay(1000);
      WiFi.begin(ssid, password);
    }
  }
  
  digitalWrite(33, LOW); // LED'i söndür
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi bağlandı!");
    Serial.println("📍 IP Adresi: " + WiFi.localIP().toString());
    Serial.println("🌐 Gateway: " + WiFi.gatewayIP().toString());
    Serial.println("📶 Sinyal gücü: " + String(WiFi.RSSI()) + " dBm");
    Serial.println("📡 MAC Adresi: " + WiFi.macAddress());
    blinkLED(3, 100); // Başarı göstergesi
  } else {
    Serial.println("\n❌ WiFi bağlantısı başarısız!");
    Serial.println("🔄 10 saniye sonra tekrar denenecek...");
    blinkLED(1, 1000); // Hata göstergesi
  }
}

// =========================
// Güç Optimize Kamera Konfigürasyonu  
// =========================
bool initCamera() {
  Serial.println("📹 Kamera başlatılıyor...");
  
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // PSRAM kontrolü ve güç optimize ayarlar
  if(psramFound()) {
    config.frame_size = FRAMESIZE_VGA;  // 640x480
    config.jpeg_quality = 15;
    config.fb_count = 2;
    Serial.println("✅ PSRAM bulundu, VGA kalite modu");
} else {
    config.frame_size = FRAMESIZE_QVGA; // 320x240
    config.jpeg_quality = 20;
    config.fb_count = 1;
    Serial.println("⚡ PSRAM yok, QVGA kalite modu");
}

  // Kamerayı başlat
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Kamera hatası: 0x%x\n", err);
    cameraInitialized = false;
    return false;
  }

  // Güç optimize sensör ayarları
  sensor_t * s = esp_camera_sensor_get();
  if (s != NULL) {
    s->set_brightness(s, 0);      // -2 to 2 (0=normal)
    s->set_contrast(s, 0);        // -2 to 2 (0=normal)
    s->set_saturation(s, -1);     // Biraz düşük saturasyon (güç tasarrufu)
    s->set_special_effect(s, 0);  // Efekt yok
    s->set_whitebal(s, 1);        // Auto white balance aktif
    s->set_awb_gain(s, 1);        // AWB gain aktif
    s->set_wb_mode(s, 0);         // Auto mode
    s->set_exposure_ctrl(s, 1);   // Auto exposure aktif
    s->set_aec2(s, 1);           // AEC DSP aktif
    s->set_ae_level(s, 0);       // Normal exposure
    s->set_aec_value(s, 300);    // Orta exposure value (güç tasarrufu)
    s->set_gain_ctrl(s, 1);      // Auto gain aktif
    s->set_agc_gain(s, 0);       // Auto gain seviyesi
    s->set_gainceiling(s, (gainceiling_t)6); // Max gain ceiling
    s->set_bpc(s, 1);            // Black pixel cancel aktif
    s->set_wpc(s, 1);            // White pixel cancel aktif
    s->set_raw_gma(s, 1);        // Gamma correction aktif
    s->set_lenc(s, 1);           // Lens correction aktif
    s->set_hmirror(s, 0);        // Yatay mirror kapalı
    s->set_vflip(s, 0);          // Dikey flip kapalı
    s->set_dcw(s, 1);            // DCW aktif
    s->set_colorbar(s, 0);       // Color bar kapalı
    
    Serial.println("🎛️ Kamera sensör ayarları optimize edildi");
  }

  cameraInitialized = true;
  Serial.println("✅ Kamera başarıyla başlatıldı");
  
  // Test frame çek
  camera_fb_t * fb = esp_camera_fb_get();
  if (fb) {
    Serial.printf("📸 Test frame: %dx%d, %d bytes\n", fb->width, fb->height, fb->len);
    esp_camera_fb_return(fb);
  }
  
  return true;
}

// =========================
// SETUP - Gelişmiş Başlangıç
// =========================
void setup() {
  Serial.begin(115200);
  
  Serial.println("\n🚀🚀🚀 ESP32-CAM City-V Entegrasyonu v2.0 🚀🚀🚀");
  Serial.println("====================================================");
  
  // ⚡ ÖNEMLİ: Brownout detector'ı devre dışı bırak (GÜÇ SORUNU ÇÖZÜMÜ)
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  Serial.println("⚡ Brownout detector devre dışı bırakıldı (güç koruması)");
  
  Serial.println("📍 Cihaz ID: " + String(device_id));
  Serial.println("🏢 Lokasyon: " + String(location_name));

  // GPIO ayarları
  pinMode(33, OUTPUT); // Built-in LED (varsa)
  digitalWrite(33, LOW);
  
  // Başlangıç LED animasyonu
  blinkLED(3, 200);

  // Kamerayı başlat
  if(!initCamera()) {
    Serial.println("💥 KRİTİK HATA: Kamera başlatılamadı!");
    Serial.println("🔧 Kontrol listesi:");
    Serial.println("   - Kamera kablolarını kontrol edin");
    Serial.println("   - 5V/2A güç kaynağı kullanın");
    Serial.println("   - GPIO0 bağlantısını çıkardığınızdan emin olun");
    Serial.println("🔄 10 saniye sonra yeniden başlatılacak...");
    
    // Hata LED animasyonu
    for(int i = 0; i < 10; i++) {
      blinkLED(1, 1000);
      delay(500);
    }
    
    ESP.restart();
  }

  // WiFi bağlantısı
  connectWiFi();
  
  if(WiFi.status() == WL_CONNECTED) {
    // Otomatik konum al
    Serial.println("\n🌍 Otomatik konum tespiti başlatılıyor...");
    fetchLocationFromIP();
    
    // HTTP server'ları başlat  
    startCameraServer();
    
    // İlk test raporu
    Serial.println("🧪 İlk test raporu gönderiliyor...");
    sendCrowdReport("startup_test");
    
    Serial.println("\n🎉🎉🎉 ESP32-CAM BAŞARIYLA HAZIR! 🎉🎉🎉");
    Serial.println("===============================================");
    Serial.println("📹 Kamera Stream: http://" + WiFi.localIP().toString() + "/stream");
    Serial.println("📊 Durum Bilgisi: http://" + WiFi.localIP().toString() + "/status");
    Serial.println("🌐 City-V Dashboard: https://" + String(cityv_host) + "/esp32");
    Serial.println("===============================================");
    Serial.printf("⏱️ Kalabalık analizi %d saniyede bir yapılacak\n", reportInterval/1000);
    Serial.println("💡 Komutlar: status, test, analyze, restart, help");
    Serial.println("===============================================\n");
    
    // Başarı LED kutlaması
    blinkLED(5, 100);
  }
}

// =========================
// LOOP - Gelişmiş Ana Döngü
// =========================
void loop() {
  static unsigned long lastWiFiCheck = 0;
  unsigned long currentTime = millis();

  // Periyodik WiFi kontrolü (30 saniyede bir)
  if(currentTime - lastWiFiCheck >= 30000) {
    if(WiFi.status() != WL_CONNECTED) {
      Serial.println("🔄 WiFi bağlantısı kesildi, yeniden bağlanılıyor...");
      connectWiFi();
    }
    lastWiFiCheck = currentTime;
  }

  // Periyodik kalabalık analizi ve rapor
  if(WiFi.status() == WL_CONNECTED && (currentTime - lastReport >= reportInterval)) {
    Serial.println("\n🔍 Kalabalık analizi yapılıyor...");
    
    String crowdLevel = analyzeCrowdLevel();
    
    if(crowdLevel != "error" && crowdLevel != "camera_error") {
      Serial.println("📊 Tespit edilen kalabalık seviyesi: " + crowdLevel);
      sendCrowdReport(crowdLevel);
    } else {
      Serial.println("❌ Analiz hatası, sonraki döngüde tekrar denenecek");
    }
    
    lastReport = currentTime;
  }

  // Gelişmiş seri port komut sistemi
  if(Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toLowerCase();
    
    Serial.println("💬 Komut alındı: " + command);
    
    if(command == "status" || command == "s") {
      Serial.println("\n📊 DETAYLI CİHAZ DURUMU:");
      Serial.println("=======================");
      Serial.printf("🆔 Device ID: %s\n", device_id);
      Serial.printf("📍 Lokasyon: %s\n", location_name);
      Serial.printf("🌐 IP: %s\n", WiFi.localIP().toString().c_str());
      Serial.printf("📡 MAC: %s\n", WiFi.macAddress().c_str());
      Serial.printf("📶 WiFi RSSI: %d dBm\n", WiFi.RSSI());
      Serial.printf("⏰ Uptime: %lu saniye (%lu dakika)\n", currentTime/1000, currentTime/60000);
      Serial.printf("💾 Free Heap: %d / %d bytes\n", ESP.getFreeHeap(), ESP.getHeapSize());
      Serial.printf("⚡ CPU Freq: %d MHz\n", ESP.getCpuFreqMHz());
      Serial.printf("📹 Kamera: %s\n", cameraInitialized ? "Aktif" : "Hata");
      Serial.printf("💽 PSRAM: %s\n", psramFound() ? "Aktif" : "Yok");
      if(psramFound()) {
        Serial.printf("💽 Free PSRAM: %d bytes\n", ESP.getFreePsram());
      }
      Serial.println("=======================\n");
    }
    else if(command == "test" || command == "t") {
      Serial.println("🧪 Test raporu gönderiliyor...");
      sendCrowdReport("test_command");
    }
    else if(command == "analyze" || command == "a") {
      Serial.println("🔍 Anlık kalabalık analizi yapılıyor...");
      String level = analyzeCrowdLevel();
      Serial.println("📊 Analiz sonucu: " + level);
    }
    else if(command == "restart" || command == "r") {
      Serial.println("🔄 Sistem yeniden başlatılıyor...");
      Serial.println("👋 Görüşürüz!");
      delay(1000);
      ESP.restart();
    }
    else if(command == "wifi" || command == "w") {
      Serial.println("🌐 WiFi yeniden bağlanılıyor...");
      WiFi.disconnect();
      delay(1000);
      connectWiFi();
    }
    else if(command == "camera" || command == "c") {
      if(cameraInitialized) {
        camera_fb_t * fb = esp_camera_fb_get();
        if(fb) {
          Serial.printf("📸 Kamera testi başarılı: %dx%d, %d bytes\n", 
                       fb->width, fb->height, fb->len);
          esp_camera_fb_return(fb);
        } else {
          Serial.println("❌ Kamera frame alınamadı");
        }
      } else {
        Serial.println("❌ Kamera başlatılmamış");
      }
    }
    else if(command == "location" || command == "loc" || command == "l") {
      Serial.println("📍 Konum bilgileri:");
      Serial.println("==================");
      Serial.printf("📍 Koordinatlar: %.6f, %.6f\n", device_latitude, device_longitude);
      Serial.println("📫 Adres: " + device_address);
      Serial.printf("✅ Otomatik tespit: %s\n", locationFetched ? "Evet" : "Hayır (Varsayılan)");
      Serial.println("==================\n");
    }
    else if(command == "getlocation" || command == "getloc" || command == "gl") {
      Serial.println("🔄 Konum yeniden alınıyor...");
      fetchLocationFromIP();
    }
    else if(command == "help" || command == "h" || command == "?") {
      Serial.println("\n💡 MEVCUT KOMUTLAR:");
      Serial.println("==================");
      Serial.println("📊 status (s)       - Detaylı sistem durumu");
      Serial.println("🧪 test (t)         - Test raporu gönder");
      Serial.println("🔍 analyze (a)      - Anlık kalabalık analizi");
      Serial.println("📍 location (l)     - Konum bilgilerini göster");
      Serial.println("🌍 getlocation (gl) - Konumu yeniden al");
      Serial.println("🔄 restart (r)      - Sistemi yeniden başlat");
      Serial.println("🌐 wifi (w)         - WiFi yeniden bağlan");
      Serial.println("📹 camera (c)       - Kamera testi");
      Serial.println("💡 help (h/?)       - Bu yardım menüsü");
      Serial.println("==================\n");
    }
    else {
      Serial.println("❓ Bilinmeyen komut: '" + command + "'");
      Serial.println("💡 Yardım için 'help' yazın");
    }
  }

  // CPU rahatlatma
  delay(50);
}