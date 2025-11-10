#!/usr/bin/env python3
# Fix encoding issues in Arduino file

def fix_arduino_encoding():
    try:
        # Read with UTF-8
        with open("esp32-cam-cityv.ino", 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Replace problematic characters
        replacements = {
            'ÄŸ': 'g',
            'ğŸ': '🔥',
            'ğŸ¢': '🏢', 
            'ğŸš€': '🚀',
            'ğŸ"±': '📱',
            'âš¡': '⚡',
            'ğŸ"': '🔍',
            'ğŸŒ': '🌐',
            'ğŸ"Š': '📊',
            'ğŸ"¹': '🎹',
            'ğŸ"¡': '📡',
            'ğŸ¤–': '🤖',
            'ğŸ'¥': '💥',
            'Ä°': 'I',
            'Åž': 'S',
            'Åœ': 'S',
            'Ä±': 'i',
            'ÅŸ': 's',
            'Ã§': 'c',
            'Ã¶': 'o',
            'Ã¼': 'u'
        }
        
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        # Write as UTF-8 without BOM
        with open("esp32-cam-cityv.ino", 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        
        print("✅ Arduino file encoding fixed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_arduino_encoding()