import keyboard
import pyperclip
import time
import threading
import subprocess
import os

CLI_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cli.js')
MACRO_RUNNING = False
LOCK = threading.Lock()

print("="*50)
print("Anti-OCR Manual Trigger Daemon is RUNNING.")
print("Hotkey: Press [ Ctrl + Enter ] to auto-convert your typed text into an image.")
print("="*50)

def do_macro():
    global MACRO_RUNNING
    with LOCK:
        if MACRO_RUNNING:
            return
        MACRO_RUNNING = True

    try:
        print(f"[{time.strftime('%H:%M:%S')}] Triggered Manual Conversion...")
        
        pyperclip.copy("")
        
        # 1. Select All
        keyboard.send('ctrl+a')
        time.sleep(0.1)
        
        # 2. Copy
        keyboard.send('ctrl+c')
        time.sleep(0.2)
        
        text = pyperclip.paste()
        
        if text and text.strip() != "":
            print(f"-> Selected text length: {len(text)}. Generating image...")
            subprocess.run(['node', CLI_PATH, text], shell=True)
            time.sleep(0.5) 
            
            # 3. Paste Image
            keyboard.send('ctrl+v')
            time.sleep(0.1) # Wait briefly for paste to process
            
            # 4. Send Message (Enter)
            keyboard.send('enter')
            print("-> Image pasted and sent successfully!")
        else:
            print("-> No text selected or text is empty.")
            
    except Exception as e:
        print("Error during execution:", e)
    finally:
        with LOCK:
            MACRO_RUNNING = False

# Bind the hotkey
keyboard.add_hotkey('ctrl+enter', do_macro)

# Keep the script running
keyboard.wait()
