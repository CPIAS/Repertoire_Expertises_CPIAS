import os
from pathlib import Path
from langchain.llms import Ollama
from langchain.document_loaders import CSVLoader
from langchain.prompts import PromptTemplate
from langchain.embeddings import OllamaEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.schema import Document


class LLM:
    def __init__(self, database: Path):
        self.database = database
        self.qa_chain = None

    def init(self):
        # Init LLM model
        llm = Ollama(base_url="http://localhost:11434", model="llama2:7b-chat-q4_0", temperature=0.1)

        # load csv file
        loader = CSVLoader(file_path=str(self.database))
        documents = loader.load()

        # define embedding
        embeddings = OllamaEmbeddings(base_url="http://localhost:11434", model="llama2:7b-chat-q4_0", temperature=0.1)

        # create vector database from raw_data
        persist_directory = "../vector_store"

        if os.path.exists(persist_directory):
            vector_store = Chroma(embedding_function=embeddings, persist_directory=persist_directory)
        else:
            vector_store = Chroma.from_documents(documents, embeddings, persist_directory=persist_directory)
            vector_store.persist()

        # create QA chain
        prompt_template = '''Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
        {context}

        {question}
        '''

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )

        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=vector_store.as_retriever(search_type="mmr", search_kwargs={'k': 10, 'fetch_k': 20}),
            chain_type="stuff",
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )

    def __get_user_ids_from_llm_response(self, response: list[Document]):
        user_ids = []

        for document in response:
            lines = document.page_content.split('\n')
            _, value = lines[0].split(': ', 1)
            if str.isnumeric(value):
                user_ids.append(int(value))

        return user_ids

    def query(self, question: str):
        response = self.qa_chain({"query": question})
        return self.__get_user_ids_from_llm_response(response['source_documents'])
