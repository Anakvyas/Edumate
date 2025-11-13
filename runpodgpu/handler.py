import torch
import time
from finetune_gpu import train_gpu
import runpod
from whisper_gpu import transcribe_local,transcribe_youtube
device = "cuda" if torch.cuda.is_available() else "cpu"


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def handler(event):
    """Main RunPod entrypoint."""
    task = event["input"].get("task", "")
    mode = event["input"].get("mode", "")
    log(f"🟢 Received RunPod task: {task or mode}")

    try:
        if task == "finetune":
            output = train_gpu(event["input"], device)
            return {"output": output}


        elif mode == "youtube" and event["input"].get("video"):
            pdf_link = transcribe_youtube(event["input"]["video"])
        elif mode == "file" and event["input"].get("path"):
            pdf_link = transcribe_local(event["input"]["path"])
        else:
            raise ValueError("Invalid input. Expected 'task' or 'mode'.")

        return {
            "output": {
                "pdf_link": pdf_link,
                "persist_dir": "vectorstore/demo"
            }
        }

    except Exception as e:
        log(f"❌ Error: {str(e)}")
        return {"error": str(e)}

runpod.serverless.start({"handler": handler})