import csv
import json
import string
import time
import chromadb
import spacy
import zmq
from logging import Logger
from typing import Optional, Literal, List, Any
from chromadb import ClientAPI
from chromadb.api.models import Collection
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from deep_translator import GoogleTranslator
from flair.embeddings import TransformerDocumentEmbeddings
from keybert import KeyBERT
from langchain.chains import LLMChain
from langchain.embeddings import OllamaEmbeddings
from langchain.llms import Ollama
from langchain.output_parsers import CommaSeparatedListOutputParser, PydanticOutputParser
from langchain.prompts import FewShotPromptTemplate
from langchain.prompts.prompt import PromptTemplate
from langchain.schema import Document, OutputParserException
from spacy import Language
from zmq import Socket, Context
from settings import SERVER_SETTINGS
from ai_models import Experts


class LLM:
    def __init__(self, app_logger: Logger):
        self.app_logger = app_logger
        self.expert_recommendation_llm: Optional[Ollama] = None
        self.expert_information: Optional[tuple[list[str], list[str]]] = None
        self.expert_recommendation_embeddings: Optional[OllamaEmbeddings] = None
        self.expert_recommendation_chroma_db_client: Optional[ClientAPI] = None
        self.expert_recommendation_vector_store: Optional[Collection] = None
        self.expert_recommendation_parser: Optional[PydanticOutputParser] = None
        self.expert_recommendation_prompt: Optional[FewShotPromptTemplate] = None
        self.keywords_embeddings: Optional[TransformerDocumentEmbeddings] = None
        self.keywords_model: Optional[KeyBERT] = None
        self.keywords_parser: Optional[CommaSeparatedListOutputParser] = None
        self.keywords_prompt: Optional[PromptTemplate] = None
        self.keywords_chain: Optional[LLMChain] = None
        self.nlp_fr: Optional[Language] = None
        self.nlp_en: Optional[Language] = None
        self.stop_words_fr: Optional[list[str]] = None
        self.is_available: bool = False
        self.context: Optional[Context] = None
        self.socket: Optional[Socket] = None

    ###################################################################################################################
    #                                                 PRIVATE METHODS                                                 #
    ###################################################################################################################

    @staticmethod
    def __get_expert_recommendation_llm(expert_recommendation_llm_model: str, temperature: float = 0.0) -> Ollama:
        """
            Get an instance of the Ollama class for expert recommendation using the LLM model.

            Parameters:
                expert_recommendation_llm_model (str): The name or identifier of the LLM model for expert recommendation.
                temperature (float): The temperature parameter for controlling randomness (default: 0.0).

            Returns:
                Ollama: An instance of the Ollama class configured for expert recommendation with the specified LLM model.
        """

        return Ollama(base_url='http://localhost:11434', model=expert_recommendation_llm_model, temperature=temperature)

    @staticmethod
    def __get_expert_skills_from_csv(csv_file_path: str) -> tuple[list[str], list[str]]:
        """
            Extract expert skills and emails from a CSV file.

            Parameters:
                csv_file_path (str): The path to the CSV file containing expert information.

            Returns:
                tuple[list[str], list[str]]: A tuple containing lists of expert skills and corresponding emails.
        """

        expert_skills = []
        expert_emails = []

        with open(csv_file_path, 'r') as csv_file:
            reader = csv.reader(csv_file)
            next(reader)  # Skip the header row.

            for row in reader:
                expert_skills.append(row[7])
                expert_emails.append(row[3])

        return expert_skills, expert_emails

    @staticmethod
    def __get_expert_skills_from_json(json_file_path: str) -> tuple[list[str], list[str]]:
        """
            Extract expert skills and emails from a JSON file.

            Parameters:
                json_file_path (str): The path to the JSON file containing expert information.

            Returns:
                tuple[list[str], list[str]]: A tuple containing lists of expert skills and corresponding emails.
        """

        expert_skills = []
        expert_emails = []

        with open(json_file_path, 'r') as json_file:
            data = json.load(json_file)

            for user in data['profiles']:
                expert_emails.append(data['profiles'][user]['email'])

                skills = ''
                for experience in data['profiles'][user]['experiences']:
                    if experience['description'] and "<not serializable>" not in experience['description']:
                        skills += experience['description'] + '\n'

                expert_skills.append(skills)

        return expert_skills, expert_emails

    def __get_expert_skills(self, csv_file_path: str, json_file_path: str) -> tuple[list[str], list[str]]:
        """
            Combine expert skills from CSV and JSON files, matching them by email.

            Parameters:
                csv_file_path (str): The path to the CSV file containing expert information.
                json_file_path (str): The path to the JSON file containing expert information.

            Returns:
                tuple[list[str], list[str]]: A tuple containing lists of combined expert skills and corresponding emails.
        """

        expert_skills_csv, expert_emails_csv = self.__get_expert_skills_from_csv(csv_file_path)
        expert_skills_json, expert_emails_json = self.__get_expert_skills_from_json(json_file_path)

        for i, expert_email_csv in enumerate(expert_emails_csv):
            try:
                j = expert_emails_json.index(expert_email_csv)
                expert_skills_csv[i] += '\n' + expert_skills_json[j]
            except ValueError as e:
                self.app_logger.warning(msg=str(e), exc_info=True)

        return expert_skills_csv, expert_emails_csv

    @staticmethod
    def __get_expert_recommendation_embeddings(expert_recommendation_embeddings: str) -> SentenceTransformerEmbeddingFunction:
        """
            Get Sentence Transformer Embedding Function for expert recommendation.

            Parameters:
                expert_recommendation_embeddings (str): The model name for Sentence Transformer embeddings.

            Returns:
                SentenceTransformerEmbeddingFunction: An instance of Sentence Transformer Embedding Function.
        """

        return SentenceTransformerEmbeddingFunction(model_name=expert_recommendation_embeddings)

    @staticmethod
    def __get_expert_recommendation_chroma_db_client(persist_directory: str = SERVER_SETTINGS["vector_directory"]):
        """
            Get a persistent client for ChromaDB.

            Parameters:
                persist_directory (str): The directory path for persisting ChromaDB.

            Returns:
                chromadb.PersistentClient: An instance of the persistent ChromaDB client.
        """

        return chromadb.PersistentClient(path=persist_directory)

    def __get_expert_recommendation_vector_store(
            self,
            collection_name: str,
            expert_recommendation_chroma_db_client: ClientAPI,
            expert_recommendation_embeddings: SentenceTransformerEmbeddingFunction,
            nlp_en: Language,
            expert_skills: list[str],
            expert_emails: list[str]
    ) -> Collection:
        """
            Get or create a vector store for expert recommendation.

            Parameters:
                collection_name (str): The name of the collection.
                expert_recommendation_chroma_db_client (ClientAPI): ChromaDB client for vector store.
                expert_recommendation_embeddings (SentenceTransformerEmbeddingFunction): Embedding function for expert recommendation.
                nlp_en (Language): spaCy Language object for English.
                expert_skills (list[str]): List of expert skills.
                expert_emails (list[str]): List of expert emails.

            Returns:
                Collection: The expert recommendation vector store collection.
        """

        vector_store = expert_recommendation_chroma_db_client.get_or_create_collection(name=collection_name, embedding_function=expert_recommendation_embeddings, metadata={"hnsw:space": "cosine"})

        if not vector_store.count():
            self.__populate_or_update_expert_recommendation_vector_store(vector_store, nlp_en, expert_skills, expert_emails)

        return vector_store

    def __populate_or_update_expert_recommendation_vector_store(self, expert_recommendation_vector_store: Collection, nlp_en: Language, expert_skills: list[str], expert_emails: list[str]) -> None:
        """
            Populate or update the expert recommendation vector store.

            Parameters:
                expert_recommendation_vector_store (Collection): The vector store for expert recommendation.
                nlp_en (Language): spaCy Language object for English.
                expert_skills (list[str]): List of expert skills.
                expert_emails (list[str]): List of expert emails.
        """

        for i, expert_email in enumerate(expert_emails):
            translated_expert_skills = self.__translate_text(expert_skills[i], 'en')
            translated_expert_skills_tokenized = [sentence.text for sentence in nlp_en(translated_expert_skills).sents]  # tokenize text into sentences
            stored_expert_skills = expert_recommendation_vector_store.get(where={"expert_email": expert_email})['documents']

            if not stored_expert_skills or stored_expert_skills != translated_expert_skills_tokenized:
                for skill in translated_expert_skills_tokenized:
                    expert_recommendation_vector_store.add(documents=[skill], metadatas=[{"expert_email": expert_email}], ids=[str(time.time())])

    def __delete_expert_from_vector_store(self, expert_email: str) -> None:
        """
            Delete an expert from the expert recommendation vector store.

            Parameters:
                expert_email (str): Email of the expert to be deleted.
        """

        self.expert_recommendation_vector_store.delete(where={"expert_email": expert_email})

    def __add_expert_to_vector_store(self, expert_skills: str, expert_email: str) -> None:
        """
            Add an expert to the expert recommendation vector store.

            Parameters:
                expert_skills (str): Skills of the expert to be added.
                expert_email (str): Email of the expert to be added.
        """

        self.__populate_or_update_expert_recommendation_vector_store(
            self.expert_recommendation_vector_store,
            self.nlp_en,
            [expert_skills],
            [expert_email]
        )

    def __update_expert_in_vector_store(self, expert_skills: str, expert_email: str):
        """
            Update the skills of an expert in the expert recommendation vector store.

            Parameters:
                expert_skills (str): Updated skills of the expert.
                expert_email (str): Email of the expert to be updated.
        """

        self.__delete_expert_from_vector_store(expert_email)
        self.__populate_or_update_expert_recommendation_vector_store(
            self.expert_recommendation_vector_store,
            self.nlp_en,
            [expert_skills],
            [expert_email]
        )

    @staticmethod
    def __get_expert_recommendation_parser() -> PydanticOutputParser:
        """
            Get an instance of the PydanticOutputParser for parsing expert recommendation results.

            Returns:
                PydanticOutputParser: Instance of the PydanticOutputParser.
        """

        return PydanticOutputParser(pydantic_object=Experts)

    @staticmethod
    def __get_expert_recommendation_prompt(expert_recommendation_parser: PydanticOutputParser) -> FewShotPromptTemplate:
        """
            Get a FewShotPromptTemplate for generating prompts for expert recommendation.

            Args:
                expert_recommendation_parser (PydanticOutputParser): Parser for expert recommendation output.

            Returns:
                FewShotPromptTemplate: Instance of the FewShotPromptTemplate.
        """

        example_prompt = PromptTemplate(input_variables=["question", "answer"], template="Question: {question}\n{answer}")
        examples = [
            {
                "question": "I want to develop a tool to predict the occupancy rate of emergency beds?",
                "answer":
                    """
                    Are follow up questions needed here: Yes.
                    Follow up: Is a Researcher in operational mathematics important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Specialist in Modeling and Machine Learning important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Process and optimization engineer important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Artificial Intelligence (AI) and Natural Language Processing (NLP) Specialist important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Project Manager and Clinical Needs Analysis important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Data Security and Privacy Expert important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Software Developer and System Integration important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Implementation and Clinical Validation Specialist important for the project?
                    Intermediate answer: Yes.
                    So the final answer is: Researcher in operational mathematics, Specialist in Modeling and Machine Learning, Process and optimization engineer, Artificial Intelligence (AI) and \
                    Natural Language Processing (NLP) Specialist, Project Manager and Clinical Needs Analysis, Data Security and Privacy Expert, Software Developer and System Integration, \
                    Implementation and Clinical Validation Specialist
                    """
            },
            {
                "question": "I want to optimize the care of individuals born prematurely: better screening, better intervention?",
                "answer":
                    """
                    Are follow up questions needed here: Yes.
                    Follow up: Is a Researcher in Obstetric Medicine important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Epidemiology Researcher important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Screening Algorithms Developer important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a researcher in Neonatal Medicine and Pediatrics important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Specialist in Artificial Intelligence (AI) and Data Analysis important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Researcher in Public Health and Health Policies important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Communication and Awareness Researcher important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Expert in Clinical Validation and Long-Term Monitoring important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Specialist in Medical Ethics and Data Confidentiality imp for the project?
                    Intermediate answer: Yes.
                    So the final answer is: Researcher in Obstetric Medicine, Epidemiology Researcher, Screening Algorithms Developer, researcher in Neonatal Medicine and Pediatrics, \
                    Specialist in Artificial Intelligence (AI) and Data Analysis, Researcher in Public Health and Health Policies, Communication and Awareness Researcher, \
                    Expert in Clinical Validation and Long-Term Monitoring, Specialist in Medical Ethics and Data Confidentiality
                    """
            },
            {
                "question": "I am looking for an AI expert to work on the personalization of radiopeptide therapy for patients with neuroendocrine tumors?",
                "answer":
                    """
                    Are follow up questions needed here: Yes.
                    Follow up: Is a Oncologist specializing in neuroendocrine tumors important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Expert in artificial intelligence (AI) applied to medicine important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Medical physicist or radiophysicist important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Expert in medical image processing important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Health Data Scientist important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Software developer specializing in health important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Data security and privacy expert important for the project?
                    Intermediate answer: Yes.
                    So the final answer is: Oncologist specializing in neuroendocrine tumors, Expert in artificial intelligence (AI) applied to medicine, Medical physicist or radiophysicist, \
                    Expert in medical image processing, Health Data Scientist, Software developer specializing in health, Data security and privacy expert
                    """
            },
            {
                "question": "I am in the health field, more specifically in rehabilitation, and I am looking for a developer who could add a chatbot to one of my software tools available online.",
                "answer":
                    """
                    Are follow up questions needed here: Yes.
                    Follow up: Is a Software developer specializing in health important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Artificial Intelligence (AI) and Natural Language Processing (NLP) important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Data Security and Compliance Specialist important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Systems Integration Specialist important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Chatbot developer specializing in user experience (UX) important for the project?
                    Intermediate answer: Yes.
                    So the final answer is: Software developer specializing in health, Artificial Intelligence (AI) and Natural Language Processing (NLP), Data Security and Compliance Specialist, \
                    Systems Integration Specialist, Chatbot developer specializing in user experience (UX)
                    """
            },
            {
                "question": "I am a cardiologist and I am looking to collaborate to develop an ML/AI algorithm to help me quantify cardiac fibrosis in MRI imaging.",
                "answer":
                    """
                    Are follow up questions needed here: Yes.
                    Follow up: Is a Cardiologist specializing in cardiac imaging important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Medical image processing engineer important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Expert in machine learning (ML) and artificial intelligence (AI) important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Health Data Scientist important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Software developer specializing in health important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Data security and privacy expert important for the project?
                    Intermediate answer: Yes.
                    So the final answer is: Cardiologist specializing in cardiac imaging, Medical image processing engineer, Expert in machine learning (ML) and artificial intelligence (AI), \
                    Health Data Scientist, Software developer specializing in health, Data security and privacy expert
                    """
            },
            {
                "question": "I work on the classification of knee pathologies using knee ultrasound data. I have developed deep learning algorithms using recurrent neural networks \
                and I am looking for a data expert who works on the interpretability and explainability of models.",
                "answer":
                    """
                    Are follow up questions needed here: Yes.
                    Follow up: Is a Specialist in medical imaging important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Expert in deep learning and recurrent neural networks (RNN) important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Health Data Scientist important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Expert in interpretability and explainability of AI models important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Software developer specializing in health important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Data security and privacy expert important for the project?
                    Intermediate answer: Yes.
                    So the final answer is: Specialist in medical imaging, Expert in deep learning and recurrent neural networks (RNN), Health Data Scientist, Expert in interpretability and \
                    explainability of AI models, Software developer specializing in health, Data security and privacy expert
                    """
            },
            {
                "question": "I am a cardiologist and researcher at the CHUM. I have a particular interest in cardiac imaging research and lead prospective research studies using echocardiography \
                as a research modality in the adult patient population. I am interested in using cardiac imaging data and developing algorithms to establish diagnoses of cardiac pathologies.",
                "answer":
                    """
                    Are follow up questions needed here: Yes.
                    Follow up: Is a Cardiologist specializing in cardiac imaging important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Medical imaging researcher important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Health Data Scientist important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Expert in machine learning (ML) and artificial intelligence (AI) important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Software developer specializing in health important for the project?
                    Intermediate answer: Yes.
                    Follow up: Is a Data security and privacy expert important for the project?
                    Intermediate answer: Yes.
                    So the final answer is: Cardiologist specializing in cardiac imaging, Medical imaging researcher, Health Data Scientist, \
                    Expert in machine learning (ML) and artificial intelligence (AI), Software developer specializing in health, Data security and privacy expert
                    """
            },
        ]
        prompt = FewShotPromptTemplate(
            examples=examples,
            example_prompt=example_prompt,
            suffix="""
                The examples above show you how you should proceed to respond to any question. For each question try to think of the needs and suggest key experts to fulfill those needs.
                Make sure that each experts that you suggest is important and relevant to the question.
                Always emphasizes artificial intelligence, data security, confidentiality, health when it is necessary.
                Just return the final answer with nothing else for example don't say: the final answer is ...
                Only return the list of experts profiles separated by a comma.
                {format_instructions}\n
                Question: {input}
            """,
            input_variables=["input"],
            partial_variables={"format_instructions": expert_recommendation_parser.get_format_instructions()},
        )
        return prompt

    @staticmethod
    def __get_keywords_embeddings(keywords_llm: str) -> TransformerDocumentEmbeddings:
        """
            Get TransformerDocumentEmbeddings for keyword embeddings.

            Args:
                keywords_llm (str): Path or identifier for the LLM model for keywords.

            Returns:
                TransformerDocumentEmbeddings: Instance of TransformerDocumentEmbeddings.
        """

        return TransformerDocumentEmbeddings(keywords_llm)

    @staticmethod
    def __get_keywords_model(keywords_embeddings: TransformerDocumentEmbeddings) -> KeyBERT:
        """
            Get KeyBERT model for extracting keywords from embeddings.

            Args:
                keywords_embeddings (TransformerDocumentEmbeddings): Embeddings for keywords.

            Returns:
                KeyBERT: Instance of KeyBERT.
        """

        return KeyBERT(model=keywords_embeddings)

    @staticmethod
    def __get_keywords_parser() -> CommaSeparatedListOutputParser:
        """
            Get CommaSeparatedListOutputParser for parsing comma-separated keyword lists.

            Returns:
                CommaSeparatedListOutputParser: Instance of CommaSeparatedListOutputParser.
        """

        return CommaSeparatedListOutputParser()

    @staticmethod
    def __get_keywords_prompt() -> PromptTemplate:
        """
            Get PromptTemplate for extracting keywords from a document.

            Returns:
                PromptTemplate: Instance of PromptTemplate with placeholders for document input.
        """

        prompt_template = """
                <s>
                [INST]
                I have the following document written in French that describes the skills of an expert:

                "J'ai complété une maîtrise en santé publique à l'Université McGill en mai 2021, et je travaille depuis dans \
                le domaine de la télémédecine chez l'entreprise canadienne Dialogue. Je m'intéresse aux enjeux du numérique \
                dans le réseau de la santé, ainsi qu'à l'application de l'apprentissage machine et de l'IA dans \
                ces technologies."

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

                "{document}"

                Based on the information above, extract the keywords that best describe the expert's skills.
                Make sure to only extract keywords that appear in the text.
                Make sure you to only return the keywords, separate them with commas and say nothing else.
                For example, don't say:
                "Here are the keywords present in the document"
                [/INST]
        """
        return PromptTemplate(input_variables=["document"], template=prompt_template)

    @staticmethod
    def __get_keywords_chain(qa_llm: Ollama, keywords_prompt: PromptTemplate, ) -> LLMChain:
        """
            Get an LLMChain for extracting keywords using a QA LLM and a keywords extraction prompt.

            Args:
                qa_llm (Ollama): Instance of the QA LLM.
                keywords_prompt (PromptTemplate): Instance of PromptTemplate for extracting keywords.

            Returns:
                LLMChain: Instance of LLMChain configured for extracting keywords.
        """

        return LLMChain(llm=qa_llm, prompt=keywords_prompt)

    @staticmethod
    def __get_nlp(model_name: str) -> Language:
        """
            Get a spaCy Language object for a given model name. Downloads the model if not already installed.

            Args:
                model_name (str): Name of the spaCy model.

            Returns:
                Language: spaCy Language object.
        """

        if not spacy.util.is_package(model_name):
            spacy.cli.download(model_name)
        return spacy.load(model_name)

    @staticmethod
    def __get_stop_words(nlp: Language) -> list[str]:
        """
            Get a list of stop words from a given spaCy Language object.

            Args:
                nlp (Language): spaCy Language object.

            Returns:
                List[str]: List of stop words.
        """

        return list(nlp.Defaults.stop_words) + [p for p in string.punctuation]

    def __remove_stop_words(self, documents: list[str], nlp: Language) -> list[str]:
        """
            Remove stop words from a list of documents using a spaCy Language object.

            Args:
                documents (List[str]): List of documents to process.
                nlp (Language): spaCy Language object.

            Returns:
                List[str]: List of documents with stop words removed.
        """

        filtered_documents = []
        for doc in documents:
            tokenized_doc = nlp(doc)
            filtered_tokens = [token.text for token in tokenized_doc if token.text not in self.__get_stop_words(nlp)]
            filtered_documents.append(' '.join(filtered_tokens))
        return filtered_documents

    @staticmethod
    def __get_user_emails_from_llm_response(source_documents: list[Document]) -> list[str]:
        """
            Extract user emails from a list of LLM response documents.

            Args:
                source_documents (List[Document]): List of LLM response documents.

            Returns:
                List[str]: List of user emails corresponding to the source documents.
        """

        user_emails = []

        with open(SERVER_SETTINGS['users_csv_file'], 'r') as csv_file:
            csv_file_reader = csv.reader(csv_file)
            next(csv_file_reader)  # Skip the header row.

            for i, row in enumerate(csv_file_reader):
                for document in source_documents:
                    source_row = document.metadata['row']

                    if source_row == i:
                        user_emails.append(row[3])
                        break

        return user_emails

    @staticmethod
    def __translate_text(text: str, destination_language: Literal['en', 'fr']) -> str:
        """
            Translate text to the specified destination language.

            Args:
                text (str): Text to be translated.
                destination_language (Literal['en', 'fr']): Destination language code ('en' for English, 'fr' for French).

            Returns:
                str: Translated text.
        """

        if len(text) <= 5000:  # Maximum text length accepted by the Google Translator API
            return GoogleTranslator(source='auto', target=destination_language).translate(text)
        else:
            chunk_to_translate = ''
            translated_text = ''

            for sentence in text.lstrip().split('\n'):
                if not sentence:
                    continue

                if len(chunk_to_translate) >= 3000:
                    translated_text += GoogleTranslator(source='auto', target=destination_language).translate(chunk_to_translate)
                    chunk_to_translate = ''
                else:
                    chunk_to_translate += sentence + '\n'

            if chunk_to_translate:  # Translate the remaining text if any
                translated_text += GoogleTranslator(source='auto', target=destination_language).translate(chunk_to_translate)

            return translated_text

    def __init_expert_recommendation_chain(self) -> None:
        """
            Initialize the expert recommendation chain components, including language models, embeddings, and vector stores.

            This method sets up the components needed for expert recommendation, including the language model (LLM),
            embeddings, ChromaDB client, expert information from CSV, and the vector store for recommendations.

            Returns:
                None
        """

        self.expert_recommendation_llm = self.__get_expert_recommendation_llm(SERVER_SETTINGS['expert_recommendation_llm_model'])
        self.expert_recommendation_embeddings = self.__get_expert_recommendation_embeddings(SERVER_SETTINGS['expert_recommendation_embeddings'])
        self.expert_recommendation_chroma_db_client = self.__get_expert_recommendation_chroma_db_client()
        self.expert_information = self.__get_expert_skills_from_csv(SERVER_SETTINGS['users_csv_file'])
        self.nlp_en = self.__get_nlp(SERVER_SETTINGS["spacy_nlp_en"])
        self.expert_recommendation_vector_store = self.__get_expert_recommendation_vector_store(
            SERVER_SETTINGS['chroma_collection_name'],
            self.expert_recommendation_chroma_db_client,
            self.expert_recommendation_embeddings,
            self.nlp_en,
            self.expert_information[0],
            self.expert_information[1]
        )
        self.expert_recommendation_parser = self.__get_expert_recommendation_parser()
        self.expert_recommendation_prompt = self.__get_expert_recommendation_prompt(self.expert_recommendation_parser)

    def __init_keywords_chain(self) -> None:
        """
            Initialize the keywords chain components, including language models, embeddings, and parsers.

            This method sets up the components needed for keyword extraction, including the language model (LLM),
            embeddings, model for keyword extraction, parser, prompt, and the overall keywords chain.

            Returns:
            - None
        """

        self.keywords_embeddings = self.__get_keywords_embeddings(SERVER_SETTINGS['keywords_llm_model'])
        self.keywords_model = self.__get_keywords_model(self.keywords_embeddings)
        self.keywords_parser = self.__get_keywords_parser()
        self.keywords_prompt = self.__get_keywords_prompt()
        self.keywords_chain = self.__get_keywords_chain(self.expert_recommendation_llm, self.keywords_prompt)
        self.nlp_fr = self.__get_nlp(SERVER_SETTINGS["spacy_nlp_fr"])
        self.stop_words_fr = self.__get_stop_words(self.nlp_fr)

    def __init_zmq(self, addr: str) -> None:
        """
            Initialize ZeroMQ (ZMQ) communication components.

            This method sets up a ZeroMQ context and creates a REP (Reply) socket, binding it to the specified address.

            Args:
                addr (str): The address to bind the ZeroMQ socket.

            Returns:
                None
        """

        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.REP)
        self.socket.bind(addr)

    def __try_get_llm_expert_recommendation(self, llm_input: str, max_attempts: int = 4, retry_delay: int = 1) -> List[str]:
        """
            Attempt to get expert recommendations from the language model (LLM).

            This method sends an input query to the LLM, parses the output, and returns a list of generic profiles.

            Args:
                llm_input (str): The input query to be sent to the language model.
                max_attempts (int): The maximum number of attempts to get recommendations (default: 4).
                retry_delay (int): The delay (in seconds) between retry attempts (default: 1).

            Returns:
                List[str]: A list of generic profiles obtained from parsing the LLM output.

            Raises:
                Exception: If an error occurs during parsing LLM output after the maximum attempts.
        """

        for attempt in range(1, max_attempts):
            try:
                llm_output = self.expert_recommendation_llm(llm_input)
                generic_profiles = self.expert_recommendation_parser.parse(llm_output).profiles
                return generic_profiles
            except OutputParserException as e:
                self.app_logger.error(msg=str(e), exc_info=True)
                time.sleep(retry_delay)

        raise Exception(f"Error occurred when parsing LLM output for generic profiles.")

    def __get_experts_recommendation(self, question: str):
        """
            Get expert recommendations based on a user's question.

            This method translates the user's question, generates generic profiles using the LLM,
            queries the expert recommendation vector store, and returns a dictionary of expert recommendations.

            Args:
                question (str): The user's question.

            Returns:
                dict: A dictionary containing translated generic profiles as keys and expert recommendations as values.
                    Each value is a dictionary with 'expert_emails' and 'scores' lists.

            Notes:
                - Only considers experts with cosine similarity scores less than or equal to 0.5.
                - Returns only the top 5 experts for each generic profile.
        """

        query = GoogleTranslator(source='auto', target='en').translate(question)
        llm_input = self.expert_recommendation_prompt.format(input=query)
        generic_profiles = self.__try_get_llm_expert_recommendation(llm_input)  # max attempts = 4 , wait 1 second between each try.
        found_experts = self.expert_recommendation_vector_store.query(query_texts=generic_profiles, n_results=20)
        response = {}

        for i, generic_profile in enumerate(generic_profiles):
            translated_generic_profile = GoogleTranslator(source='auto', target='fr').translate(generic_profile)
            response[translated_generic_profile] = {
                'expert_emails': [],
                'scores': []
            }

            for j, metadata in enumerate(found_experts['metadatas'][i]):
                # Considering only experts whose cosine similarity score is less than or equal to 0.5
                if metadata['expert_email'] not in response[translated_generic_profile]['expert_emails'] and found_experts['distances'][i][j] <= 0.5:
                    response[translated_generic_profile]['expert_emails'].append(metadata['expert_email'])
                    response[translated_generic_profile]['scores'].append(found_experts['distances'][i][j])

                if len(response[translated_generic_profile]['expert_emails']) == 5:  # Return only the top 5 experts for each generic profile
                    break

        return response

    def __try_get_llm_keywords(self, llm_input: str, max_attempts: int = 4, retry_delay: int = 1) -> List[str]:
        """
            Try to get keywords from the LLM.

            This method attempts to get keywords from the LLM chain by making multiple tries with a delay between attempts.

            Args:
                llm_input (str): Input document for LLM.
                max_attempts (int): Maximum number of attempts.
                retry_delay (int): Delay in seconds between attempts.

            Returns:
                List[str]: List of extracted keywords.

            Raises:
                Exception: Raised if an error occurs when parsing LLM output for keywords.
        """

        for attempt in range(1, max_attempts):
            try:
                llm_output = self.keywords_chain.predict(document=llm_input)
                llm_keywords = self.keywords_parser.parse(llm_output)
                return llm_keywords
            except AttributeError as e:
                self.app_logger.error(msg=str(e), exc_info=True)
                time.sleep(retry_delay)

        raise Exception(f"Error occurred when parsing LLM output for keywords.")

    def __get_keywords(self, text: str) -> list[str]:
        """
            Get keywords from the given text.

            This method extracts keywords from the text by performing the following steps:
                1. Translate the text to French.
                2. Tokenize the translated text into sentences.
                3. Extract LLM keywords for each paragraph of five sentences.
                4. Lowercase LLM keywords and remove stop words.
                5. Use KeyBERT to obtain the most relevant keywords previously extracted by LLM.
                6. Return a list of unique uppercase keywords.

            Args:
                text (str): Input text.

            Returns:
                list[str]: List of extracted keywords.
        """

        if not text:
            return []

        translated_text = self.__translate_text(text, 'fr')
        translated_text_tokenized = [sentence.text for sentence in self.nlp_fr(translated_text).sents]  # tokenize text into sentences
        keywords = set()
        sentences = []

        for i, sentence in enumerate(translated_text_tokenized):
            sentences.append(sentence.lstrip())
            if len(sentences) == 5 or i == len(translated_text_tokenized) - 1:  # A paragraphe of five sentences, or it is the last sentence.
                paragraph = '\n'.join(sentences)
                sentences.clear()
                llm_keywords = self.__try_get_llm_keywords(paragraph)  # max attempts = 4 , wait 1 second between each try.
                llm_keywords = [k.lower() for k in llm_keywords]
                candidate_keywords = self.__remove_stop_words(llm_keywords, self.nlp_fr)
                keybert_keywords = self.keywords_model.extract_keywords(
                    docs=paragraph,
                    candidates=candidate_keywords,
                    stop_words=self.stop_words_fr,
                    keyphrase_ngram_range=(1, 4),
                    top_n=3,
                )
                keybert_keywords = [k[0] for k in keybert_keywords]

                for keybert_keyword in keybert_keywords:
                    index = candidate_keywords.index(keybert_keyword)
                    keywords.add(llm_keywords[index].upper())

        return list(keywords)

    def __call_method(self, method_name: str, arguments: list) -> Any:
        """
            Dynamically call a private method within the class.

            This method allows the dynamic invocation of private methods by specifying the method name and providing the necessary arguments.

            Args:
                method_name (str): The name of the private method to be called.
                arguments (list): List of arguments to be passed to the method.

            Returns:
                dict: A dictionary containing the status of the call and the result or error message.
                    - 'status': 'success' if the method call is successful, 'error' otherwise.
                    - 'result': The result of the method call if successful.
                    - 'error_message': Error message if the method is not found.
        """

        # Look up the method dynamically
        method = getattr(self, f'_{type(self).__name__}__{method_name}', None)  # We need to add _ClassName__ before the method name, as all processing methods are super private.

        if method and callable(method):
            # Call the method with the provided arguments
            result = method(*arguments)
            return {'status': 'success', 'result': result}
        else:
            return {'status': 'error', 'error_message': f'Method not found: {method_name}'}

    ###################################################################################################################
    #                                                 PUBLIC METHODS                                                 #
    ###################################################################################################################

    def init(self) -> None:
        """
            Initialize the Language Model (LLM) and ZeroMQ communication.

            This method initializes the expert recommendation and keywords chains, as well as sets up the ZeroMQ socket for communication.

            Raises:
                Exception: If there is an error during initialization.
        """

        try:
            self.__init_expert_recommendation_chain()
            self.__init_keywords_chain()
            self.__init_zmq(SERVER_SETTINGS["zeromq_response_address"])
        except Exception as e:
            self.app_logger.error(msg=str(e), exc_info=True)
        else:
            self.is_available = True
            self.app_logger.info(msg="The LLM has been successfully initialized.")

    def start_llm_processing(self):
        """
            Continuously process queries received from the server.

            This method runs in a loop, receiving queries from the server, extracting the method name and arguments,
            dynamically calling the specified method, and sending the result or error back to the server.

            The loop continues until the LLM context is terminated or an error occurs.

            Raises:
                zmq.error.ContextTerminated: If the ZeroMQ context is terminated.
                Exception: For any other unexpected errors during processing.
        """

        while self.is_available:
            try:
                # Receive data from the server
                data = self.socket.recv_json()

                # Extract method name and arguments from the query
                method_name = data.get('method', '')
                arguments = data.get('arguments', [])

                # Call the method dynamically
                if method_name:
                    response = self.__call_method(method_name, arguments)
                else:
                    response = {'status': 'error', 'error_message': 'No method specified'}

                # Send the result or error back to the server
                self.socket.send_json(response)
            except zmq.error.ContextTerminated:
                self.is_available = False
                self.app_logger.warning("Context terminated during processing. Exiting...")
            except Exception as e:
                self.socket.send_json({'status': 'error', 'error_message': str(e)})
                self.app_logger.error(msg=str(e), exc_info=True)

    def stop_llm_processing(self):
        """
            Gracefully shuts down the LLM processor.

            This method sets the `is_available` flag to False, closes the ZeroMQ socket, and terminates the ZeroMQ context.

            The method is intended to be called when you want to stop the continuous processing of queries.

            It logs an informational message indicating the shutdown process.
        """

        self.app_logger.info("Shutting down the LLM processor gracefully...")
        self.is_available = False
        self.socket.close(0)
        self.context.term()

    @staticmethod
    def query_llm(
            method: Literal[
                'get_keywords',
                'get_experts_recommendation',
                'add_expert_to_vector_store',
                'update_expert_in_vector_store',
                'delete_expert_from_vector_store'
            ],
            arguments: list) -> Any:
        """
            Sends a query to the LLM processor for specified processing methods.

            Args:
                method (Literal): The LLM processing method to invoke.
                arguments (list): The list of arguments required for the specified method.

            Returns:
                Any: The result of the LLM processing method.

            Raises:
                Exception: If there is an error in the LLM processing.
        """

        socket = zmq.Context().socket(zmq.REQ)
        socket.connect(SERVER_SETTINGS["zeromq_request_address"])
        socket.send_json({'method': method, 'arguments': arguments})
        response = socket.recv_json()
        socket.close()

        if response['status'] == 'success':
            return response['result']
        elif response['status'] == 'error':
            raise Exception(response['error_message'])
