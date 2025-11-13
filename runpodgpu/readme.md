# RunPod Whisper + Fine-tune Handler

This serverless handler performs:
- Whisper transcription for video or YouTube links
- Optional fine-tune tasks on GPU

**Run Command:**
```bash
curl -X POST https://api.runpod.io/v2/<ENDPOINT_ID>/run \
  -H "Content-Type: application/json" \
  -d '{"input":{"mode":"youtube","video":"https://youtu.be/abc123"}}'

Runpod Whisper Finetune

Unified Whisper transcription and fine-tuning endpoint using GPU acceleration.

[![Runpod](https://api.runpod.io/badge/Anakvyas/Runpod_whisper_finetune)](https://console.runpod.io/hub/Anakvyas/Runpod_whisper_finetune)
