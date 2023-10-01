import os
from langchain.llms import Ollama
from langchain.document_loaders import CSVLoader
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain.embeddings import OllamaEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from pydantic import BaseModel, Field


# Define output format
class SuggestedUser(BaseModel):
    user_id: str = Field(description="User ID who possess the expertise and skills required for the project.")
    summary: str = Field(description="A summary explaining why the suggested user is suitable for the project.")


# Init LLM model
llm = Ollama(base_url="http://localhost:11434", model="llama2", temperature=0)

# load csv file
loader = CSVLoader(file_path="../BD/expertise_extended_english.csv")
documents = loader.load()

# define embedding
embeddings = OllamaEmbeddings()

# create vector database from data
persist_directory = "vector_store"

if os.path.exists(persist_directory):
    vector_store = Chroma(embedding_function=embeddings, persist_directory=persist_directory)
else:
    vector_store = Chroma.from_documents(documents, embeddings, persist_directory=persist_directory)
    vector_store.persist()

# create QA chain
parser = PydanticOutputParser(pydantic_object=SuggestedUser, handle_parsing_errors=True,)

prompt_template = '''Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
{context}

{question}

{format_instructions}

Helpful Answer:
'''

prompt = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vector_store.as_retriever(search_type="mmr", search_kwargs={'k': 10, 'fetch_k': 20}),
    chain_type="stuff",
    return_source_documents=True,
    chain_type_kwargs={"prompt": prompt}
)

# answering questions
question = "I am working on a brain imaging health project and I need a web application as well as artificial intelligence capable of detecting brain tumors. Suggest the top 5 experts who can help me with this project."
answer = qa_chain({"query": question})
print(answer["query"])
print(answer["result"])
print(answer["source_documents"])
