from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from utils import build_qa_chain, generate_streamlit_project,  generate_question, generate_summary, extract_events, get_topics, load_vector_store, process_pdf_rag
from helpers import  clean_and_parse_json,clean_content
from ocr import extract_pdf,run_vision
from routes.video import video
from routes.email import email
from routes.uplaod_pdf import uplaodpdf
from routes.pdf_comp import pdf_comp
app = Flask(__name__)
CORS(app) 

app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024 
app.register_blueprint(video)
app.register_blueprint(email)
app.register_blueprint(uplaodpdf)
app.register_blueprint(pdf_comp)


# genrate ppt
@app.route('/generate_questions',methods=['POST'])
def generate_ques():
    try:
        req = request.get_json()
        prompt = req.get('prompt') or ""
        key = req.get("key") or ""
        bucket = req.get("bucket") or ""
        # print(prompt)

        if(key == ""):
            question =  generate_question(prompt,"no content")
            question =  clean_and_parse_json(question)
            return jsonify({
            "status": "success",
            "questions":question,
            }), 200
        

        content =  extract_pdf(bucket,key)
        content = clean_content(content)
        question =  generate_question(prompt,content)
        question =  clean_and_parse_json(question)
        return jsonify({
            "status": "success",
            "questions":question,
        }), 200

    except Exception as e:
        print(e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
@app.route('/vision_ocr',methods=['POST'])
def vision_ocr():
    try:
        req =  request.get_json()
        key =  req.get('key') or " "
        bucket =  req.get('bucket') or ""
        userID = req.get("userID") or ""

        if key == " " or bucket == " ":
            return jsonify({"status":"error"}),400
        
        url = run_vision(bucket,key)

        print(url)

        return jsonify({"url":url}),200
        
    except Exception as e:
        print(e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


    
if __name__ == '__main__':
    app.run(debug=True)
