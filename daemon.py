import keyboard
import pyperclip
import time
import threading
import subprocess
import os
import ctypes

# Prevent multiple instances from running
mutex_name = "Global\\AntiOCR_Daemon_Mutex_v1"
mutex = ctypes.windll.kernel32.CreateMutexW(None, False, mutex_name)
if ctypes.windll.kernel32.GetLastError() == 183: # ERROR_ALREADY_EXISTS
    print("="*50)
    print("Warning: Another instance of Anti-OCR Daemon is already running!")
    print("Closing this duplicate instance...")
    print("="*50)
    time.sleep(2)
    os._exit(1)

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
        time.sleep(0.05) # Just enough for UI selection
        
        # 2. Copy (Fast Polling instead of fixed sleep)
        pyperclip.copy("") # clear it first
        keyboard.send('ctrl+c')
        
        # Poll clipboard until it's populated (max 0.3s)
        text = ""
        for _ in range(30):
            text = pyperclip.paste()
            if text and text.strip() != "":
                break
            time.sleep(0.01)
        
        if text and text.strip() != "":
            print(f"-> Selected text length: {len(text)}. Generating image...")
            # Remove shell=True to skip cmd.exe overhead. 
            subprocess.run(['node', CLI_PATH, text])
            
            # Remove the fixed 0.5s sleep. subprocess.run is synchronous, 
            # so the image is already in the clipboard when it returns!
            
            # 3. Paste Image
            keyboard.send('ctrl+v')
            time.sleep(0.05) # Brief wait for the target app to process the image paste
            
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
