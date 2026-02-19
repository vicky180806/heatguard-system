from rembg import remove
from PIL import Image
import io
import os

input_path = r"C:\Users\vijay\Downloads\heatguard-system\public\heatshield logo.jpeg"
output_path = r"C:\Users\vijay\Downloads\heatguard-system\src\assets\logo.png"

try:
    print(f"Opening image: {input_path}")
    with open(input_path, 'rb') as i:
        input_data = i.read()
    
    print("Removing background... (This might take a moment on first run to download models)")
    output_data = remove(input_data)
    
    print(f"Saving to: {output_path}")
    with open(output_path, 'wb') as o:
        o.write(output_data)
        
    print("Success! Logo processed and saved.")

except Exception as e:
    print(f"Error processing image: {e}")
