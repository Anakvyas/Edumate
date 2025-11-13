from flask import Blueprint, request, jsonify, Response
import os, requests, threading, queue, time, torch, whisper, yt_dlp
from moviepy.video.io.VideoFileClip import VideoFileClip
from helpers import get_links

whisper_bp = Blueprint("whisper", __name__)

USE_GPU = os.getenv("USE_GPU", "false").lower() == "true"
RUNPOD_ENDPOINT = os.getenv("RUNPOD_ENDPOINT")
device = "cuda" if torch.cuda.is_available() and USE_GPU else "cpu"

model = whisper.load_model("base") if not USE_GPU else None

progress_queues = {}
results = {}  

def stream_event(job_id, event_type, message):
    q = progress_queues.get(job_id)
    if q:
        q.put(f"data: {message}\n\n")

def local_transcribe(file_path, job_id):
    try:
        stream_event(job_id, "status", "Extracting audio...")
        clip = VideoFileClip(file_path)
        clip.audio.write_audiofile(file_path + ".wav", logger=None)
        clip.close()
        os.remove(file_path)

        stream_event(job_id, "status", "Transcribing using Whisper...")
        result = model.transcribe(file_path + ".wav")
        text = result["text"]
        os.remove(file_path + ".wav")

        stream_event(job_id, "status", "Generating PDF link...")
        pdf_link = get_links(text)

        results[job_id] = {"pdf_link": pdf_link, "persist_dir": "vectorstore/demo"}
        stream_event(job_id, "done", f"Completed Link: {pdf_link}")
        return pdf_link
    except Exception as e:
        stream_event(job_id, "error", f"Error: {str(e)}")
        return None

def offload_to_gpu(video_type, input_value, job_id):
    try:
        stream_event(job_id, "status", "Sending job to GPU RunPod...")
        payload = {"input": {"mode": video_type, "video": input_value if video_type == "youtube" else None, "path": input_value if video_type == "file" else None}}
        res = requests.post(f"{RUNPOD_ENDPOINT}/run", json=payload, timeout=900)
        res_json = res.json()

        if "output" in res_json:
            pdf_link = res_json["output"].get("pdf_link")
            persist_dir = res_json["output"].get("persist_dir")
            results[job_id] = {"pdf_link": pdf_link, "persist_dir": persist_dir}
            stream_event(job_id, "done", f"Completed GPU link: {pdf_link}")
            return pdf_link
        else:
            raise Exception(res_json.get("error", "GPU error"))
    except Exception as e:
        stream_event(job_id, "error", f"GPU offload failed: {e}")
        return None

@whisper_bp.route("/upload_video", methods=["POST"])
def upload_video():
    try:
        video_file = request.files.get("video")
        if not video_file:
            return jsonify({"error": "No file uploaded"}), 400

        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", video_file.filename)
        video_file.save(file_path)

        job_id = str(int(time.time() * 1000))
        progress_queues[job_id] = queue.Queue()

        def task():
            link = None
            if USE_GPU and RUNPOD_ENDPOINT:
                link = offload_to_gpu("file", file_path, job_id)
            if not link:
                local_transcribe(file_path, job_id)

        threading.Thread(target=task, daemon=True).start()
        return jsonify({"job_id": job_id, "device": device})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@whisper_bp.route("/upload_yt", methods=["POST"])
def upload_yt():
    try:
        req = request.get_json(force=True)
        url = req.get("video")
        if not url:
            return jsonify({"error": "Missing YouTube URL"}), 400

        job_id = str(int(time.time() * 1000))
        progress_queues[job_id] = queue.Queue()

        def task():
            link = None
            if USE_GPU and RUNPOD_ENDPOINT:
                link = offload_to_gpu("youtube", url, job_id)
            if not link:
                stream_event(job_id, "status", "Downloading YouTube audio...")
                os.makedirs("audio", exist_ok=True)
                audio_path = "audio/audio.mp3"
                ydl_opts = {
                    "format": "bestaudio/best",
                    "outtmpl": audio_path.replace(".mp3", ""),
                    "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}],
                    "quiet": True,
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([url])

                stream_event(job_id, "status", "Transcribing locally...")
                result = model.transcribe(audio_path)
                text = result["text"]
                os.remove(audio_path)
                pdf_link = get_links(text)
                results[job_id] = {"pdf_link": pdf_link, "persist_dir": "vectorstore/demo"}
                stream_event(job_id, "done", f"Completed: {pdf_link}")

        threading.Thread(target=task, daemon=True).start()
        return jsonify({"job_id": job_id, "device": device})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@whisper_bp.route("/get_result/<job_id>", methods=["GET"])
def get_result(job_id):
    if job_id not in results:
        return jsonify({"status": "processing"}), 202
    return jsonify(results[job_id]), 200
