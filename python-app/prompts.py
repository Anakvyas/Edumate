from langchain_core.prompts import PromptTemplate

event_prompt = PromptTemplate(
    input_variables=["transcript"],
    template="""
        You are an expert AI assistant. From the following transcript, extract all **events, meetings, appointments, or planned future activities**.  

        Instructions:
        1. List each event or meeting separately.
        2. Include relevant details like date, time, participants, and purpose, if mentioned.
        3. Ignore past events or discussions that are not scheduled.
        4. Present the output as a **numbered list**.
        5. If no future events are mentioned, return an **empty list: []**.

        Transcript:
        {transcript}

        Provide the extracted events in the specified list format.

    """

)

summary_prompt = PromptTemplate(
    input_variables=["transcript"],
    template="""
        You are an expert AI assistant. Read the following transcript carefully and generate a clear, concise, and accurate summary. 
        Your summary should:
        1. Capture all important points and key details.
        2. Explain the context and reasoning behind each point.
        3. Be easy to understand for someone who has not seen the transcript.
        4. Avoid irrelevant information.
        5. Keep it crisp but informative.

        Transcript:
        {transcript}

        Provide the summary in a structured, coherent format.
        """
)


topic_prompt = PromptTemplate(
    input_variables=["context"],
    template="""
You are a **project idea extractor** and technical consultant.

Analyze the following text carefully.
Identify **simple, easy-to-build, actionable project ideas** that someone could implement
with beginner-to-intermediate coding skills.

For each idea:
- It must be **practical and buildable** (small apps, prototypes, data analysis, ML demos, dashboards).
- Include the **exact main technologies, frameworks, or libraries** needed (e.g., LangChain, HuggingFace Transformers, Streamlit, Flask, scikit-learn, Pandas, Matplotlib).
- Prefer **tools and libraries that can be installed via pip** and are easy to use.
- Avoid complex enterprise systems or research-level projects that require advanced setup.
- Avoid vague items like "Introduction", "Overview", "Study of ...".
- Keep each idea short (max ~15 words).
- give project that is build by any llm easily 

**IMPORTANT:** Only return projects that are **realistically easy to build with the given text and common Python tools**.  
If the text does not provide enough info to suggest a simple project, return an empty JSON list.

Return ONLY a valid JSON array of strings (no explanations, no code fences). For example:

[
  "Simple PDF Q&A chatbot (LangChain + Chroma + Streamlit + OpenAI)",
  "Text summarizer for lecture notes (HuggingFace Transformers + Python)",
  "Data visualization dashboard for NLP datasets (Pandas + Plotly Dash)",
  "Topic extraction tool from PDF (LangChain + HuggingFace embeddings + FAISS)"
]

Text:
{context}
"""
)

project_prompt = PromptTemplate(
    input_variables=["topic"],
    template="""
You are an expert Python & AI developer.

Create a **complete AI project** about the topic: **{topic}**.

The project must contain exactly these files:

1. **train.py** — a full training script with:
   - Download or load a small dataset automatically (e.g., CIFAR-10, MNIST, IMDB).
   - Use a **pretrained model** (from torchvision or Hugging Face).
   - Finetune the model on the dataset.
   - Save the trained weights to a file (e.g., `model.pth`).
   - Add **clear comments on each important line** to help beginners understand.

2. **app.py** — a simple **Streamlit** application:
   - Load the trained model (or pretrained if weights not found).
   - Let the user upload an input (image or text depending on the topic).
   - Run prediction and display result.
   - Import reusable functions from `helper.py`.

3. **helper.py** — helper functions:
   - Functions to load model, preprocess input, run inference, etc.
   - Keep functions short and commented.

4. **requirements.txt** — only include packages actually needed to run the project.

5. **README.md** — must include:
   - Short project description.
   - How to create and activate a virtual environment.
   - Command to install requirements.
   - Command to train the model (`python train.py`).
   - Command to run the app (`streamlit run app.py`).
   - File structure tree like:
     ```
     project/
     ├── train.py
     ├── app.py
     ├── helper.py
     ├── requirements.txt
     └── README.md
     ```

**Important Rules:**
- The code must be **runnable by a beginner** with minimal setup.
- Use only **pip-installable** packages.
- If dataset is large, download a small subset automatically.
- Add **inline comments** in `train.py` and `helper.py` so readers understand each step.
- Return ONLY a valid JSON object with keys: `train`, `app`, `helper`, `requirements`, `readme`.
- Do not include markdown code fences or any extra explanation outside the JSON.
- The code must run with `python train.py` to train and `streamlit run app.py` to run the app.

Example of correct JSON output:
{{
  "train.py": "...contents of train.py...",
  "app.py": "...contents of app.py...",
  "helper.py": "...contents of helper.py...",
  "requirements.txt": "streamlit\\ntorch\\ntorchvision\\npillow",
  "readme.md": "# My Project\\n\\n## Setup\\npython -m venv venv\\nsource venv/bin/activate..."
}}
"""
)

suggestion_prompt = PromptTemplate(
    input_variables = ["title "],
    template = ''' 
    User typed title: **{title}**

Suggest 6 related PowerPoint topics.
Return only a bullet list. Keep each topic short and meaningful.
Do not repeat user's text exactly, but keep the same subject domain.
return an list of topics.
'''
)

quizquestion_prompt = PromptTemplate(
    input_variables=["prompt","content"],
    template='''
You are an intelligent Quiz Question Generator AI.

You will generate quiz questions only from the provided content.  
Do not include any information that is not in the content.

PROMPT / REQUIREMENT:
{prompt}

SOURCE CONTENT:
{content}

OUTPUT INSTRUCTIONS:
- Output MUST BE VALID JSON only.
- Follow this exact schema for every question:
- if there is no content then generate on your basic topic  question and conceptual
{{
  "questionText": "string - clear MCQ question",
  "answers": [
   {{ "option": "string", "label": "A" }},
    {{ "option": "string", "label": "B" }},
    {{ "option": "string", "label": "C" }},
    {{ "option": "string", "label": "D" }}
  ],
  "correctAnswer": "A/B/C/D only",
  "choosenAnswer": "",
  "explanation": "string - short explanation"
}}

RESPONSE FORMAT:
{{
  "questions": [ ...array of questions in above schema... ]
}}

ADDITIONAL RULES:
- Do NOT repeat identical questions.
- Shuffle correct answer positions randomly.
- Keep explanations short and factual.
- Ensure all answers are taken from content.
- If content doesn't have enough information, generate fewer high-quality questions.
- generate conceptual questions hard level

Now produce the final JSON output ONLY.
    '''
)