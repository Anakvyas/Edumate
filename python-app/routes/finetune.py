import os, io, json, threading, queue, time, traceback, requests
from typing import List, Dict
from dotenv import load_dotenv
from flask import Blueprint, request, Response, jsonify
from PIL import Image

import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import torchvision.transforms.functional as TF

from transformers import VisionEncoderDecoderModel, TrOCRProcessor, get_linear_schedule_with_warmup
from torch.optim import AdamW
import boto3


load_dotenv()
AWS_REGION = os.getenv("AWS_REGION", "eu-north-1")
RUNPOD_API_KEY = os.getenv("RUNPOD_API_KEY")
RUNPOD_ENDPOINT_ID = os.getenv("RUNPOD_ENDPOINT_ID")

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=AWS_REGION
)

finetune = Blueprint("finetune", __name__)
progress_queues: Dict[str, "queue.Queue[str]"] = {}
trained_artifacts: Dict[str, str] = {}


use_gpu = os.getenv("USE_GPU", "false").lower() == "true"
device = "cuda" if use_gpu and torch.cuda.is_available() else "cpu"


def build_augment_pipeline(img_size=384):
    return transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomApply([transforms.RandomRotation(degrees=2)], p=0.25),
        transforms.RandomApply([transforms.RandomAffine(degrees=0, translate=(0.03,0.03),
                                                        scale=(0.97,1.03), shear=2)], p=0.35),
        transforms.RandomApply([transforms.GaussianBlur(kernel_size=3)], p=0.2),
        transforms.RandomApply([transforms.ColorJitter(contrast=0.2, brightness=0.1)], p=0.35),
        transforms.Lambda(lambda im: TF.adjust_sharpness(im, sharpness_factor=1.15)),
        transforms.Lambda(lambda im: im.convert("RGB")),
    ])

class TrOCRJsonDataset(Dataset):
    def __init__(self, items, processor, bucket=None, augment=True):
        self.items = items
        self.processor = processor
        self.bucket = bucket
        self.augment = augment
        self.aug = build_augment_pipeline() if augment else None

    def __len__(self): return len(self.items)

    def _load_image(self, key_or_path: str):
        if os.path.exists(key_or_path):
            return Image.open(key_or_path).convert("RGB")
        buf = io.BytesIO()
        s3.download_fileobj(self.bucket, key_or_path, buf)
        buf.seek(0)
        return Image.open(buf).convert("RGB")

    def __getitem__(self, idx):
        item = self.items[idx]
        img = self._load_image(item["s3ImageKey"])
        if self.aug: img = self.aug(img)
        pixel_values = self.processor(images=img, return_tensors="pt").pixel_values.squeeze(0)
        tokenized = self.processor.tokenizer(item["label"], padding="max_length",
                                             truncation=True, max_length=64, return_tensors="pt")
        labels = tokenized.input_ids.squeeze(0)
        pad_token_id = self.processor.tokenizer.pad_token_id
        labels = torch.where(labels == pad_token_id, torch.tensor(-100), labels)
        return {"pixel_values": pixel_values, "labels": labels}


def upload_folder_to_s3(local_folder, bucket, prefix):
    for root, _, files in os.walk(local_folder):
        for file in files:
            local_path = os.path.join(root, file)
            rel = os.path.relpath(local_path, local_folder)
            s3.upload_file(local_path, bucket, f"{prefix}/{rel}")



def train_job(job_id: str, dataset_list: List[Dict], bucket: str):
    q = progress_queues[job_id]

    def emit(t, p): q.put(json.dumps({"type": t, **p}))

    try:
        emit("status", {"message": f"Using {'GPU' if device == 'cuda' else 'CPU'}"})

        model_name = "microsoft/trocr-small-handwritten" if device == "cpu" else "microsoft/trocr-base-handwritten"
        processor = TrOCRProcessor.from_pretrained(model_name)
        model = VisionEncoderDecoderModel.from_pretrained(model_name).to(device)

        model.config.pad_token_id = processor.tokenizer.pad_token_id
        model.config.decoder_start_token_id = processor.tokenizer.bos_token_id
        model.config.decoder.vocab_size = processor.tokenizer.vocab_size

        ds = TrOCRJsonDataset(dataset_list, processor, bucket=bucket, augment=True)
        loader = DataLoader(ds, batch_size=1, shuffle=True, num_workers=0)

        # Phase 1
        emit("status", {"message": "Phase 1: Decoder Only"})
        for p in model.encoder.parameters(): p.requires_grad = False
        optimizer = AdamW([p for p in model.parameters() if p.requires_grad], lr=1e-5)
        steps_total = 2 * len(loader)
        scheduler = get_linear_schedule_with_warmup(optimizer, 0, steps_total)
        step = 0
        for epoch in range(2):
            for batch in loader:
                batch = {k: v.to(device) for k, v in batch.items()}
                loss = model(**batch).loss
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                scheduler.step()
                step += 1
                emit("progress", {"phase": 1, "epoch": epoch+1,
                                  "percent": int(step*100/steps_total), "loss": round(loss.item(),4)})

        # Phase 2
        emit("status", {"message": "Phase 2: Full Finetune"})
        for p in model.encoder.parameters(): p.requires_grad = True
        optimizer = AdamW(model.parameters(), lr=2e-6)
        steps_total = 2 * len(loader)
        scheduler = get_linear_schedule_with_warmup(optimizer, 0, steps_total)
        best_loss = float("inf")
        save_dir = f"./trocr_job_{job_id}"
        os.makedirs(save_dir, exist_ok=True)
        step = 0

        for epoch in range(2):
            for batch in loader:
                batch = {k: v.to(device) for k, v in batch.items()}
                loss = model(**batch).loss
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                scheduler.step()
                step += 1
                emit("progress", {"phase": 2, "epoch": epoch+1,
                                  "percent": int(step*100/steps_total), "loss": round(loss.item(),4)})
            if loss.item() < best_loss:
                best_loss = loss.item()
                model.save_pretrained(save_dir, max_shard_size="500MB")
                processor.save_pretrained(save_dir)

        emit("status", {"message": "Uploading model..."})
        upload_folder_to_s3(save_dir, bucket, f"trocr_models/{job_id}")
        trained_artifacts[job_id] = f"s3://{bucket}/trocr_models/{job_id}"
        emit("status", {"message": "Upload done"})
        emit("done", {"ok": True, "model_dir": trained_artifacts[job_id]})
    except Exception as exc:
        tb = traceback.format_exc()
        emit("error", {"ok": False, "error": str(exc), "trace": tb})
    finally:
        if not trained_artifacts.get(job_id):
            q.put(json.dumps({"type": "finished"}))



@finetune.route("/start_finetune", methods=["POST"])
def start_finetune():
    body = request.get_json(force=True)
    dataset = body.get("dataset", [])
    bucket = os.getenv("AWS_S3_BUCKET")
    if not dataset:
        return jsonify({"error": "dataset is empty"}), 400

    job_id = str(int(time.time() * 1000))

    if use_gpu and RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID:
        headers = {"Authorization": f"Bearer {RUNPOD_API_KEY}"}
        payload = {
            "input": {
                "task": "finetune",
                "job_id": job_id,
                "dataset": dataset,
                "bucket": bucket
            }
        }
        resp = requests.post(f"https://api.runpod.io/v2/{RUNPOD_ENDPOINT_ID}/run",
                             headers=headers, json=payload)
        return jsonify({"job_id": job_id, "device": "GPU", "runpod_response": resp.json()})

    progress_queues[job_id] = queue.Queue()
    threading.Thread(target=train_job, args=(job_id, dataset, bucket), daemon=True).start()
    return jsonify({"job_id": job_id, "device": device})


@finetune.route("/events/<job_id>")
def events(job_id):
    bucket = os.getenv("AWS_S3_BUCKET")
    key = f"progress/{job_id}.jsonl"

    if job_id in progress_queues:
        q = progress_queues[job_id]
        def stream():
            yield "retry: 1500\n\n"
            while True:
                try:
                    msg = q.get(timeout=1)
                    yield f"data: {msg}\n\n"
                    parsed = json.loads(msg)
                    if parsed.get("type") in ("done","error","finished"):
                        break
                except queue.Empty:
                    yield ":\n\n"
        return Response(stream(), mimetype="text/event-stream")

    # GPU RunPod path → poll S3
    def stream_gpu():
        last = ""
        yield "retry: 1500\n\n"
        while True:
            try:
                obj = s3.get_object(Bucket=bucket, Key=key)
                content = obj["Body"].read().decode()
                if content != last:
                    last = content
                    for line in content.strip().splitlines():
                        yield f"data: {line}\n\n"
                time.sleep(2)
            except s3.exceptions.NoSuchKey:
                yield ":\n\n"
                time.sleep(2)
    return Response(stream_gpu(), mimetype="text/event-stream")


@finetune.route("/result/<job_id>")
def result(job_id):
    p = trained_artifacts.get(job_id)
    return jsonify({"ready": p is not None, "model_dir": p})
