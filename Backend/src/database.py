import csv
import json
import os
from dataclasses import dataclass
from datetime import datetime, date
from logging import Logger
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, Text, Date, Float
from sqlalchemy.orm import scoped_session
from typing import TypeVar, Type, Optional
from settings import SERVER_SETTINGS
from ai import LLM


class Database:
    db: SQLAlchemy = SQLAlchemy()
    T = TypeVar('T', int, float)
    user_attributes_to_csv_columns_map = {
        "registration_date": 0,
        "first_name": 1,
        "last_name": 2,
        "email": 3,
        "membership_category": 4,
        "job_position": 5,
        "affiliation_organization": 6,
        "skills": 7,
        "years_experience_ia": 8,
        "years_experience_healthcare": 9,
        "community_involvement": 10,
        "suggestions": 11,
        "consent": 12,
        "profile_photo": 13,
        "linkedin": 14
    }

    required_columns = [
        "Date d'inscription",
        "Prénom",
        "Nom",
        "Adresse courriel",
        "Catégorie de membres",
        "Titre d'emploi",
        "Organisation d'affiliation",
        "Compétences ou Expertise",
        "Nombre d'années d'expérience en IA",
        "Nombre d'années d'expérience en santé",
        "Impliquation dans la communauté",
        "Suggestions",
        "Consentement",
        "Photo de profil",
        "LinkedIn"
    ]

    def __init__(self, app: Flask, llm: LLM, app_logger: Logger):
        self.__database_directory: str = os.path.abspath(SERVER_SETTINGS['database_directory'])
        self.app: Flask = app
        self.llm: LLM = llm
        self.app_logger: Logger = app_logger
        self.session: scoped_session = self.db.session
        self.is_available: bool = False

    def init(self) -> None:
        with self.app.app_context():
            try:
                if not os.path.exists(self.__database_directory):
                    os.makedirs(self.__database_directory)

                self.app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{self.__database_directory}/{SERVER_SETTINGS['sqlite_db']}"
                self.db.init_app(self.app)
                self.db.create_all()

                if self.is_empty():
                    self.populate(SERVER_SETTINGS["users_csv_file"])

            except Exception as e:
                self.session.rollback()
                self.app_logger.error(msg=str(e), exc_info=True)
            else:
                self.is_available = True
                self.app_logger.info(msg="The database has been successfully initialized.")

    def get_date(self, date_string: str) -> Optional[date]:
        try:
            formatted_date = datetime.strptime(date_string, "%m/%d/%Y %H:%M:%S").date()
        except ValueError as e:
            self.app_logger.error(msg=str(e), exc_info=True)
            return None
        else:
            return formatted_date

    def get_number(self, number_string: str, t: Type[T]) -> Optional[T]:
        try:
            number = t(number_string)
        except ValueError as e:
            self.app_logger.error(msg=str(e), exc_info=True)
            return None
        else:
            return number

    def create_user_from_csv_row(self, row: list[str]):
        return User(
            registration_date=self.get_date(row[self.user_attributes_to_csv_columns_map["registration_date"]]),
            first_name=row[self.user_attributes_to_csv_columns_map["first_name"]],
            last_name=row[self.user_attributes_to_csv_columns_map["last_name"]],
            email=row[self.user_attributes_to_csv_columns_map["email"]],
            membership_category=row[self.user_attributes_to_csv_columns_map["membership_category"]],
            job_position=row[self.user_attributes_to_csv_columns_map["job_position"]],
            affiliation_organization=row[self.user_attributes_to_csv_columns_map["affiliation_organization"]],
            skills=row[self.user_attributes_to_csv_columns_map["skills"]],
            years_experience_ia=self.get_number(row[self.user_attributes_to_csv_columns_map["years_experience_ia"]], float),
            years_experience_healthcare=self.get_number(row[self.user_attributes_to_csv_columns_map["years_experience_healthcare"]], float),
            community_involvement=row[self.user_attributes_to_csv_columns_map["community_involvement"]],
            suggestions=row[self.user_attributes_to_csv_columns_map["suggestions"]],
            tags=', '.join(self.llm.query_llm('get_keywords', [row[self.user_attributes_to_csv_columns_map["skills"]]])),
            consent=row[self.user_attributes_to_csv_columns_map["consent"]],
            profile_photo=row[self.user_attributes_to_csv_columns_map["profile_photo"]],
            linkedin=row[self.user_attributes_to_csv_columns_map["linkedin"]]
        )

    def is_empty(self) -> bool:
        with self.app.app_context():
            return len(self.session.query(User).all()) == 0

    def populate(self, users_csv_file: str) -> None:
        with self.app.app_context():
            data = self.read_csv(users_csv_file)

            for row in data[1:]:  # Skip the header row.
                user = self.create_user_from_csv_row(row)
                self.session.add(user)

            self.session.commit()

    def update(self, users_csv_file: str) -> None:
        with self.app.app_context():
            try:
                self.is_available = False
                data = self.read_csv(users_csv_file)

                for row in data[1:]:  # Skip the header row.
                    user = User.query.filter(User.email == row[3]).first()

                    if user:
                        for attr, index in self.user_attributes_to_csv_columns_map.items():
                            if attr == "registration_date":
                                new_value = self.get_date(row[index])
                            elif attr in ["years_experience_ia", "years_experience_healthcare"]:
                                new_value = self.get_number(row[index], float)
                            else:
                                new_value = row[index]

                            if getattr(user, attr) != new_value:
                                setattr(user, attr, new_value)
                                if attr == "skills":
                                    setattr(user, "tags", ', '.join(self.llm.query_llm('get_keywords', [new_value])))
                                    self.llm.query_llm('update_expert_in_vector_store', [new_value, user.email])
                    else:
                        new_user = self.create_user_from_csv_row(row)
                        self.session.add(new_user)
                        self.llm.query_llm('add_expert_to_vector_store', [new_user.skills, new_user.email])

                self.session.commit()
            except Exception as e:
                self.session.rollback()
                self.app_logger.error(msg=str(e), exc_info=True)
            else:
                self.is_available = True
                self.app_logger.info(msg="The database has been successfully updated.")

    @staticmethod
    def read_csv(file_path: str) -> list[list[str]]:
        data = []

        with open(file_path, 'r') as file:
            reader = csv.reader(file)
            for row in reader:
                data.append(row)

        return data

    @staticmethod
    def write_csv(file_path: str, data: list[list[str]]) -> None:
        with open(file_path, 'w') as file:
            writer = csv.writer(file)
            writer.writerows(data)

    def delete_user_from_csv(self, user_email: str) -> None:
        data = self.read_csv(SERVER_SETTINGS["users_csv_file"])
        updated_data = []

        for row in data:
            if row[self.user_attributes_to_csv_columns_map["email"]] == user_email:
                continue
            updated_data.append(row)

        if len(data) == len(updated_data):
            raise Exception("User not found in the csv file. There is probably an inconsistency between the sqlite database and the csv file.")

        self.write_csv(SERVER_SETTINGS["users_csv_file"], updated_data)

    def update_user_in_csv(self, user_email: str, user_information_to_be_updated: dict) -> None:
        data = self.read_csv(SERVER_SETTINGS["users_csv_file"])
        user = []

        for row in data[1:]:  # Skip the header row.
            if row[self.user_attributes_to_csv_columns_map["email"]] == user_email:
                user = row
                break

        if not user:
            raise Exception("User not found in the csv file. There is probably an inconsistency between the sqlite database and the csv file.")

        for key, value in user_information_to_be_updated.items():
            user[self.user_attributes_to_csv_columns_map[key]] = value

        self.write_csv(SERVER_SETTINGS["users_csv_file"], data)

    @staticmethod
    def __get_expert_skills_from_json(json_file_path: str, expert_email: str) -> str:
        expert_skills = ''

        with open(json_file_path, 'r') as json_file:
            data = json.load(json_file)

            for user in data['profiles']:
                if expert_email == data['profiles'][user]['email']:
                    for experience in data['profiles'][user]['experiences']:
                        if experience['description']:
                            expert_skills += experience['description'] + '\n'
                    break

        return expert_skills

    def validate_csv(self, users_csv_file: str):
        headers = self.read_csv(users_csv_file)[0]

        # Check if all required columns are present
        missing_columns = [col for col in self.required_columns if col not in headers]

        if missing_columns:
            return False, f"Missing columns: {', '.join(missing_columns)}"

        # Check if the order of columns is correct
        if headers != self.required_columns:
            return False, "Incorrect column order."

        return True, "CSV file format is correct."


@dataclass
class User(Database.db.Model):
    __tablename__ = 'users'

    user_id: int = Column(Integer, primary_key=True)
    first_name: str = Column(Text, nullable=False)
    last_name: str = Column(Text, nullable=False)
    registration_date: datetime.date = Column(Date, nullable=True)
    email: str = Column(Text, unique=True, nullable=False)
    membership_category: str = Column(Text, nullable=True)
    job_position: str = Column(Text, nullable=True)
    affiliation_organization: str = Column(Text, nullable=True)
    skills: str = Column(Text, nullable=True)
    years_experience_ia: float = Column(Float, nullable=True)
    years_experience_healthcare: float = Column(Float, nullable=True)
    community_involvement: str = Column(Text, nullable=True)
    suggestions: str = Column(Text, nullable=True)
    tags: str = Column(Text, nullable=True)
    consent: str = Column(Text, nullable=True)
    profile_photo: str = Column(Text, nullable=True)
    linkedin: str = Column(Text, nullable=True)
