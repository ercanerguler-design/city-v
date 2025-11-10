import re

# Read the original file
with open(r"C:\Users\ercan\OneDrive\Belgeler\Arduino\sketch_oct24a\sketch_oct24a.ino.backup", "r", encoding="utf-8") as f:
    content = f.read()

# Find and replace the handleRoot function
handleRoot_fixed = '''void handleRoot() {
  String html = "<!DOCTYPE html><html><head><title>ESP32-CAM City-V IoT</title>";
  html += "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'>";
  html += "<style>body{font-family:Arial;margin:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white}";
  html += ".container{max-width:800px;margin:0 auto;background:rgba(255,255,255,0.1);border-radius:20px;padding:30px}";
  html += "h1{text-align:center;margin-bottom:30px;font-size:2.5em}";
  html += ".status{background:rgba(255,255,255,0.2);padding:20px;border-radius:15px;margin:20px 0}";
  html += ".btn{background:#4CAF50;color:white;padding:15px 25px;border:none;border-radius:10px;cursor:pointer;margin:10px;font-size:16px}";
  html += ".btn:hover{background:#45a049}.btn-blue{background:#2196F3}.btn-blue:hover{background:#1976D2}";
  html += ".btn-red{background:#f44336}.btn-red:hover{background:#d32f2f}";
  html += ".stream-container{text-align:center;margin:20px 0}";
  html += ".stream-img{max-width:100%;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.3)}";
  html += "</style></head><body><div class='container'><h1>ESP32-CAM City-V IoT</h1>";
  html += "<div class='status'><h3>Device Status</h3>";
  html += "<p><strong>Device ID:</strong> " + DEVICE_ID + "</p>";
  html += "<p><strong>Device Name:</strong> " + DEVICE_NAME + "</p>";
  html += "<p><strong>Location:</strong> " + STOP_NAME + "</p>";
  html += "<p><strong>Line:</strong> " + LINE_CODE + "</p>";
  html += "<p><strong>IP:</strong> " + WiFi.localIP().toString() + "</p>";
  html += "<p><strong>WiFi:</strong> " + String(WiFi.RSSI()) + " dBm</p>";
  html += "<p><strong>Uptime:</strong> " + String(millis()/1000) + " sec</p></div>";
  html += "<div class='stream-container'><h3>Live Camera</h3>";
  html += "<img id='stream' class='stream-img' src='/capture'/><br>";
  html += "<button class='btn btn-blue' onclick='refreshImage()'>Refresh</button>";
  html += "<button class='btn btn-blue' onclick='toggleStream()'>Stream</button></div>";
  html += "<div style='text-align:center'>";
  html += "<button class='btn' onclick=\\"location.href='/config'\\">Config</button>";
  html += "<button class='btn btn-blue' onclick=\\"location.href='/status'\\">Status</button>";
  html += "<button class='btn btn-red' onclick=\\"location.href='/reset'\\">Restart</button></div></div>";
  html += "<script>function refreshImage(){document.getElementById('stream').src='/capture?'+new Date().getTime();}";
  html += "function toggleStream(){var img=document.getElementById('stream');";
  html += "if(img.src.includes('/capture')){img.src='/stream';}else{img.src='/capture?'+new Date().getTime();}}";
  html += "setInterval(refreshImage,5000);</script></body></html>";
  server.send(200, "text/html", html);
}'''

# Replace the handleRoot function using regex
pattern = r'void handleRoot\(\) \{.*?^}'
content_fixed = re.sub(pattern, handleRoot_fixed, content, flags=re.DOTALL | re.MULTILINE)

# Write the fixed content - UTF-8 without BOM
with open(r"C:\Users\ercan\OneDrive\Belgeler\Arduino\sketch_oct24a\sketch_oct24a.ino", "w", encoding="utf-8") as f:
    f.write(content_fixed)

print("Fixed handleRoot function in sketch_oct24a.ino")
print("File saved with UTF-8 encoding (no BOM)")
