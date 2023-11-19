import csv
import json
import string
import time
import chromadb
import spacy
from logging import Logger
from typing import Optional, Literal, List
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

    @staticmethod
    def __get_expert_recommendation_llm(expert_recommendation_llm_model: str, temperature: float = 0.0) -> Ollama:
        return Ollama(base_url='http://localhost:11434', model=expert_recommendation_llm_model, temperature=temperature)

    @staticmethod
    def __get_expert_skills_from_csv(csv_file_path: str) -> tuple[list[str], list[str]]:
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
        return SentenceTransformerEmbeddingFunction(model_name=expert_recommendation_embeddings)

    @staticmethod
    def __get_expert_recommendation_chroma_db_client(persist_directory: str = SERVER_SETTINGS["vector_directory"]):
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
        vector_store = expert_recommendation_chroma_db_client.get_or_create_collection(name=collection_name, embedding_function=expert_recommendation_embeddings, metadata={"hnsw:space": "cosine"})

        if not vector_store.count():
            self.__populate_or_update_expert_recommendation_vector_store(vector_store, nlp_en, expert_skills, expert_emails)

        return vector_store

    def __populate_or_update_expert_recommendation_vector_store(self, expert_recommendation_vector_store: Collection, nlp_en: Language, expert_skills: list[str], expert_emails: list[str]) -> None:
        for i, expert_email in enumerate(expert_emails):
            translated_expert_skills = self.__translate_text(expert_skills[i], 'en')
            translated_expert_skills_tokenized = [sentence.text for sentence in nlp_en(translated_expert_skills).sents]  # tokenize text into sentences
            stored_expert_skills = expert_recommendation_vector_store.get(where={"expert_email": expert_email})['documents']

            if not stored_expert_skills or stored_expert_skills != translated_expert_skills_tokenized:
                for skill in translated_expert_skills_tokenized:
                    expert_recommendation_vector_store.add(documents=[skill], metadatas=[{"expert_email": expert_email}], ids=[str(time.time())])

    def delete_expert_from_vector_store(self, expert_email: str):
        self.expert_recommendation_vector_store.delete(where={"expert_email": expert_email})

    def add_expert_to_vector_store(self, expert_skills: str, expert_email: str):
        self.__populate_or_update_expert_recommendation_vector_store(
            self.expert_recommendation_vector_store,
            self.nlp_en,
            [expert_skills],
            [expert_email]
        )

    def update_expert_in_vector_store(self, expert_skills: str, expert_email: str):
        self.delete_expert_from_vector_store(expert_email)
        self.__populate_or_update_expert_recommendation_vector_store(
            self.expert_recommendation_vector_store,
            self.nlp_en,
            [expert_skills],
            [expert_email]
        )

    @staticmethod
    def __get_expert_recommendation_parser() -> PydanticOutputParser:
        return PydanticOutputParser(pydantic_object=Experts)

    @staticmethod
    def __get_expert_recommendation_prompt(expert_recommendation_parser: PydanticOutputParser) -> FewShotPromptTemplate:
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
        return TransformerDocumentEmbeddings(keywords_llm)

    @staticmethod
    def __get_keywords_model(keywords_embeddings: TransformerDocumentEmbeddings) -> KeyBERT:
        return KeyBERT(model=keywords_embeddings)

    @staticmethod
    def __get_keywords_parser() -> CommaSeparatedListOutputParser:
        return CommaSeparatedListOutputParser()

    @staticmethod
    def __get_keywords_prompt() -> PromptTemplate:
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
        return LLMChain(llm=qa_llm, prompt=keywords_prompt)

    @staticmethod
    def __get_nlp(model_name: str) -> Language:
        if not spacy.util.is_package(model_name):
            spacy.cli.download(model_name)
        return spacy.load(model_name)

    @staticmethod
    def __get_stop_words(nlp: Language) -> list[str]:
        return list(nlp.Defaults.stop_words) + [p for p in string.punctuation]

    def __remove_stop_words(self, documents: list[str], nlp: Language) -> list[str]:
        filtered_documents = []
        for doc in documents:
            tokenized_doc = nlp(doc)
            filtered_tokens = [token.text for token in tokenized_doc if token.text not in self.__get_stop_words(nlp)]
            filtered_documents.append(' '.join(filtered_tokens))
        return filtered_documents

    @staticmethod
    def __get_user_emails_from_llm_response(source_documents: list[Document]) -> list[str]:
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
        self.keywords_embeddings = self.__get_keywords_embeddings(SERVER_SETTINGS['keywords_llm_model'])
        self.keywords_model = self.__get_keywords_model(self.keywords_embeddings)
        self.keywords_parser = self.__get_keywords_parser()
        self.keywords_prompt = self.__get_keywords_prompt()
        self.keywords_chain = self.__get_keywords_chain(self.expert_recommendation_llm, self.keywords_prompt)
        self.nlp_fr = self.__get_nlp(SERVER_SETTINGS["spacy_nlp_fr"])
        self.stop_words_fr = self.__get_stop_words(self.nlp_fr)

    def init(self) -> None:
        try:
            self.__init_expert_recommendation_chain()
            self.__init_keywords_chain()
        except Exception as e:
            self.app_logger.error(msg=str(e), exc_info=True)
        else:
            self.is_available = True
            self.app_logger.info(msg="The LLM has been successfully initialized.")

    def __try_get_llm_expert_recommendation(self, llm_input: str, max_attempts: int = 4, retry_delay: int = 1) -> List[str]:
        for attempt in range(1, max_attempts):
            try:
                llm_output = self.expert_recommendation_llm(llm_input)
                generic_profiles = self.expert_recommendation_parser.parse(llm_output).profiles
                return generic_profiles
            except OutputParserException as e:
                self.app_logger.error(msg=str(e), exc_info=True)
                time.sleep(retry_delay)

        raise Exception(f"Error occurred when parsing LLM output for generic profiles.")

    def get_experts_recommendation(self, question: str):
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
        for attempt in range(1, max_attempts):
            try:
                llm_output = self.keywords_chain.predict(document=llm_input)
                llm_keywords = self.keywords_parser.parse(llm_output)
                return llm_keywords
            except AttributeError as e:
                self.app_logger.error(msg=str(e), exc_info=True)
                time.sleep(retry_delay)

        raise Exception(f"Error occurred when parsing LLM output for keywords.")

    def get_keywords(self, text: str) -> list[str]:
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
