# Edumate

Edumate is a study assistant project with a Next.js frontend and a Flask backend.

It helps with:
- PDF notes extraction
- Handwritten PDF OCR with Google Vision
- Personalized handwriting fine-tuning
- Video transcription and notes generation
- Email summarization and drafting
- Quiz generation
- PPT and project generation

Live frontend:
- `https://edumate-w2l7.vercel.app/home`

## Project Structure

```text
Edumate/
├── my-app/        # Next.js frontend
├── python-app/    # Flask backend
└── README.md
```

## Main Features

- `PDF Notes Extractor`
  Turns typed PDFs into structured notes and opens a PDF study viewer.

- `Handwritten Notes OCR`
  Uses Google Vision to read handwritten PDFs and keeps a raw OCR preview.

- `Personalized Handwriting Mode`
  Lets users upload handwriting samples, fine-tune a handwriting model on CPU, and use that model later on handwritten PDFs.

- `Video Transcriber`
  Accepts local video or YouTube input, transcribes it, and generates notes.

- `Email Summarizer`
  Summarizes selected email content, drafts replies, and extracts events.

- `Quiz / Assignment / PPT / Project Tools`
  Generates study material from user prompts or extracted PDF content.

## Tech Stack

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- MongoDB via Mongoose

Backend:
- Flask
- Python
- OpenRouter
- Google Vision API
- Whisper
- ChromaDB
- Sentence Transformers
- Hugging Face Transformers

Storage and Infra:
- AWS S3
- MongoDB
- Redis optional cache

## Requirements

Recommended local environment:
- Node.js 18+
- Python 3.11+ or 3.13
- npm
- MongoDB connection string
- AWS S3 bucket and credentials
- OpenRouter API key
- Google Vision service-account JSON

Optional but useful:
- Redis
- ffmpeg
- Tesseract

## Frontend Setup

1. Go to the frontend app:

```bash
cd my-app
```

2. Install dependencies:

```bash
npm install
```

3. Create `my-app/.env` and add the required variables:

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:5000
MONGO_URL=your_mongodb_connection_string

AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=your_bucket_name

MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
CALLBACK_URL=your_callback_url
SCOPES=your_microsoft_scopes

Next_GROP_API_KEY=your_groq_api_key_if_you_still_use_generate_pro_route
```

4. Start the frontend:

```bash
npm run dev
```

Frontend default URL:
- `http://localhost:3000`

## Backend Setup

1. Go to the backend app:

```bash
cd python-app
```

2. Create and activate a virtual environment:

```bash
python3 -m venv myvenv
source myvenv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `python-app/.env` and add:

```env
OPENROUTER_API_KEY=your_openrouter_api_key

AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=eu-north-1
AWS_S3_BUCKET=your_bucket_name

HANDWRITING_OCR_PROVIDER=google_vision
GOOGLE_VISION_CREDENTIALS_PATH=../fourth-amp-476617-j8-f7a43bf7a0c0.json

TESSERACT_CMD=/opt/homebrew/bin/tesseract
OPENROUTER_MODEL=stepfun/step-3.5-flash:free

REDIS_URL=redis://localhost:6379/0
```

5. Start the Flask backend:

```bash
python app.py
```

Backend default URL:
- `http://127.0.0.1:5000`

## Google Vision Setup

The handwritten OCR flow now uses Google Vision.

1. Create a Google Cloud project.
2. Enable the Vision API.
3. Create a service account with Vision access.
4. Download the JSON key file.
5. Place it in the repo root or set an absolute path.
6. Point `GOOGLE_VISION_CREDENTIALS_PATH` in `python-app/.env` to that file.

Example:

```env
GOOGLE_VISION_CREDENTIALS_PATH=../fourth-amp-476617-j8-f7a43bf7a0c0.json
```

## AWS S3 Setup

This project stores uploaded files and generated assets in S3.

Make sure your bucket is configured and your credentials allow:
- `PutObject`
- `GetObject`
- `ListBucket`

Used for:
- uploaded PDFs
- uploaded handwriting samples
- generated PDF notes
- vectorstore uploads

## Redis Cache

Redis is optional.

If `REDIS_URL` is configured, the backend can cache:
- OpenRouter responses
- generated job results

If Redis is not available, the backend still runs and falls back safely.

## Tesseract and ffmpeg

These are not the main handwritten OCR engine anymore, but they may still help in other routes.

Install on macOS:

```bash
brew install tesseract
brew install ffmpeg
```

## Personalized Handwriting Fine-Tuning

The handwritten section includes a personalized mode.

Flow:
1. Open `My Handwriting Mode (Personalized)`.
2. Upload handwriting images matching the provided sample texts.
3. Start fast CPU fine-tuning.
4. Wait for training to complete.
5. The trained model will appear beside the Google Vision option.
6. Use or delete the model from the handwritten screen.

Notes:
- training is CPU-only
- models are saved locally under `python-app/trained_models/`
- trained model metadata is tracked in `python-app/trained_models/registry.json`

## How To Run Everything

Open two terminals.

Terminal 1:

```bash
cd python-app
source myvenv/bin/activate
python app.py
```

Terminal 2:

```bash
cd my-app
npm install
npm run dev
```

Then open:
- `http://localhost:3000`

## Important Routes

Backend routes:
- `/upload_pdf`
- `/vision_ocr`
- `/upload_video`
- `/upload_yt`
- `/get_result/<job_id>`
- `/start_finetune`
- `/events/<job_id>`
- `/result/<job_id>`
- `/models`
- `/models/<model_id>`
- `/ocr_with_model`

Frontend pages:
- `/home`
- `/pdfNotesExtractor`
- `/handwrittenpdfnotes`
- `/VideoTranscriber`
- `/EmailSummarizer`
- `/quizgenerator`
- `/pptgenerator`
- `/generate_pro`

## Troubleshooting

### Handwritten OCR not working

Check:
- Google Vision credentials file path is correct
- Vision API is enabled
- backend was restarted after `.env` changes

### Fine-tuning fails

Check:
- enough handwriting samples were uploaded
- backend can access `python-app/trained_models/`
- the local Hugging Face cache is available

### YouTube/video processing fails

Check:
- `ffmpeg` is installed
- internet access is available for YouTube fetch

### PDF viewer opens but tools fail

Check:
- MongoDB is connected
- S3 uploads are working
- vectorstore generation finished successfully

## Security Notes

Do not commit:
- `.env` files
- AWS credentials
- OpenRouter keys
- Google service-account JSON files
- trained private model artifacts if they contain user-specific data

If any secret was already committed or shared, rotate it.

## Development Notes

- Handwritten OCR uses Google Vision only.
- Handwritten PDF output is cleaned into organized notes, while raw OCR preview is still preserved.
- Personalized handwriting models can be trained, listed, used, and deleted from the UI.
- OpenRouter is used for text-generation tasks such as refinement and notes generation.

## Validation Commands

Frontend typecheck:

```bash
cd my-app
./node_modules/.bin/tsc --noEmit
```

Backend syntax check:

```bash
python3 -m py_compile python-app/app.py python-app/ocr.py python-app/routes/*.py
```
