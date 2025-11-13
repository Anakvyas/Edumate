import runpod
import os
import time
import torch
import whisper
import yt_dlp
from moviepy.video.io.VideoFileClip import VideoFileClip
from helpers import get_links

device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("base")

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def transcribe_local(file_path):
    """Transcribe uploaded video file."""
    log("Extracting audio...")
    clip = VideoFileClip(file_path)
    clip.audio.write_audiofile(file_path + ".wav", logger=None)
    clip.close()

    log("Transcribing audio...")
    result = model.transcribe(file_path + ".wav")
    text = result["text"]

    os.remove(file_path)
    os.remove(file_path + ".wav")

    log("Generating PDF link...")
    pdf_link = get_links(text)
    log(f"Done! PDF link: {pdf_link}")
    return pdf_link

def transcribe_youtube(video_url):
    """Download and transcribe YouTube audio."""
    log("🎥 Downloading YouTube audio...")
    os.makedirs("audio", exist_ok=True)
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": "audio/audio",
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
        "quiet": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    log("Transcribing with Whisper...")
    result = model.transcribe("audio/audio.mp3")
    text = result["text"]
    os.remove("audio/audio.mp3")

    pdf_link = get_links(text)
    log(f"Done! PDF link: {pdf_link}")
    return pdf_link

