from PIL import Image
import os

def create_favicon():
    source_path = r"c:\Users\vijay\Downloads\heatguard-system\src\assets\logo.png"
    dest_path = r"c:\Users\vijay\Downloads\heatguard-system\public\favicon.ico"
    
    if not os.path.exists(source_path):
        print(f"Error: Source file not found at {source_path}")
        return

    try:
        img = Image.open(source_path)
        img.save(dest_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
        print(f"Success: Favicon created at {dest_path}")
    except Exception as e:
        print(f"Error creating favicon: {e}")

if __name__ == "__main__":
    create_favicon()
