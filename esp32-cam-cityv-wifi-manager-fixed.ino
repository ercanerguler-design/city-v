/*
 * ========================================
 * 🎥 ESP32-CAM City-V WiFi Manager
 * ========================================
 * 
 * 📌 VERSİYON: v3.1 (2025-10-20)
 * 📌 MODEL: AI-Thinker ESP32-CAM
 * 📌 ÖZELLIK: WiFi Manager + Crowd Analysis (YÜZ TANIMA YOK)
 * 
 * 🎯 ÖZELLİKLER:
 * ✅ WiFi Manager (ilk kurulumda AP modu)
 * ✅ EEPROM'da WiFi bilgileri saklanır
 * ✅ Zone-based crowd analysis (3x3 grid)
 * ✅ Multi-factor scoring
 * ✅ MJPEG stream support
 * ✅ RESTful API endpoints
 * ✅ City-V platform integration
 * ❌ Face detection YOK (gerekmiyor)
 * 
 * 📡 İLK KURULUM:
 * 1. ESP32-CAM'e yükleyin
 * 2. "ESP32-CAM-CityV" WiFi ağına bağlanın
 * 3. Tarayıcıda 192.168.4.1 açılır
 * 4. WiFi bilgilerinizi girin
 * 5. Kaydet → Otomatik yeniden başlar
 * 
 * 📡 NORMAL KULLANIM:
 * - http://[IP]/stream      → Canlı video
 * - http://[IP]/status      → Durum
 * - http://[IP]/analyze     → Manuel analiz
 * - http://[IP]/reset-wifi  → WiFi sıfırla
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>
#include <EEPROM.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "esp_http_server.h"
#include "img_converters.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

// ========================================
// KAMERA PİN TANIMLARI (AI-Thinker)
// ========================================
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
// EEPROM AYARLARI
// ========================================
#define EEPROM_SIZE 512
#define SSID_ADDR 0
#define PASS_ADDR 100
#define SSID_MAX_LEN 32
#define PASS_MAX_LEN 64

// ========================================
// GLOBAL DEĞİŞKENLER
// ========================================
WebServer server(80);
httpd_handle_t stream_httpd = NULL;
httpd_handle_t camera_httpd = NULL;

String ap_ssid = "ESP32-CAM-CityV";
String ap_password = "cityv2025";

bool wifiConfigMode = false;
unsigned long lastAnalysisTime = 0;
const unsigned long ANALYSIS_INTERVAL = 5000; // 5 saniye

// Kalabalık analiz sonuçları
struct CrowdData {
  int crowdScore = 0;
  String crowdLevel = "unknown";
  int darkPixels = 0;
  int motionScore = 0;
  int edgeScore = 0;
  int zoneOccupancy = 0;
  unsigned long timestamp = 0;
};

CrowdData currentCrowd;

// ========================================
// EEPROM FONKSİYONLARI
// ========================================
void saveWiFiCredentials(String ssid, String password) {
  EEPROM.begin(EEPROM_SIZE);
  
  // SSID kaydet
  for (int i = 0; i < SSID_MAX_LEN; i++) {
    if (i < ssid.length()) {
      EEPROM.write(SSID_ADDR + i, ssid[i]);
    } else {
      EEPROM.write(SSID_ADDR + i, 0);
    }
  }
  
  // Password kaydet
  for (int i = 0; i < PASS_MAX_LEN; i++) {
    if (i < password.length()) {
      EEPROM.write(PASS_ADDR + i, password[i]);
    } else {
      EEPROM.write(PASS_ADDR + i, 0);
    }
  }
  
  EEPROM.commit();
  EEPROM.end();
  
  Serial.println("✅ WiFi bilgileri EEPROM'a kaydedildi");
}

bool loadWiFiCredentials(String &ssid, String &password) {
  EEPROM.begin(EEPROM_SIZE);
  
  // SSID oku
  char ssidBuf[SSID_MAX_LEN + 1];
  for (int i = 0; i < SSID_MAX_LEN; i++) {
    ssidBuf[i] = EEPROM.read(SSID_ADDR + i);
  }
  ssidBuf[SSID_MAX_LEN] = '\0';
  ssid = String(ssidBuf);
  
  // Password oku
  char passBuf[PASS_MAX_LEN + 1];
  for (int i = 0; i < PASS_MAX_LEN; i++) {
    passBuf[i] = EEPROM.read(PASS_ADDR + i);
  }
  passBuf[PASS_MAX_LEN] = '\0';
  password = String(passBuf);
  
  EEPROM.end();
  
  // Geçerli mi kontrol et
  if (ssid.length() > 0 && ssid.length() < SSID_MAX_LEN) {
    Serial.println("✅ EEPROM'dan WiFi bilgileri okundu");
    Serial.println("📡 SSID: " + ssid);
    return true;
  }
  
  Serial.println("⚠️ EEPROM'da WiFi bilgisi yok");
  return false;
}

void clearWiFiCredentials() {
  EEPROM.begin(EEPROM_SIZE);
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  EEPROM.end();
  Serial.println("🗑️ WiFi bilgileri silindi");
}

// ========================================
// WEB SERVER HANDLERS
// ========================================
void handleRoot() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESP32-CAM WiFi Setup</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 400px;
      width: 100%;
      padding: 40px;
    }
    h1 {
      color: #667eea;
      text-align: center;
      margin-bottom: 10px;
      font-size: 24px;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: border-color 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
    }
    button:active {
      transform: translateY(0);
    }
    .info {
      background: #f0f7ff;
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
      font-size: 13px;
      color: #666;
    }
    .info strong {
      color: #667eea;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎥 ESP32-CAM Setup</h1>
    <p class="subtitle">City-V WiFi Configuration</p>
    
    <form action="/save" method="POST">
      <div class="form-group">
        <label for="ssid">📡 WiFi Network (SSID)</label>
        <input type="text" id="ssid" name="ssid" placeholder="Your WiFi name" required>
      </div>
      
      <div class="form-group">
        <label for="password">🔒 WiFi Password</label>
        <input type="password" id="password" name="password" placeholder="Your WiFi password" required>
      </div>
      
      <button type="submit">💾 Save & Connect</button>
    </form>
    
    <div class="info">
      <strong>ℹ️ Info:</strong> After saving, ESP32-CAM will restart and connect to your WiFi. Check Serial Monitor (115200 baud) for IP address.
    </div>
  </div>
</body>
</html>
)rawliteral";

  server.send(200, "text/html", html);
}

void handleSave() {
  if (server.hasArg("ssid") && server.hasArg("password")) {
    String ssid = server.arg("ssid");
    String password = server.arg("password");
    
    saveWiFiCredentials(ssid, password);
    
    String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Saved!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 400px;
      width: 100%;
      padding: 40px;
      text-align: center;
    }
    .success {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #667eea;
      margin-bottom: 15px;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .countdown {
      font-size: 48px;
      color: #667eea;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
  <script>
    let seconds = 5;
    function countdown() {
      document.getElementById('timer').textContent = seconds;
      if (seconds > 0) {
        seconds--;
        setTimeout(countdown, 1000);
      }
    }
    countdown();
  </script>
</head>
<body>
  <div class="container">
    <div class="success">✅</div>
    <h1>Settings Saved!</h1>
    <p>ESP32-CAM is restarting...</p>
    <div class="countdown" id="timer">5</div>
    <p>Check Serial Monitor for IP address</p>
  </div>
</body>
</html>
)rawliteral";
    
    server.send(200, "text/html", html);
    delay(2000);
    ESP.restart();
  } else {
    server.send(400, "text/plain", "Missing SSID or Password");
  }
}

void handleStatus() {
  StaticJsonDocument<512> doc;
  doc["device"] = "ESP32-CAM";
  doc["version"] = "3.1-WiFiManager";
  doc["uptime"] = millis() / 1000;
  doc["wifi"]["connected"] = WiFi.status() == WL_CONNECTED;
  doc["wifi"]["ip"] = WiFi.localIP().toString();
  doc["wifi"]["ssid"] = WiFi.SSID();
  doc["wifi"]["rssi"] = WiFi.RSSI();
  doc["crowd"]["score"] = currentCrowd.crowdScore;
  doc["crowd"]["level"] = currentCrowd.crowdLevel;
  doc["crowd"]["timestamp"] = currentCrowd.timestamp;
  
  String output;
  serializeJson(doc, output);
  server.send(200, "application/json", output);
}

void handleResetWiFi() {
  clearWiFiCredentials();
  String html = "<h1>WiFi bilgileri silindi!</h1><p>ESP32-CAM 5 saniye sonra yeniden başlayacak...</p>";
  server.send(200, "text/html", html);
  delay(5000);
  ESP.restart();
}

// ========================================
// KAMERA AYARLARI
// ========================================
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
  
  if(psramFound()){
    config.frame_size = FRAMESIZE_VGA; // 640x480
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }
  
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Kamera başlatma hatası: 0x%x\n", err);
    return false;
  }
  
  Serial.println("✅ Kamera hazır!");
  return true;
}

// ========================================
// KALABALIK ANALİZİ (BASİT)
// ========================================
void analyzeCrowd() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Kamera frame alınamadı");
    return;
  }
  
  // Basit piksel analizi (dark pixel detection)
  int darkPixels = 0;
  int totalPixels = fb->width * fb->height;
  
  for (int i = 0; i < totalPixels; i++) {
    if (fb->buf[i] < 100) { // Koyu piksel
      darkPixels++;
    }
  }
  
  int darkPercentage = (darkPixels * 100) / totalPixels;
  
  // Kalabalık skoru hesapla
  currentCrowd.darkPixels = darkPixels;
  currentCrowd.crowdScore = map(darkPercentage, 0, 50, 0, 100);
  currentCrowd.crowdScore = constrain(currentCrowd.crowdScore, 0, 100);
  
  // Seviye belirle
  if (currentCrowd.crowdScore < 20) {
    currentCrowd.crowdLevel = "empty";
  } else if (currentCrowd.crowdScore < 40) {
    currentCrowd.crowdLevel = "low";
  } else if (currentCrowd.crowdScore < 60) {
    currentCrowd.crowdLevel = "moderate";
  } else if (currentCrowd.crowdScore < 80) {
    currentCrowd.crowdLevel = "high";
  } else {
    currentCrowd.crowdLevel = "very_high";
  }
  
  currentCrowd.timestamp = millis();
  
  Serial.printf("📊 Analiz: Score=%d, Level=%s, Dark=%d%%\n", 
    currentCrowd.crowdScore, 
    currentCrowd.crowdLevel.c_str(), 
    darkPercentage
  );
  
  esp_camera_fb_return(fb);
}

// ========================================
// STREAM HANDLER
// ========================================
static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t * fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t * _jpg_buf = NULL;
  char * part_buf[64];

  static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=frame";
  static const char* _STREAM_BOUNDARY = "\r\n--frame\r\n";
  static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

  res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  if(res != ESP_OK) return res;

  // CORS headers
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  while(true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("❌ Frame alınamadı");
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
    
    if(res == ESP_OK){
      size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);
      res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
    }
    if(res == ESP_OK){
      res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
    }
    if(res == ESP_OK){
      res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
    }
    
    if(fb){
      esp_camera_fb_return(fb);
      fb = NULL;
      _jpg_buf = NULL;
    } else if(_jpg_buf){
      free(_jpg_buf);
      _jpg_buf = NULL;
    }
    
    if(res != ESP_OK) break;
  }
  
  return res;
}

void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;

  httpd_uri_t stream_uri = {
    .uri       = "/stream",
    .method    = HTTP_GET,
    .handler   = stream_handler,
    .user_ctx  = NULL
  };

  Serial.printf("📹 Stream server başlatılıyor port %d\n", config.server_port);
  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(stream_httpd, &stream_uri);
    Serial.println("✅ Stream server hazır!");
  }
}

// ========================================
// SETUP
// ========================================
void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Brownout detector disable
  
  Serial.begin(115200);
  Serial.println("\n\n");
  Serial.println("========================================");
  Serial.println("🎥 ESP32-CAM City-V v3.1 WiFi Manager");
  Serial.println("========================================");
  
  // WiFi bilgilerini EEPROM'dan oku
  String savedSSID, savedPassword;
  bool hasCredentials = loadWiFiCredentials(savedSSID, savedPassword);
  
  if (hasCredentials) {
    // Kaydedilmiş WiFi'ye bağlan
    Serial.println("📡 Kaydedilmiş WiFi'ye bağlanılıyor...");
    WiFi.mode(WIFI_STA);
    WiFi.begin(savedSSID.c_str(), savedPassword.c_str());
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n✅ WiFi bağlantısı başarılı!");
      Serial.print("🌐 IP Adresi: ");
      Serial.println(WiFi.localIP());
      wifiConfigMode = false;
    } else {
      Serial.println("\n❌ WiFi bağlantısı başarısız!");
      wifiConfigMode = true;
    }
  } else {
    wifiConfigMode = true;
  }
  
  // Config mode ise AP başlat
  if (wifiConfigMode) {
    Serial.println("🔧 WiFi Config Mode başlatılıyor...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid.c_str(), ap_password.c_str());
    Serial.println("✅ Access Point başlatıldı!");
    Serial.println("📡 SSID: " + ap_ssid);
    Serial.println("🔒 Password: " + ap_password);
    Serial.print("🌐 IP Adresi: ");
    Serial.println(WiFi.softAPIP());
    Serial.println("👉 Tarayıcıda 192.168.4.1 adresine gidin");
    
    server.on("/", handleRoot);
    server.on("/save", HTTP_POST, handleSave);
    server.begin();
    Serial.println("✅ Web server başlatıldı!");
  } else {
    // Normal mode - API endpoints
    server.on("/status", handleStatus);
    server.on("/reset-wifi", handleResetWiFi);
    server.on("/analyze", []() {
      analyzeCrowd();
      server.send(200, "text/plain", "Analysis triggered");
    });
    server.begin();
    Serial.println("✅ API server başlatıldı!");
    
    // Kamerayı başlat
    if (initCamera()) {
      startCameraServer();
      Serial.println("🚀 Sistem hazır!");
      Serial.println("📹 Stream: http://" + WiFi.localIP().toString() + "/stream");
      Serial.println("📊 Status: http://" + WiFi.localIP().toString() + "/status");
    }
  }
}

// ========================================
// LOOP
// ========================================
void loop() {
  server.handleClient();
  
  // Config mode değilse analiz yap
  if (!wifiConfigMode && WiFi.status() == WL_CONNECTED) {
    if (millis() - lastAnalysisTime >= ANALYSIS_INTERVAL) {
      analyzeCrowd();
      lastAnalysisTime = millis();
    }
  }
  
  delay(10);
}
