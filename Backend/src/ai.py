import csv
import os
import string
import spacy
import chardet
import chromadb
import pandas as pd
from logging import Logger
from typing import Optional
from ai_models import Experts, User
from deep_translator import GoogleTranslator
from flair.embeddings import TransformerDocumentEmbeddings
from keybert import KeyBERT
from langchain.chains import RetrievalQA, LLMChain
from langchain.document_loaders import CSVLoader
from langchain.embeddings import OllamaEmbeddings
from langchain.llms import Ollama
from langchain.output_parsers import CommaSeparatedListOutputParser
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts.few_shot import FewShotPromptTemplate
from langchain.prompts.prompt import PromptTemplate
from langchain.schema import Document
from langchain.vectorstores import Chroma
from spacy import Language
from settings import SERVER_SETTINGS


class LLM:
    def __init__(self, app_logger: Logger):
        self.app_logger = app_logger
        self.qa_llm: Optional[Ollama] = None
        self.user_documents: Optional[list[Document]] = None
        self.qa_embeddings: Optional[OllamaEmbeddings] = None
        self.qa_vector_store: Optional[Chroma] = None
        self.qa_prompt: Optional[PromptTemplate] = None
        self.qa_chain: Optional[RetrievalQA] = None
        self.keywords_embeddings: Optional[TransformerDocumentEmbeddings] = None
        self.keywords_model: Optional[KeyBERT] = None
        self.keywords_prompt: Optional[PromptTemplate] = None
        self.keywords_chain: Optional[LLMChain] = None
        self.nlp: Optional[Language] = None
        self.stop_words: Optional[list[str]] = None
        self.is_available: bool = False
        self.chroma_db_client = None
        self.linkedin_data = None
        self.users = None
        self.chroma_db_collection = None

    @staticmethod
    def __get_qa_llm(qa_llm_model: str, temperature: float = 0.0) -> Ollama:
        return Ollama(base_url='http://localhost:11434', model=qa_llm_model, temperature=temperature)

    @staticmethod
    def __get_user_documents(csv_file_path: str) -> list[Document]:
        loader = CSVLoader(file_path=csv_file_path)
        return loader.load()

    @staticmethod
    def __get_qa_embeddings(qa_llm_model: str, temperature: float = 0.0) -> OllamaEmbeddings:
        return OllamaEmbeddings(base_url="http://localhost:11434", model=qa_llm_model, temperature=temperature)

    @staticmethod
    def __create_qa_vector_database(qa_embeddings: OllamaEmbeddings, user_documents: list[Document], persist_directory: str = SERVER_SETTINGS["../vector_directory"]) -> Chroma:
        if os.path.exists(persist_directory):
            vector_store = Chroma(embedding_function=qa_embeddings, persist_directory=persist_directory)
        else:
            vector_store = Chroma.from_documents(user_documents, qa_embeddings, persist_directory=persist_directory)
            vector_store.persist()

        return vector_store

    @staticmethod
    def __get_qa_prompt() -> PromptTemplate:
        prompt_template = '''Use the following pieces of context to answer the question at the end. \
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        {context}

        {question}
        '''

        return PromptTemplate(template=prompt_template, input_variables=["context", "question"])

    @staticmethod
    def __get_qa_chain(qa_llm: Ollama, qa_vector_store: Chroma, qa_prompt: PromptTemplate, chain_type: str = "stuff", return_source_documents: bool = True) -> RetrievalQA:
        return RetrievalQA.from_chain_type(
            llm=qa_llm,
            retriever=qa_vector_store.as_retriever(search_type="mmr", search_kwargs={'k': 10, 'fetch_k': 20}),
            chain_type=chain_type,
            return_source_documents=return_source_documents,
            chain_type_kwargs={"prompt": qa_prompt}
        )

    @staticmethod
    def __get_keywords_embeddings(keywords_llm: str) -> TransformerDocumentEmbeddings:
        return TransformerDocumentEmbeddings(keywords_llm)

    @staticmethod
    def __get_keywords_model(keywords_embeddings: TransformerDocumentEmbeddings) -> KeyBERT:
        return KeyBERT(model=keywords_embeddings)

    @staticmethod
    def __get_keywords_prompt() -> PromptTemplate:
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

    def __remove_stop_words(self, documents: list[str]) -> list[str]:
        filtered_documents = []
        for doc in documents:
            tokenized_doc = self.nlp(doc)
            filtered_tokens = [token.text for token in tokenized_doc if token.text not in self.stop_words]
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

    def __init_qa_chain(self) -> None:
        self.qa_llm = self.__get_qa_llm(SERVER_SETTINGS['qa_llm_model'])
        self.user_documents = self.__get_user_documents(SERVER_SETTINGS['users_csv_file'])
        self.qa_embeddings = self.__get_qa_embeddings(SERVER_SETTINGS['qa_llm_model'])
        self.qa_vector_store = self.__create_qa_vector_database(self.qa_embeddings, self.user_documents)
        self.qa_prompt = self.__get_qa_prompt()
        self.qa_chain = self.__get_qa_chain(self.qa_llm, self.qa_vector_store, self.qa_prompt)

    def __init_keywords_chain(self) -> None:
        self.keywords_embeddings = self.__get_keywords_embeddings(SERVER_SETTINGS['keywords_llm_model'])
        self.keywords_model = self.__get_keywords_model(self.keywords_embeddings)
        self.keywords_prompt = self.__get_keywords_prompt()
        self.keywords_chain = self.__get_keywords_chain(self.qa_llm, self.keywords_prompt)
        self.nlp = self.__get_nlp(SERVER_SETTINGS["spacy_nlp"])
        self.stop_words = self.__get_stop_words(self.nlp)

    def init(self) -> None:
        try:
            self.__init_qa_chain()
            self.__init_keywords_chain()
            self.init_recommendation_pipeline(SERVER_SETTINGS["vector_directory"], SERVER_SETTINGS["users_csv_file"], SERVER_SETTINGS['linkedin_data_file'])
        except Exception as e:
            self.app_logger.error(msg=str(e), exc_info=True)
        else:
            self.is_available = True
            self.app_logger.info(msg="The LLM has been successfully initialized.")

    def get_user_recommendations(self, question: str) -> list[str]:
        response = self.qa_chain({"query": question})
        return self.__get_user_emails_from_llm_response(response['source_documents'])

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

    def init_recommendation_pipeline(self, db_persist_directory: str, user_file_path: str, linkedin_data_file_path: str):
        self.chroma_db_client = chromadb.PersistentClient(path=db_persist_directory)
        self.users = self.init_users(user_file_path)
        self.linkedin_data = self.load_json(linkedin_data_file_path)
        self.users = self.update_users(self.users, self.linkedin_data)
        self.chroma_db_collection = self.init_chroma_db_collection()

    @staticmethod
    def init_users(filename: str):
        with open(filename, 'rb') as f:
            result = chardet.detect(f.read())

        csv_reader = pd.read_csv(filename, usecols=[
            "Prénom",
            "Nom",
            "Compétences ou Expertise",
            "Nombre d'années d'expérience en IA",
            "Nombre d'années d'expérience en santé",
        ], encoding=result['encoding'])
        csv_reader.rename(columns={"Prénom": "first_name", "Nom": "last_name", "Compétences ou Expertise": "skills", "Nombre d'années d'expérience en IA": "years_experience_ia",
                                   "Nombre d'années d'expérience en santé": "years_experience_healthcare"}, inplace=True)
        users: list[User] = []
        count = 0
        for index, row in csv_reader.iterrows():
            user = User()
            for column, value in row.items():
                setattr(user, str(column), str(value))

            user.user_id = str(count)
            users.append(user)
            count += 1

        for user in users:
            user.skills = GoogleTranslator(source='auto', target='en').translate(user.skills) + "."
            splits = user.skills.split('.')
            for split in splits:
                user.linldinSkills.append(split)
        return users

    @staticmethod
    def get_generic_profiles_prompt():
        parser = PydanticOutputParser(pydantic_object=Experts)

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
                    So the final answer is: Researcher in operational mathematics, Specialist in Modeling and Machine Learning, Process and optimization engineer, Artificial Intelligence (AI) and Natural Language Processing (NLP) Specialist, Project Manager and Clinical Needs Analysis, Data Security and Privacy Expert, Software Developer and System Integration, Implementation and Clinical Validation Specialist
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
                    So the final answer is: Researcher in Obstetric Medicine, Epidemiology Researcher, Screening Algorithms Developer, researcher in Neonatal Medicine and Pediatrics, Specialist in Artificial Intelligence (AI) and Data Analysis, Researcher in Public Health and Health Policies, Communication and Awareness Researcher, Expert in Clinical Validation and Long-Term Monitoring, Specialist in Medical Ethics and Data Confidentiality
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
                    So the final answer is: Oncologist specializing in neuroendocrine tumors, Expert in artificial intelligence (AI) applied to medicine, Medical physicist or radiophysicist, Expert in medical image processing, Health Data Scientist, Software developer specializing in health, Data security and privacy expert
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
                    So the final answer is: Software developer specializing in health, Artificial Intelligence (AI) and Natural Language Processing (NLP), Data Security and Compliance Specialist, Systems Integration Specialist, Chatbot developer specializing in user experience (UX)
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
                    So the final answer is: Cardiologist specializing in cardiac imaging, Medical image processing engineer, Expert in machine learning (ML) and artificial intelligence (AI), Health Data Scientist, Software developer specializing in health, Data security and privacy expert
                    """
            },
            {
                "question": "I work on the classification of knee pathologies using knee ultrasound data. I have developed deep learning algorithms using recurrent neural networks and I am looking for a data expert who works on the interpretability and explainability of models.",
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
                    So the final answer is: Specialist in medical imaging, Expert in deep learning and recurrent neural networks (RNN), Health Data Scientist, Expert in interpretability and explainability of AI models, Software developer specializing in health, Data security and privacy expert
                    """
            },
            {
                "question": "I am a cardiologist and researcher at the CHUM. I have a particular interest in cardiac imaging research and lead prospective research studies using echocardiography as a research modality in the adult patient population. I am interested in using cardiac imaging data and developing algorithms to establish diagnoses of cardiac pathologies.",
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
                    So the final answer is: Cardiologist specializing in cardiac imaging, Medical imaging researcher, Health Data Scientist, Expert in machine learning (ML) and artificial intelligence (AI), Software developer specializing in health, Data security and privacy expert
                    """
            },
        ]
        prompt = FewShotPromptTemplate(
            examples=examples,
            example_prompt=example_prompt,
            suffix=
            """"
                The examples above show you how you should procede to respond to any question. For each question try to think of the needs and suggest key experts to fulfill those needs.
                Make sure that each experts that you suggest is important and relevant to the question.
                Always emphasizes artificial intelligence, data security, confidentiality, health when it is necessary.
                Just return the final answer with nothing else for example don't say: the final answer is ...
                Only return the list of experts profiles separated by a comma
                {format_instructions}
                Question: {input}""",
            input_variables=["input"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )
        return prompt

    @staticmethod
    def get_generic_profiles(prompt: PromptTemplate, query: str, llm_name: str, llm_temperature: float):
        llm = Ollama(base_url="http://localhost:11434", model=llm_name, temperature=llm_temperature)
        parser = PydanticOutputParser(pydantic_object=Experts)
        query = GoogleTranslator(source='auto', target='en').translate(query)
        input1 = prompt.format(input=query)
        output = llm(input1)
        profiles = parser.parse(output)
        return profiles

    @staticmethod
    def load_json(path: str):
        import json
        f = open(path, encoding='utf8')
        data = json.load(f)
        return data

    @staticmethod
    def update_users(users: list[User], linkdin_data):
        for profile in linkdin_data['profiles']:
            user_profile = linkdin_data['profiles'][profile]
            for user in users:
                if str(user_profile['name']).__contains__(user.first_name) and str(user_profile['name']).__contains__(user.last_name):
                    for experience in user_profile['experiences']:
                        if str(experience['description']) != "" and str(experience['description']) != "<not serializable>":
                            skill = GoogleTranslator(source='auto', target='en').translate(str(experience['description']))
                            splits = skill.split(".")
                            for split in splits:
                                user.linldinSkills.append(split)
                    break
        return users

    def init_chroma_db_collection(self):
        collection = self.chroma_db_client.get_or_create_collection(name="experts")
        skills = []
        sources = []
        for user in self.users:
            for skill in user.linldinSkills:
                skills.append(skill)
                sources.append({"user_id": user.user_id, "first_name": user.first_name, "last_name": user.last_name})

        ids = [str(i) for i in range(len(skills))]
        collection.add(
            documents=skills,
            metadatas=sources,
            ids=ids)
        return collection

    def get_experts_recommendation(self, question: str):

        skills_needed = self.get_generic_profiles(self.get_generic_profiles_prompt(), question, "mistral:instruct", 0.1).profiles

        result = self.chroma_db_collection.query(
            query_texts=skills_needed,
            n_results=25
        )
        experts = {"experts": []}
        metadatas = result['metadatas']
        distances = result['distances']
        for i, metadata_list in enumerate(metadatas):
            tab = []
            id_list = set()
            for j, metadata in enumerate(metadata_list):
                similarity_score = distances[i][j]
                if similarity_score <= 1 and metadata['user_id'] not in id_list:
                    user = self.find_user(self.users, metadata['user_id'])
                    tab.append({"first_name": user.first_name,
                                "last_name": user.last_name,
                                "skills": user.skills,
                                "tags": user.tags,
                                "years_experience_ia": user.years_experience_ia,
                                "years_experience_healthcare": user.years_experience_healthcare,
                                "score": similarity_score})
                    id_list.add(metadata['user_id'])
            skill_needed = GoogleTranslator(source='auto', target='fr').translate(skills_needed[i])
            experts['experts'].append({"categorie": skill_needed, "recommendation": tab})

        return experts

    @staticmethod
    def find_user(users: list[User], user_id: str):
        for user in users:
            if user.user_id == user_id:
                return user
