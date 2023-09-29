from langchain.llms import Ollama
from langchain.document_loaders import CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OllamaEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA

llm = Ollama(base_url="http://localhost:11434", model="llama2")

# load csv file
loader = CSVLoader("../Server/resources/dummy_users.csv")
documents = loader.load()

# split documents
text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=0, separators=["\n"])
docs = text_splitter.split_documents(documents)

# define embedding
embeddings = OllamaEmbeddings()

# create vector database from data
vector_store = Chroma.from_documents(docs, embeddings)

# create QA chain
qa_chain = RetrievalQA.from_chain_type(llm, retriever=vector_store.as_retriever())

# answering questions
question = "Give me five users that can help me to develop a new web application?"
answer = qa_chain({"query": question})
print(answer)
