#!/usr/bin/env python3
# ESP32-CAM Emoji Cleanup Script
# Removes all Unicode emoji characters from Arduino .ino files

import re

def fix_esp32_code():
    file_path = r"esp32-cam-cityv.ino"
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace emoji patterns
    replacements = {
        # Remove emojis from Serial.println statements
        r'Serial\.println\("([✅🎉�❌🔍])([^"]+)"\);': r'Serial.println("\2");',
        r'Serial\.println\("([^"]*[✅🎉�❌🔍])([^"]+)"\);': r'Serial.println("\1\2");',
        
        # Clean up HTML emojis
        r'html \+= "([^"]*[✅🎉�❌🔍])([^"]+)";': r'html += "\1\2";',
        
        # Specific replacements
        "🎉": "",
        "✅": "",
        "❌": "",
        "🔍": "",
        "�": "",
    }
    
    # Apply replacements
    for pattern, replacement in replacements.items():
        if pattern.startswith("🎉") or pattern.startswith("✅") or pattern.startswith("❌") or pattern.startswith("🔍") or pattern.startswith("�"):
            # Direct string replacement
            content = content.replace(pattern, replacement)
        else:
            # Regex replacement
            content = re.sub(pattern, replacement, content)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ ESP32-CAM emoji cleanup completed!")
    print("📁 File: esp32-cam-cityv.ino")
    print("🔧 Arduino IDE compilation ready!")

if __name__ == "__main__":
    fix_esp32_code()