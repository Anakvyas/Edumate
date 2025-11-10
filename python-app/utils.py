from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import os
from chromadb.config import Settings
from prompts import summary_prompt, event_prompt, topic_prompt,project_prompt,suggestion_prompt,quizquestion_prompt
from langchain_community.document_loaders import  PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
import gc
import chromadb
from langchain_chroma import Chroma


load_dotenv()
key = os.getenv("GEMINI_API_KEY")


llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.0-flash",
    temperature=0.7,
    google_api_key=key,
)


summary_chain = summary_prompt | llm
event_chain = event_prompt | llm
generate_project = project_prompt | llm
generate_sugg = suggestion_prompt | llm
generate_ques = quizquestion_prompt | llm

def generate_summary(transcript):
    result = summary_chain.invoke({"transcript": transcript})
    summary = result["text"] 
    return summary


def extract_events(transcript):
    result = event_chain.invoke({"transcript": transcript})
    events = result["text"]
    return events if events else "[]"


def process_pdf_rag(path, persist_dir):
    loader = PyPDFLoader(path, mode="single")
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(docs)

    embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

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
    embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

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
    
    return vector_store.as_retriever()



def build_qa_chain(retriever):
    prompt = PromptTemplate(
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

    qa_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return qa_chain



def get_topics(retriever):
    qa_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | topic_prompt
        | llm
        | StrOutputParser()
    )
    return qa_chain


def generate_streamlit_project(topic):
    result = generate_project.invoke({"topic":topic})
    # print(result)
    res = result["text"]
    return res

def  generate_question(prompt,content):
    result = generate_ques.invoke({"prompt":prompt,"content":content})
    # print(result)
    res = result["text"]
    return res