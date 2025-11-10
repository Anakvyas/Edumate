from flask import Flask, request,jsonify,Blueprint
import os
import whisper
from moviepy.video.io.VideoFileClip import VideoFileClip
from helpers import genrate_notes, text_to_pdf_buffer, upload_pdf_to_s3,get_links
from pytube import YouTube
model = whisper.load_model("base")
video = Blueprint('video',__name__)
BUCKET_NAME = os.getenv("AWS_S3_BUCKET")
import yt_dlp

@video.route('/upload_video',methods=['POST'])
def upload_Video():
    try:
        video = request.files['video']
        print(video)
        if not video:
            return jsonify({"error": "No file part"}), 400
        
        file_path  = os.path.join('uploads', video.filename)
        video.save(file_path)
        video = VideoFileClip(file_path)
        video.audio.write_audiofile(file_path + ".wav")
        video.close() 
        os.remove(file_path)
        file_path += ".wav"

        result = model.transcribe(file_path)
        text = result["text"]
        os.remove(file_path)

        pdf_link = get_links(text)
        return jsonify({"pdflink":pdf_link}),200
    
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500  
    
@video.route('/upload_yt',methods=['POST'])
def upload_yt():
    try:
        req =  request.get_json()
        video = req.get('video') or ""
        print(video)
        os.makedirs("audio", exist_ok=True)
        ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': 'audio/audio',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True
    }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video])

        result = model.transcribe('audio/audio.mp3')
        text = result["text"]     
        pdf_link = get_links(text)
        os.remove('audio/audio.mp3')
        return jsonify({"pdflink":pdf_link}),200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500  



