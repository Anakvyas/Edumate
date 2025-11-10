import boto3
import fitz
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import torch
import io
from dotenv import load_dotenv
import cv2
import numpy as np
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from google.cloud import vision
import google.generativeai as genai
from helpers import text_to_pdf_buffer,upload_pdf_to_s3



load_dotenv()
import os
s3 = boto3.client(
    "s3",
    aws_access_key_id= os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name="eu-north-1"
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))



# model_name = "microsoft/trocr-base-printed"
# processor = TrOCRProcessor.from_pretrained(model_name, local_files_only=True)
# model = VisionEncoderDecoderModel.from_pretrained(model_name, local_files_only=True)
# device = "cuda" if torch.cuda.is_available() else "cpu"
# model.to(device)

# def ocr_line(img):
#     pixel_values = processor(images=img, return_tensors="pt").pixel_values.to(device)
#     generated_ids = model.generate(pixel_values, max_length=512)
#     text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
#     return text


def extract_pdf(bucket,key):
    obj =  s3.get_object(Bucket=bucket,Key= key)
    bytes = obj["Body"].read()

    result = []
    pdf = fitz.open(stream=bytes, filetype="pdf")

    print("pdf",len(pdf))

    for i in range(len(pdf)):
        page = pdf[i]
        print(i)
        extracted = page.get_text()

        if extracted.strip():
            result.append({i+1:extracted})
        else:
            pix = page.get_pixmap(dpi=300)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))
            # img_cv = np.array(img)

            # # ✅ Threshold & find horizontal contours (text lines)
            # thresh = cv2.threshold(img_cv, 150, 255, cv2.THRESH_BINARY_INV)[1]
            # kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (50, 3))
            # dilate = cv2.dilate(thresh, kernel, iterations=2)

            # contours, _ = cv2.findContours(dilate, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            # contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[1])  # sort by Y (top→bottom)

            # page_text = []

            # for cnt in contours:
            #     x, y, w, h = cv2.boundingRect(cnt)
            #     line_img = img_cv[y:y+h, x:x+w]

            #     pil_line = Image.fromarray(line_img).convert("RGB")

            #     text = ocr_line(pil_line)
            #     if text:
            #         page_text.append(text)

            text = pytesseract.image_to_string(img, lang="eng")
            result.append({i+1:text})

    return result


#  for Handwritten pdf

# using google vision 
client = vision.ImageAnnotatorClient()

def run_vision(bucket,key):
    obj =  s3.get_object(Bucket=bucket,Key= key)
    bytes = obj["Body"].read()

    result = ""
    pdf = fitz.open(stream=bytes, filetype="pdf")

    for i in range(len(pdf)):
        page = pdf[i]
        pix = page.get_pixmap(dpi=300)
        img_bytes = pix.tobytes("png")
        image = vision.Image(content=img_bytes)
        response = client.document_text_detection(image=image)
        text = response.text_annotations[0].description.strip()

        prompt = f"""
        Refine the following handwritten text extracted by OCR.
        - Correct spelling errors
        - Add punctuation
        - Maintain the original meaning and paragraph breaks
        - Format clearly for readability
        - return only refined text not any prefixed prompt or explanation
        Text:
        {text}
        """

        model = genai.GenerativeModel("models/gemini-2.0-flash")
        refined_response = model.generate_content(prompt)
        refined_text = refined_response.text.strip()

        # result.append(refined_text)
        # print(refined_text)
        result+=refined_text
        result+=" "
    
    bytes = text_to_pdf_buffer(result)
    url = upload_pdf_to_s3(bytes,bucket)
    return url


