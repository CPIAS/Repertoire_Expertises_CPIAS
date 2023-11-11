import csv
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
    user_attributes_to_csv_columns_map = [
        ("registration_date", 0),
        ("first_name", 1),
        ("last_name", 2),
        ("email", 3),
        ("membership_category", 4),
        ("job_position", 5),
        ("affiliation_organization", 6),
        ("skills", 7),
        ("years_experience_ia", 8),
        ("years_experience_healthcare", 9),
        ("community_involvement", 10),
        ("suggestions", 11),
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
            registration_date=self.get_date(row[0]),
            first_name=row[1],
            last_name=row[2],
            email=row[3],
            membership_category=row[4],
            job_position=row[5],
            affiliation_organization=row[6],
            skills=row[7],
            years_experience_ia=self.get_number(row[8], float),
            years_experience_healthcare=self.get_number(row[9], float),
            community_involvement=row[10],
            suggestions=row[11],
            tags=', '.join(self.llm.get_keywords(row[7]))
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
                        user = User.query.filter(User.email == row[3])

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
                self.app_logger.error(msg=str(e), exc_info=True)
            else:
                self.is_available = True
                self.app_logger.info(msg="The database has been successfully updated.")


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
