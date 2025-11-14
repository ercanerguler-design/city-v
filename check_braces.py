#!/usr/bin/env python3
# Check brace balance in Arduino file

def check_braces(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        open_braces = content.count('{')
        close_braces = content.count('}')
        
        print(f"📊 Brace Analysis:")
        print(f"   Opening braces: {open_braces}")
        print(f"   Closing braces: {close_braces}")
        print(f"   Balance: {open_braces - close_braces}")
        
        if open_braces == close_braces:
            print("✅ Braces are balanced!")
        else:
            print("❌ Braces are NOT balanced!")
            if open_braces > close_braces:
                print(f"   Missing {open_braces - close_braces} closing brace(s)")
            else:
                print(f"   Extra {close_braces - open_braces} closing brace(s)")
        
        # Find last few braces
        lines = content.split('\n')
        brace_lines = []
        for i, line in enumerate(lines, 1):
            if '{' in line or '}' in line:
                brace_lines.append((i, line.strip()))
        
        print("\n📄 Last 10 lines with braces:")
        for line_num, line_content in brace_lines[-10:]:
            print(f"   {line_num}: {line_content}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_braces("esp32-cam-cityv.ino")