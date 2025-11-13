import json
import re
import ast
import tempfile
import uuid
import zipfile
from fpdf import FPDF
import boto3
import os
from dotenv import load_dotenv
from io import BytesIO
import textwrap
import google.generativeai as genai 
import shutil
from utils import process_pdf_rag

load_dotenv()


s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name="eu-north-1"
)
genai.configure(api_key = os.getenv("GEMINI_API_KEY"))


def clean_content(pdf_result):
    text = ""
    for page in pdf_result:
        text += list(page.values())[0] + "\n"
    return text


def clean_and_parse_json(text: str):
    if not text:
        return []

    text = re.sub(r"^```(?:json)?", "", text.strip(), flags=re.IGNORECASE)
    text = re.sub(r"```$", "", text.strip())
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        try:
            return ast.literal_eval(text)
        except Exception:
            return [text]

import re

def remove_non_latin(text):
    return re.sub(r'[^\x00-\xff]', '?', text)


def safe_wrap_line(line: str, width: int = 100):
    if len(line) > width and " " not in line:
        return "\n".join([line[i:i + width] for i in range(0, len(line), width)])
    else:
        return textwrap.fill(line, width=width)


def text_to_pdf_buffer(text: str) -> bytes:
    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", size=12)

    for line in text.split("\n"):
        wrapped = safe_wrap_line(line)
        clean_text = remove_non_latin(wrapped)
        pdf.multi_cell(0, 10, clean_text)

    pdf_bytes = pdf.output(dest='S').encode('latin1')
    return pdf_bytes



def upload_vectorstore_to_s3(persist_dir, bucket_name):
    zip_path = f"{persist_dir}.zip"
    shutil.make_archive(persist_dir, 'zip', persist_dir)
    s3_key = f"vectorstores/{os.path.basename(zip_path)}"
    s3.upload_file(zip_path, bucket_name, s3_key)
    os.remove(zip_path)
    shutil.rmtree(persist_dir, ignore_errors=True)
    return f"s3://{bucket_name}/{s3_key}"



def download_and_extract_vectorstore(s3_uri, bucket_name):
    s3_key = s3_uri.replace(f"s3://{bucket_name}/", "")
    tmp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(tmp_dir, "vs.zip")
    s3.download_file(bucket_name, s3_key, zip_path)
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(tmp_dir)
    return tmp_dir




def upload_pdf_to_s3(pdf_bytes: bytes, BUCKET_NAME, filename=None):
    if filename is None:
        filename = f"pdfs/{uuid.uuid4()}.pdf"

    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=filename,
        Body=pdf_bytes,
        ContentType='application/pdf',
        # ACL='public-read' 
    )

    presigned_url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': BUCKET_NAME, 'Key': filename},
        ExpiresIn=86400 
    )
    # file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{filename}"
    return presigned_url





def load_vectorstore_for_chat(s3_uri):
    BUCKET_NAME = os.getenv("AWS_S3_BUCKET")
    vs_dir = download_and_extract_vectorstore(s3_uri, BUCKET_NAME)
    return vs_dir





def genrate_notes(text):
    prompt = f"""
Generate well-structured study notes from the given text.

### Requirements:
- Keep meaning accurate.
- Use simple, easy language.
- Use **headings, bullet points, and short paragraphs**.
- Correct grammar and spelling.
- Make it visually clean and easy to revise.
- and this is not summarize notes it is long notes so make accordingly
### Text to summarise:
{text}

### Output:
Return **only the improved notes**, no explanation or extra comments .
"""
    
    model = genai.GenerativeModel("models/gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text.strip()






def get_links(text):
    try:
        # print(text)
        text = genrate_notes(text)
        # print(text)
        bytes = text_to_pdf_buffer(text)
        BUCKET_NAME = os.getenv("AWS_S3_BUCKET")
        pdf_url = upload_pdf_to_s3(bytes,BUCKET_NAME)
        # print(pdf_url)
        tmp_pdf_path = f"./uploadfiles/{uuid.uuid4()}.pdf"
        with open(tmp_pdf_path, "wb") as f:
            f.write(bytes)
        persist_dir = f"./vectorstores/{uuid.uuid4()}"
        # print(persist_dir)
        process_pdf_rag(tmp_pdf_path, persist_dir)
        vectorstore_uri = upload_vectorstore_to_s3(persist_dir, BUCKET_NAME)

        shutil.rmtree(persist_dir, ignore_errors=True)

        os.remove(tmp_pdf_path)

        return {
            "pdf_url": pdf_url,             
            "vectorstore": persist_dir    
        }, 200
    
    except Exception as e:
        print(e)
        return {"error":e}
    
