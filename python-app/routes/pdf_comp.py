from flask import Flask, request,jsonify,Blueprint
from groq import Groq
import os
from dotenv import load_dotenv
from utils import load_vector_store
from helpers import clean_and_parse_json

pdf_comp = Blueprint('pdf_comp', __name__)
load_dotenv()
client =  Groq(api_key=os.getenv("GROP_API_KEY"))

def ask_groq(question, context):
    prompt = f"""
   Use the PDF context to answer. 
    If answer is not present, say: "The answer is not in the PDF."

    Context:
    {context}

    Question:
    {question}

    Answer clearly and simply.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return response.choices[0].message.content

@pdf_comp.route('/askquestion',methods=['POST'])
def generate_ques():
    try:
        req = request.get_json()
        question = req.get('question') or ""
        persist_dir = req.get("store") or ""

        if(persist_dir == ""):
            return jsonify({"message":"persist_dir is required"}), 400
        
        retriever = load_vector_store(persist_dir)
        docs = retriever.invoke(question)
        context = "\n\n".join([d.page_content for d in docs])
        answer = ask_groq(question,context)
        answer =  clean_and_parse_json(answer)
        return jsonify({"answer":answer}),200
    except Exception as e:
        print(e)
        return jsonify({"message": str(e)}), 500