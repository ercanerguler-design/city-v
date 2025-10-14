/*
 * ESP32-CAM City-V Entegrasyonu
 * Bu kod ESP32-CAM'inizi City-V platformuna bağlar
 * 
 * Özellikler:
 * - Canlı kamera stream
 * - Otomatik kalabalık analizi
 * - WiFi bağlantısı
 * - City-V API entegrasyonu
 * 
 * Gerekli Kütüphaneler:
 * - ESP32 Camera (esp_camera.h)
 * - WiFi
 * - HTTPClient  
 * - ArduinoJson
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "esp_http_server.h"
#include "img_converters.h"
#include "fb_gfx.h"

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

// =========================
// WiFi ve API Konfigürasyonu
// =========================
const char* ssid = "WiFi_Adi";              // WiFi ağ adınızı buraya yazın
const char* password = "WiFi_Sifresi";      // WiFi şifrenizi buraya yazın

// City-V API ayarları
const char* cityv_host = "cityv.vercel.app";  // Veya kendi domain'iniz
const char* api_endpoint = "/api/esp32/crowd-report";
const char* device_id = "esp32_cam_001";     // Benzersiz cihaz ID'si
const char* location_name = "Test Lokasyonu"; // Lokasyon adı

// Global değişkenler
httpd_handle_t camera_httpd = NULL;
httpd_handle_t stream_httpd = NULL;
unsigned long lastReport = 0;
const unsigned long reportInterval = 30000; // 30 saniye

// =========================
// Kamera Stream Handler
// =========================
static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t * fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t * _jpg_buf = NULL;
  char * part_buf[64];

  res = httpd_resp_set_type(req, "multipart/x-mixed-replace;boundary=frame");
  if(res != ESP_OK) {
    return res;
  }

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  while(true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("❌ Kamera yakalama hatası");
      res = ESP_FAIL;
    } else {
      if(fb->width > 400){
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
      res = httpd_resp_send_chunk(req, "\r\n--frame\r\n", 8);
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
  }
  return res;
}

// =========================
// Status Handler (Cihaz bilgileri)
// =========================
static esp_err_t status_handler(httpd_req_t *req) {
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  
  String response = "{\\"status\\":\\"online\\",";
  response += "\\"device_id\\":\\"" + String(device_id) + "\\",";
  response += "\\"location\\":\\"" + String(location_name) + "\\",";
  response += "\\"ip\\":\\"" + WiFi.localIP().toString() + "\\",";
  response += "\\"uptime\\":" + String(millis()) + ",";
  response += "\\"free_heap\\":" + String(ESP.getFreeHeap()) + "";
  response += "}";
  
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

  // Ana server başlat
  Serial.printf("🌐 HTTP server başlatılıyor port %d\\n", config.server_port);
  if (httpd_start(&camera_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(camera_httpd, &stream_uri);
    httpd_register_uri_handler(camera_httpd, &status_uri);
    Serial.println("✅ Camera server başladı");
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
// Kalabalık Seviyesi Analizi
// =========================
String analyzeCrowdLevel() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Analiz için kamera yakalama hatası");
    return "error";
  }

  // Basit kalabalık analizi algoritması
  // Gerçek projede daha gelişmiş görüntü işleme kullanılabilir
  
  int totalPixels = fb->len;
  int darkPixelCount = 0;
  int motionPixels = 0;
  
  // JPEG verisini basit analiz et
  for(int i = 0; i < totalPixels && i < 10000; i += 50) {
    uint8_t pixelValue = fb->buf[i];
    
    // Koyu piksel sayısı (insanları temsil eder)
    if(pixelValue < 80) {
      darkPixelCount++;
    }
    
    // Hareket tespiti için komşu pikselleri karşılaştır
    if(i + 50 < totalPixels) {
      uint8_t nextPixel = fb->buf[i + 50];
      if(abs(pixelValue - nextPixel) > 30) {
        motionPixels++;
      }
    }
  }
  
  esp_camera_fb_return(fb);
  
  // Kalabalık oranını hesapla (0-1 arası)
  float crowdRatio = (float)(darkPixelCount + motionPixels) / 200.0; // Normalize et
  
  Serial.printf("📊 Analiz: koyu=%d, hareket=%d, oran=%.2f\\n", 
                darkPixelCount, motionPixels, crowdRatio);
  
  // Kalabalık seviyesini belirle
  if(crowdRatio > 0.8) {
    return "very_high";
  } else if(crowdRatio > 0.6) {
    return "high"; 
  } else if(crowdRatio > 0.4) {
    return "moderate";
  } else if(crowdRatio > 0.2) {
    return "low";
  } else {
    return "empty";
  }
}

// =========================
// City-V API'ye Rapor Gönderme
// =========================
void sendCrowdReport(String crowdLevel) {
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi bağlantısı yok");
    return;
  }

  HTTPClient http;
  http.begin("https://" + String(cityv_host) + api_endpoint);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 saniye timeout

  // JSON payload oluştur
  DynamicJsonDocument doc(512);
  doc["locationId"] = location_name;
  doc["crowdLevel"] = crowdLevel;
  doc["timestamp"] = millis();
  doc["deviceId"] = device_id;
  doc["coordinates"] = {
    {"lat", 39.9334}, // Ankara koordinatları (değiştirin)
    {"lng", 32.8597}
  };
  doc["metadata"] = {
    {"ip", WiFi.localIP().toString()},
    {"rssi", WiFi.RSSI()},
    {"uptime", millis()},
    {"freeHeap", ESP.getFreeHeap()}
  };

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("📡 City-V'ye rapor gönderiliyor...");
  Serial.println("📄 Payload: " + jsonString);

  int httpResponseCode = http.POST(jsonString);

  if(httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("✅ Rapor gönderildi! HTTP: %d\\n", httpResponseCode);
    Serial.println("📨 Yanıt: " + response);
    
    // LED'i yanıp söndür (başarı)
    if(httpResponseCode == 200) {
      digitalWrite(33, HIGH); // Built-in LED (eğer varsa)
      delay(100);
      digitalWrite(33, LOW);
    }
  } else {
    Serial.printf("❌ HTTP hatası: %d\\n", httpResponseCode);
  }

  http.end();
}

// =========================
// WiFi Bağlantısı
// =========================
void connectWiFi() {
  Serial.println("🌐 WiFi'ya bağlanılıyor...");
  Serial.println("📶 Ağ: " + String(ssid));
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("✅ WiFi bağlandı!");
    Serial.println("📍 IP Adresi: " + WiFi.localIP().toString());
    Serial.println("📊 Sinyal Gücü: " + String(WiFi.RSSI()) + " dBm");
  } else {
    Serial.println("");
    Serial.println("❌ WiFi bağlantısı başarısız!");
    Serial.println("🔄 5 saniye sonra tekrar denenecek...");
  }
}

// =========================
// Kamera Konfigürasyonu  
// =========================
bool initCamera() {
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

  // Kalite ayarları (PSRAM varsa daha yüksek çözünürlük)
  if(psramFound()) {
    config.frame_size = FRAMESIZE_UXGA;  // 1600x1200
    config.jpeg_quality = 10;
    config.fb_count = 2;
    Serial.println("✅ PSRAM bulundu, yüksek kalite modu");
  } else {
    config.frame_size = FRAMESIZE_SVGA;  // 800x600  
    config.jpeg_quality = 12;
    config.fb_count = 1;
    Serial.println("⚠️ PSRAM yok, standart kalite modu");
  }

  // Kamerayı başlat
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Kamera hatası: 0x%x\\n", err);
    return false;
  }

  // Kamera sensör ayarları
  sensor_t * s = esp_camera_sensor_get();
  if (s != NULL) {
    s->set_brightness(s, 0);      // -2 to 2
    s->set_contrast(s, 0);        // -2 to 2
    s->set_saturation(s, 0);      // -2 to 2
    s->set_special_effect(s, 0);  // 0 to 6 (0-No Effect, 1-Negative, 2-Grayscale, 3-Red Tint, 4-Green Tint, 5-Blue Tint, 6-Sepia)
    s->set_whitebal(s, 1);        // 0 = disable , 1 = enable
    s->set_awb_gain(s, 1);        // 0 = disable , 1 = enable
    s->set_wb_mode(s, 0);         // 0 to 4 - if awb_gain enabled (0 - Auto, 1 - Sunny, 2 - Cloudy, 3 - Office, 4 - Home)
    s->set_exposure_ctrl(s, 1);   // 0 = disable , 1 = enable
    s->set_aec2(s, 0);           // 0 = disable , 1 = enable
    s->set_ae_level(s, 0);       // -2 to 2
    s->set_aec_value(s, 300);    // 0 to 1200
    s->set_gain_ctrl(s, 1);      // 0 = disable , 1 = enable
    s->set_agc_gain(s, 0);       // 0 to 30
    s->set_gainceiling(s, (gainceiling_t)0); // 0 to 6
    s->set_bpc(s, 0);            // 0 = disable , 1 = enable
    s->set_wpc(s, 1);            // 0 = disable , 1 = enable
    s->set_raw_gma(s, 1);        // 0 = disable , 1 = enable
    s->set_lenc(s, 1);           // 0 = disable , 1 = enable
    s->set_hmirror(s, 0);        // 0 = disable , 1 = enable
    s->set_vflip(s, 0);          // 0 = disable , 1 = enable
    s->set_dcw(s, 1);            // 0 = disable , 1 = enable
    s->set_colorbar(s, 0);       // 0 = disable , 1 = enable
  }

  Serial.println("✅ Kamera başarıyla başlatıldı");
  return true;
}

// =========================
// SETUP - Başlangıç
// =========================
void setup() {
  Serial.begin(115200);
  Serial.println("🚀 ESP32-CAM City-V Entegrasyonu Başlıyor...");
  Serial.println("📍 Cihaz ID: " + String(device_id));
  Serial.println("🏢 Lokasyon: " + String(location_name));

  // GPIO ayarları
  pinMode(33, OUTPUT); // Built-in LED (varsa)
  digitalWrite(33, LOW);

  // Kamerayı başlat
  if(!initCamera()) {
    Serial.println("💥 Kamera başlatılamadı, yeniden başlatılıyor...");
    delay(5000);
    ESP.restart();
  }

  // WiFi bağlantısı
  connectWiFi();
  
  if(WiFi.status() == WL_CONNECTED) {
    // HTTP server'ları başlat  
    startCameraServer();
    
    Serial.println("\\n🎯 ESP32-CAM hazır!");
    Serial.println("📹 Kamera Stream: http://" + WiFi.localIP().toString() + "/stream");
    Serial.println("📊 Durum Bilgisi: http://" + WiFi.localIP().toString() + "/status");
    Serial.println("🌐 City-V Dashboard: https://" + String(cityv_host) + "/esp32");
    Serial.println("\\n⏱️ Kalabalık analizi " + String(reportInterval/1000) + " saniyede bir yapılacak...");
  }
}

// =========================
// LOOP - Ana Döngü
// =========================
void loop() {
  // WiFi bağlantısını kontrol et
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi bağlantısı kesildi, yeniden bağlanıyor...");
    connectWiFi();
    delay(5000);
    return;
  }

  // Periyodik kalabalık analizi ve rapor
  unsigned long currentTime = millis();
  if(currentTime - lastReport >= reportInterval) {
    Serial.println("\\n🔍 Kalabalık analizi yapılıyor...");
    
    String crowdLevel = analyzeCrowdLevel();
    
    if(crowdLevel != "error") {
      Serial.println("📊 Tespit edilen kalabalık seviyesi: " + crowdLevel);
      sendCrowdReport(crowdLevel);
    } else {
      Serial.println("❌ Analiz hatası");
    }
    
    lastReport = currentTime;
  }

  // Seri port komutlarını dinle
  if(Serial.available()) {
    String command = Serial.readString();
    command.trim();
    
    if(command == "status") {
      Serial.println("\\n📊 Cihaz Durumu:");
      Serial.println("🆔 Device ID: " + String(device_id));
      Serial.println("📍 Lokasyon: " + String(location_name));
      Serial.println("🌐 IP: " + WiFi.localIP().toString());
      Serial.println("📶 WiFi RSSI: " + String(WiFi.RSSI()) + " dBm");
      Serial.println("⏰ Uptime: " + String(millis()/1000) + " saniye");
      Serial.println("💾 Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
    }
    else if(command == "test") {
      Serial.println("🧪 Test raporu gönderiliyor...");
      sendCrowdReport("moderate");
    }
    else if(command == "analyze") {
      Serial.println("🔍 Anlık analiz yapılıyor...");
      String level = analyzeCrowdLevel();
      Serial.println("📊 Sonuç: " + level);
    }
    else if(command == "restart") {
      Serial.println("🔄 Cihaz yeniden başlatılıyor...");
      delay(1000);
      ESP.restart();
    }
    else {
      Serial.println("❓ Bilinmeyen komut: " + command);
      Serial.println("💡 Mevcut komutlar: status, test, analyze, restart");
    }
  }

  // CPU'yu rahatlatmak için kısa bekleme
  delay(100);
}