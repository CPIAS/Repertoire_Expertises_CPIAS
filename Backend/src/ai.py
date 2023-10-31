import os
import string
import spacy
from pathlib import Path
from typing import Optional
from flair.embeddings import TransformerDocumentEmbeddings
from keybert import KeyBERT
from langchain.llms import Ollama
from langchain.document_loaders import CSVLoader
from langchain.output_parsers import CommaSeparatedListOutputParser
from langchain.prompts import PromptTemplate
from langchain.embeddings import OllamaEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA, LLMChain
from langchain.schema import Document
from spacy import Language


class LLM:
    def __init__(self, qa_llm_model: str, keywords_llm_model: str, users_csv_file: Path):
        self.qa_llm_model: str = qa_llm_model
        self.users_csv_file: Path = users_csv_file
        self.qa_llm: Optional[Ollama] = None
        self.user_documents: Optional[list[Document]] = None
        self.qa_embeddings: Optional[OllamaEmbeddings] = None
        self.qa_vector_store: Optional[Chroma] = None
        self.qa_prompt: Optional[PromptTemplate] = None
        self.qa_chain: Optional[RetrievalQA] = None
        self.keywords_llm_model: str = keywords_llm_model
        self.keywords_embeddings: Optional[TransformerDocumentEmbeddings] = None
        self.keywords_model: Optional[KeyBERT] = None
        self.keywords_prompt: Optional[PromptTemplate] = None
        self.keywords_chain: Optional[LLMChain] = None
        self.nlp: Optional[Language] = None
        self.stop_words: Optional[list[str]] = None

    def __get_qa_llm(self, qa_llm_model: str, temperature: float = 0.0) -> Ollama:
        return Ollama(base_url='http://localhost:11434', model=qa_llm_model, temperature=temperature)

    def __get_user_documents(self, csv_file: Path) -> list[Document]:
        loader = CSVLoader(file_path=str(csv_file))
        return loader.load()

    def __get_qa_embeddings(self, qa_llm_model: str, temperature: float = 0.0) -> OllamaEmbeddings:
        return OllamaEmbeddings(base_url="http://localhost:11434", model=qa_llm_model, temperature=temperature)

    def __create_qa_vector_database(self,
                                    qa_embeddings: OllamaEmbeddings,
                                    user_documents: list[Document],
                                    persist_directory: str = "../vector_store"
                                    ) -> Chroma:
        if os.path.exists(persist_directory):
            vector_store = Chroma(embedding_function=qa_embeddings, persist_directory=persist_directory)
        else:
            vector_store = Chroma.from_documents(user_documents, qa_embeddings, persist_directory=persist_directory)
            vector_store.persist()

        return vector_store

    def __get_qa_prompt(self) -> PromptTemplate:
        prompt_template = '''Use the following pieces of context to answer the question at the end. \
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        {context}

        {question}
        '''

        return PromptTemplate(template=prompt_template, input_variables=["context", "question"])

    def __get_qa_chain(self,
                       qa_llm: Ollama,
                       qa_vector_store: Chroma,
                       qa_prompt: PromptTemplate,
                       chain_type: str = "stuff",
                       return_source_documents: bool = True
                       ) -> RetrievalQA:
        return RetrievalQA.from_chain_type(
            llm=qa_llm,
            retriever=qa_vector_store.as_retriever(search_type="mmr", search_kwargs={'k': 10, 'fetch_k': 20}),
            chain_type=chain_type,
            return_source_documents=return_source_documents,
            chain_type_kwargs={"prompt": qa_prompt}
        )

    def __get_keywords_embeddings(self, keywords_llm: str) -> TransformerDocumentEmbeddings:
        return TransformerDocumentEmbeddings(keywords_llm)

    def __get_keywords_model(self, keywords_embeddings: TransformerDocumentEmbeddings) -> KeyBERT:
        return KeyBERT(model=keywords_embeddings)

    def __get_keywords_prompt(self) -> PromptTemplate:
        prompt_template = """
                <s>
                [INST]
                I have the following document written in French that describes the skills of an expert:

                J'ai complété une maîtrise en santé publique à l'Université McGill en mai 2021, et je travaille depuis dans \
                le domaine de la télémédecine chez l'entreprise canadienne Dialogue. Je m'intéresse aux enjeux du numérique \
                dans le réseau de la santé, ainsi qu'à l'application de l'apprentissage machine et de l'IA dans \
                ces technologies.

                Based on the information above, extract the keywords that best describe the expert's skills.
                Make sure to only extract keywords that appear in the text.
                Make sure you to only return the keywords, separate them with commas and say nothing else.
                For example, don't say:
                "Here are the keywords present in the document"
                [/INST]
                santé publique, télémédecine, technologie numérique dans le réseau de santé, apprentissage machine, IA
                </s>
                [INST]
                I have the following document written in French that describes the skills of an expert:

                {document}

                Based on the information above, extract the keywords that best describe the expert's skills.
                Make sure to only extract keywords that appear in the text.
                Make sure you to only return the keywords, separate them with commas and say nothing else.
                For example, don't say:
                "Here are the keywords present in the document"
                [/INST]
        """
        return PromptTemplate(input_variables=["document"], template=prompt_template, parser=CommaSeparatedListOutputParser())

    def __get_keywords_chain(self, qa_llm: Ollama, keywords_prompt: PromptTemplate, ) -> LLMChain:
        return LLMChain(llm=qa_llm, prompt=keywords_prompt)

    def __get_nlp(self, model_name: str) -> Language:
        if not spacy.util.is_package(model_name):
            spacy.cli.download(model_name)
        return spacy.load(model_name)

    def __get_stop_words(self, nlp: Language) -> list[str]:
        return list(nlp.Defaults.stop_words) + [p for p in string.punctuation]

    def __remove_stop_words(self, documents: list[str]) -> list[str]:
        filtered_documents = []
        for doc in documents:
            tokenized_doc = self.nlp(doc)
            filtered_tokens = [token.text for token in tokenized_doc if token.text not in self.stop_words]
            filtered_documents.append(' '.join(filtered_tokens))
        return filtered_documents

    def __get_user_ids_from_llm_response(self, response: list[Document]) -> list[int]:
        user_ids = []

        for document in response:
            lines = document.page_content.split('\n')
            _, value = lines[0].split(': ', 1)
            if str.isnumeric(value):
                user_ids.append(int(value))

        return user_ids

    def __init_qa_chain(self) -> None:
        self.qa_llm = self.__get_qa_llm(self.qa_llm_model)
        self.user_documents = self.__get_user_documents(self.users_csv_file)
        self.qa_embeddings = self.__get_qa_embeddings(self.qa_llm_model)
        self.qa_vector_store = self.__create_qa_vector_database(self.qa_embeddings, self.user_documents)
        self.qa_prompt = self.__get_qa_prompt()
        self.qa_chain = self.__get_qa_chain(self.qa_llm, self.qa_vector_store, self.qa_prompt)

    def __init_keywords_chain(self) -> None:
        self.keywords_embeddings = self.__get_keywords_embeddings(self.keywords_llm_model)
        self.keywords_model = self.__get_keywords_model(self.keywords_embeddings)
        self.keywords_prompt = self.__get_keywords_prompt()
        self.keywords_chain = self.__get_keywords_chain(self.qa_llm, self.keywords_prompt)
        self.nlp = self.__get_nlp('fr_core_news_sm')
        self.stop_words = self.__get_stop_words(self.nlp)

    def init(self) -> None:
        self.__init_qa_chain()
        self.__init_keywords_chain()

    def get_user_recommendations(self, question: str) -> list[int]:
        response = self.qa_chain({"query": question})
        return self.__get_user_ids_from_llm_response(response['source_documents'])

    def get_keywords(self, text: str) -> list[str]:
        llm_keywords = self.keywords_chain.predict_and_parse(document=text).lstrip().split(', ')
        llm_keywords = [k.lower() for k in llm_keywords]
        candidate_keywords = self.__remove_stop_words(llm_keywords)
        keybert_keywords = self.keywords_model.extract_keywords(
            docs=text,
            candidates=candidate_keywords,
            stop_words=self.stop_words,
            keyphrase_ngram_range=(1, 4),
            top_n=5,
        )
        keybert_keywords = [k[0] for k in keybert_keywords]
        keywords = []
        for keybert_keyword in keybert_keywords:
            index = candidate_keywords.index(keybert_keyword)
            keywords.append(llm_keywords[index])
        return keywords
