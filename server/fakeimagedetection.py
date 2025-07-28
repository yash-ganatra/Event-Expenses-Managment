import sys
import pytesseract
import re
import cv2
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image, ImageChops


sys.stdout.reconfigure(encoding='utf-8')

def validate_ocr_text(img):
    text = pytesseract.image_to_string(img)
    result = {
        "Amount": False,
        "UPI_ID": False,
        "Transaction_ID": False,
        "Date": False
    }

    if re.search(r'₹\s?([\d,]+\.\d{2})', text):
        result["Amount"] = True

    if re.search(r'[\w\.\-]+@[\w]+', text):
        result["UPI_ID"] = True

    if re.search(r'\b[0-9a-zA-Z]{10,}\b', text):
        result["Transaction_ID"] = True

    if re.search(r'\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}', text):
        result["Date"] = True

    return result, text

def error_level_analysis(image_path):
    original = Image.open(image_path).convert('RGB')
    temp_path = 'temp_ela.jpg'
    original.save(temp_path, 'JPEG', quality=90)
    ela_img = Image.open(temp_path)
    ela_diff = ImageChops.difference(original, ela_img)

    extrema = ela_diff.getextrema()
    max_diff = max([e[1] for e in extrema])
    scale = 255.0 / max_diff if max_diff else 1

    ela_img = ela_diff.point(lambda x: x * scale)
    return ela_img, max_diff

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("No image path provided. Exiting...")
        sys.exit(1)

    image_path = sys.argv[1]
    img = Image.open(image_path).convert('RGB')

    text_result, raw_text = validate_ocr_text(img)
    ela_img, max_diff = error_level_analysis(image_path)

    passed_fields = sum(val for val in text_result.values())
    ela_threshold = 25

    if passed_fields >= 3 and max_diff < ela_threshold:
        verdict = "✅ REAL"
    else:
        verdict = "❌ FAKE"

    print(verdict)