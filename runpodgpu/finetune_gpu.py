import os, io, json, time, boto3, torch
from PIL import Image
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from transformers import VisionEncoderDecoderModel, TrOCRProcessor, get_linear_schedule_with_warmup
from torch.optim import AdamW
from dotenv import load_dotenv
load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "eu-north-1")
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "eu-north-1")
)

def emit_to_s3(bucket, job_id, data):
    """Append training progress to S3 JSONL file."""
    key = f"progress/{job_id}.jsonl"
    old = ""
    try:
        obj = s3.get_object(Bucket=bucket, Key=key)
        old = obj["Body"].read().decode()
    except s3.exceptions.NoSuchKey:
        old = ""
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=(old + json.dumps(data) + "\n").encode("utf-8"),
        ContentType="text/plain",
    )


class TrOCRJsonDataset(Dataset):
    def __init__(self, items, processor, bucket):
        self.items = items
        self.processor = processor
        self.bucket = bucket

    def __len__(self): 
        return len(self.items)

    def __getitem__(self, idx):
        item = self.items[idx]
        buf = io.BytesIO()
        s3.download_fileobj(self.bucket, item["s3ImageKey"], buf)
        buf.seek(0)
        img = Image.open(buf).convert("RGB")
        pixel_values = self.processor(images=img, return_tensors="pt").pixel_values.squeeze(0)

        tokenized = self.processor.tokenizer(
            item["label"],
            padding="max_length",
            truncation=True,
            max_length=64,
            return_tensors="pt"
        )
        labels = tokenized.input_ids.squeeze(0)
        pad_token_id = self.processor.tokenizer.pad_token_id
        labels = torch.where(labels == pad_token_id, torch.tensor(-100), labels)

        return {"pixel_values": pixel_values, "labels": labels}


def upload_folder_to_s3(local_folder, bucket, prefix):
    for root, _, files in os.walk(local_folder):
        for f in files:
            path = os.path.join(root, f)
            rel = os.path.relpath(path, local_folder)
            s3.upload_file(path, bucket, f"{prefix}/{rel}")

def train_gpu(data, device):
    dataset_list = data["dataset"]
    bucket = data["bucket"]
    job_id = data["job_id"]

    ds_size = len(dataset_list)
    emit_to_s3(bucket, job_id, {"type": "status", "message": f"Starting GPU fine-tune (dataset size={ds_size})"})

   
    model_name = "microsoft/trocr-base-handwritten"
    processor = TrOCRProcessor.from_pretrained(model_name)
    model = VisionEncoderDecoderModel.from_pretrained(model_name).to(device)

    ds = TrOCRJsonDataset(dataset_list, processor, bucket)
    loader = DataLoader(ds, batch_size=1, shuffle=True)

    if ds_size < 10000:
        two_phase = True
        emit_to_s3(bucket, job_id, {"type": "status", "message": "Small dataset detected — using 2-phase fine-tune"})
    else:
        two_phase = False
        emit_to_s3(bucket, job_id, {"type": "status", "message": "Large dataset detected — full fine-tune from start"})

    best_loss = float("inf")
    save_dir = f"./trocr_job_{job_id}"
    os.makedirs(save_dir, exist_ok=True)

    if two_phase:
        for p in model.encoder.parameters():
            p.requires_grad = False

        optimizer = AdamW([p for p in model.parameters() if p.requires_grad], lr=1e-5)
        scheduler = get_linear_schedule_with_warmup(optimizer, 0, 2 * len(loader))
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
                emit_to_s3(bucket, job_id, {
                    "type": "progress",
                    "phase": 1,
                    "epoch": epoch + 1,
                    "percent": int(step * 100 / (2 * len(loader))),
                    "loss": round(loss.item(), 4)
                })

    for p in model.encoder.parameters():
        p.requires_grad = True

    lr = 2e-6 if two_phase else 1e-5
    optimizer = AdamW(model.parameters(), lr=lr)
    scheduler = get_linear_schedule_with_warmup(optimizer, 0, 2 * len(loader))
    step = 0

    emit_to_s3(bucket, job_id, {"type": "status", "message": "Phase 2: Full Fine-tune (unfrozen encoder)"})
    for epoch in range(2):
        for batch in loader:
            batch = {k: v.to(device) for k, v in batch.items()}
            loss = model(**batch).loss
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            scheduler.step()
            step += 1
            emit_to_s3(bucket, job_id, {
                "type": "progress",
                "phase": 2,
                "epoch": epoch + 1,
                "percent": int(step * 100 / (2 * len(loader))),
                "loss": round(loss.item(), 4)
            })

        if loss.item() < best_loss:
            best_loss = loss.item()
            model.save_pretrained(save_dir, max_shard_size="500MB")
            processor.save_pretrained(save_dir)
            emit_to_s3(bucket, job_id, {"type": "status", "message": f"Saved checkpoint (loss={best_loss:.4f})"})


    upload_folder_to_s3(save_dir, bucket, f"trocr_models/{job_id}")
    emit_to_s3(bucket, job_id, {
        "type": "done",
        "message": "Upload complete",
        "model_dir": f"s3://{bucket}/trocr_models/{job_id}"
    })

    return {"ok": True, "model_dir": f"s3://{bucket}/trocr_models/{job_id}"}
