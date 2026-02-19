from PIL import Image
import os

input_path = r"C:\Users\vijay\Downloads\heatguard-system\src\assets\logo.png"
output_path = r"C:\Users\vijay\Downloads\heatguard-system\public\favicon.ico"

try:
    print(f"Opening image: {input_path}")
    img = Image.open(input_path)
    
    # Save as .ico
    print(f"Saving favicon to: {output_path}")
    img.save(output_path, format='ICO', sizes=[(32, 32), (64, 64), (128, 128), (256, 256)])
        
    print("Success! Favicon created.")

except Exception as e:
    print(f"Error creating favicon: {e}")
