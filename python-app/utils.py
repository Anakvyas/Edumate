from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from chromadb.config import Settings
from prompts import summary_prompt, event_prompt, topic_prompt, project_prompt, quizquestion_prompt
from langchain_community.document_loaders import  PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import contextlib
import gc
import chromadb
import io
import os
import threading
from langchain_chroma import Chroma
from openrouter_client import prompt_completion
from sentence_transformers import SentenceTransformer


load_dotenv()
os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_embedding_lock = threading.Lock()
_embedding_model = None
_retriever_cache = {}


class QuietEmbeddings:
    def __init__(self, model):
        self.model = model

    def embed_documents(self, texts):
        return self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False).tolist()

    def embed_query(self, text):
        return self.model.encode(text, convert_to_numpy=True, show_progress_bar=False).tolist()


def get_embedding_model():
    global _embedding_model

    if _embedding_model is not None:
        return _embedding_model

    with _embedding_lock:
        if _embedding_model is None:
            buffer = io.StringIO()
            with contextlib.redirect_stdout(buffer), contextlib.redirect_stderr(buffer):
                sentence_model = SentenceTransformer(EMBEDDING_MODEL_NAME, device="cpu")
            _embedding_model = QuietEmbeddings(sentence_model)

    return _embedding_model

def generate_summary(transcript):
    prompt = summary_prompt.format(transcript=transcript)
    return prompt_completion(prompt, temperature=0.4)


def extract_events(transcript):
    prompt = event_prompt.format(transcript=transcript)
    events = prompt_completion(prompt, temperature=0.2)
    return events if events else "[]"





def process_pdf_rag(path, persist_dir):
    loader = PyPDFLoader(path, mode="single")
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(docs)

    embedding = get_embedding_model()

    client = chromadb.PersistentClient(
        path=persist_dir,
        settings=Settings(anonymized_telemetry=False)
    )

    vector_store = Chroma(
        client=client,
        collection_name="pdf_store",
        embedding_function=embedding,
        persist_directory=persist_dir
    )

    vector_store.add_documents(chunks)  

    del vector_store
    del client
    gc.collect()

    return "ok"


def load_vector_store(persist_dir):
    cached_retriever = _retriever_cache.get(persist_dir)
    if cached_retriever is not None:
        return cached_retriever

    embedding = get_embedding_model()

    client = chromadb.PersistentClient(
        path=persist_dir,
        settings=Settings(anonymized_telemetry=False)
    )

    vector_store = Chroma(
        client=client,
        collection_name="pdf_store",
        embedding_function=embedding,
        persist_directory=persist_dir
    )

    retriever = vector_store.as_retriever()
    _retriever_cache[persist_dir] = retriever
    return retriever

def load_all_chunks(persist_dir):
    client = chromadb.PersistentClient(
        path=persist_dir,
        settings=Settings(anonymized_telemetry=False)
    )

    collection = client.get_collection("pdf_store")
    data = collection.get(include=["documents"])

    return data["documents"] 


# embed_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# def cluster_chunks(chunks, k=6):
#     embeddings = embed_model.encode(chunks)
#     kmeans = KMeans(n_clusters=k, random_state=42).fit(embeddings)

#     clustered = {i: [] for i in range(k)}
#     for idx, label in enumerate(kmeans.labels_):
#         clustered[label].append(chunks[idx])

#     return clustered



def build_qa_chain(retriever):
    template = PromptTemplate(
        input_variables=["context", "question"],
        template="""
You are a knowledgeable assistant. Use ONLY the context below to answer.

Context:
{context}

Question:
{question}

Answer clearly in 2–4 sentences without adding external knowledge.
""",
    )
    
    class RetrievalQAChain:
        def __init__(self, active_retriever, prompt_template):
            self.retriever = active_retriever
            self.prompt_template = prompt_template

        def invoke(self, question):
            docs = self.retriever.invoke(question)
            context = "\n\n".join([doc.page_content for doc in docs])
            prompt = self.prompt_template.format(context=context, question=question)
            return prompt_completion(prompt, temperature=0.2)

    return RetrievalQAChain(retriever, template)



def get_topics(retriever):
    class TopicChain:
        def __init__(self, active_retriever):
            self.retriever = active_retriever

        def invoke(self, question):
            docs = self.retriever.invoke(question)
            context = "\n\n".join([doc.page_content for doc in docs])
            prompt = topic_prompt.format(context=context)
            return prompt_completion(prompt, temperature=0.4)

    return TopicChain(retriever)


def generate_streamlit_project(topic):
    prompt = project_prompt.format(topic=topic)
    return prompt_completion(prompt, temperature=0.4, timeout=180)

def  generate_question(prompt,content):
    final_prompt = quizquestion_prompt.format(prompt=prompt, content=content)
    return prompt_completion(final_prompt, temperature=0.4, timeout=180)
