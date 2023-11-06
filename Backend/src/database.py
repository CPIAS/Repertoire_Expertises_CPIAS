import csv
import os
import logging
from dataclasses import dataclass
from datetime import datetime, date
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
    user_attributes_to_csv_columns_map = [
        ("registration_date", 1),
        ("first_name", 2),
        ("last_name", 3),
        ("email", 4),
        ("membership_category", 5),
        ("membership_category_other", 6),
        ("job_position", 7),
        ("affiliation_organization", 8),
        ("affiliation_organization_other", 9),
        ("skills", 10),
        ("years_experience_ia", 11),
        ("years_experience_healthcare", 12),
        ("community_involvement", 13),
        ("suggestions", 14),
    ]

    def __init__(self, app: Flask, llm: LLM):
        self.__database_directory: str = os.path.abspath(SERVER_SETTINGS['database_directory'])
        self.app: Flask = app
        self.llm: LLM = llm
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
                logging.error(msg=str(e), exc_info=True)
            else:
                self.is_available = True
                logging.info(msg="The database has been successfully initialized.")

    @staticmethod
    def get_date(date_string: str) -> Optional[date]:
        try:
            formatted_date = datetime.strptime(date_string, "%m-%d-%Y %H:%M:%S").date()
        except ValueError as e:
            logging.error(msg=str(e), exc_info=True)
            return None
        else:
            return formatted_date

    @staticmethod
    def get_number(number_string: str, t: Type[T]) -> Optional[T]:
        try:
            number = t(number_string)
        except ValueError as e:
            logging.error(msg=str(e), exc_info=True)
            return None
        else:
            return number

    def create_user_from_csv_row(self, row: list[str]):
        return User(
            user_id=self.get_number(row[0], int),
            registration_date=self.get_date(row[1]),
            first_name=row[2],
            last_name=row[3],
            email=row[4],
            membership_category=row[5],
            membership_category_other=row[6],
            job_position=row[7],
            affiliation_organization=row[8],
            affiliation_organization_other=row[9],
            skills=row[10],
            years_experience_ia=self.get_number(row[11], float),
            years_experience_healthcare=self.get_number(row[12], float),
            community_involvement=row[13],
            suggestions=row[14],
            tags=', '.join(self.llm.get_keywords(row[10]))
        )

    def is_empty(self) -> bool:
        with self.app.app_context():
            return len(self.session.query(User).all()) == 0

    def populate(self, users_csv_file: str) -> None:
        with self.app.app_context():
            with open(users_csv_file, 'r') as csv_file:
                csv_file_reader = csv.reader(csv_file)
                next(csv_file_reader)  # Skip the header row.

                for row in csv_file_reader:
                    user = self.create_user_from_csv_row(row)
                    self.session.add(user)

                self.session.commit()

    def update(self, users_csv_file: str) -> None:
        with self.app.app_context():
            try:
                self.is_available = False
                with open(users_csv_file, 'r') as csv_file:
                    csv_file_reader = csv.reader(csv_file)
                    next(csv_file_reader)  # Skip the header row.

                    for row in csv_file_reader:
                        user_id = self.get_number(row[0], int)
                        user = self.session.get(User, user_id)

                        if user:
                            for attr, index in self.user_attributes_to_csv_columns_map:
                                if attr == "registration_date":
                                    new_value = self.get_date(row[index])
                                elif attr in ["years_experience_ia", "years_experience_healthcare"]:
                                    new_value = self.get_number(row[index], float)
                                else:
                                    new_value = row[index]

                                if getattr(user, attr) != new_value:
                                    setattr(user, attr, new_value)
                                    if attr == "skills":
                                        setattr(user, "tags", ', '.join(self.llm.get_keywords(new_value)))
                        else:
                            new_user = self.create_user_from_csv_row(row)
                            self.session.add(new_user)

                    self.session.commit()
            except Exception as e:
                self.session.rollback()
                logging.error(msg=str(e), exc_info=True)
            else:
                self.is_available = True
                logging.info(msg="The database has been successfully updated.")


@dataclass
class User(Database.db.Model):
    __tablename__ = 'users'

    user_id: int = Column(Integer, primary_key=True)
    first_name: str = Column(Text, nullable=True)
    last_name: str = Column(Text, nullable=True)
    registration_date: datetime.date = Column(Date, nullable=True)
    email: str = Column(Text, unique=True, nullable=False)
    membership_category: str = Column(Text, nullable=True)
    membership_category_other: str = Column(Text, nullable=True)
    job_position: str = Column(Text, nullable=True)
    affiliation_organization: str = Column(Text, nullable=True)
    affiliation_organization_other: str = Column(Text, nullable=True)
    skills: str = Column(Text, nullable=True)
    years_experience_ia: float = Column(Float, nullable=True)
    years_experience_healthcare: float = Column(Float, nullable=True)
    community_involvement: str = Column(Text, nullable=True)
    suggestions: str = Column(Text, nullable=True)
    tags: str = Column(Text, nullable=True)
