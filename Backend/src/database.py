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
        """
            Initialize the database.

            This method:
                1. Creates the database directory if it doesn't exist.
                2. Configures the SQLAlchemy database URI for SQLite.
                3. Initializes and binds the SQLAlchemy database to the Flask app.
                4. Creates all tables defined in the database model.
                5. Populates the database with data from the specified CSV file if it is empty.

            Returns:
                None
        """

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
        """
            Convert a date string to a date object.

            This method:
                1. Parses the input date string using the format "%m/%d/%Y %H:%M:%S".
                2. Returns the parsed date object if successful, otherwise logs an error and returns None.

            Parameters:
                date_string (str): The date string to convert.

            Returns:
                Optional[date]: The parsed date object or None if parsing fails.
        """

        try:
            formatted_date = datetime.strptime(date_string, "%m/%d/%Y %H:%M:%S").date()
        except ValueError as e:
            self.app_logger.error(msg=str(e), exc_info=True)
            return None
        else:
            return formatted_date

    def get_number(self, number_string: str, t: Type[T]) -> Optional[T]:
        """
            Convert a number string to a specified type.

            This method:
                1. Parses the input number string using the provided type 't'.
                2. Returns the parsed number object if successful, otherwise logs an error and returns None.

            Parameters:
                number_string (str): The number string to convert.
                t (Type[T]): The target type for conversion.

            Returns:
                Optional[T]: The parsed number object of type 't' or None if parsing fails.
        """

        try:
            number = t(number_string)
        except ValueError as e:
            self.app_logger.error(msg=str(e), exc_info=True)
            return None
        else:
            return number

    def create_user_from_csv_row(self, row: list[str]):
        """
            Create a User instance from a CSV row.

            This method:
                1. Extracts values from the provided CSV row using attribute-to-column mappings.
                2. Converts date and number strings to appropriate types.
                3. Queries LLM to get keywords based on user skills.
                4. Constructs and returns a User instance with the extracted values.

            Parameters:
                row (list[str]): The CSV row containing user data.

            Returns:
                User: The created User instance.
        """

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
        """
            Check if the User table in the database is empty.

            This method:
                1. Queries the User table to retrieve all records.
                2. Returns True if the table is empty, False otherwise.

            Returns:
                bool: True if the User table is empty, False otherwise.
        """

        with self.app.app_context():
            return len(self.session.query(User).all()) == 0

    def populate(self, users_csv_file: str) -> None:
        """
            Populate the User table in the database with data from a CSV file.

            This method:
                1. Reads data from the specified CSV file, skipping the header row.
                2. Creates a User instance for each row and adds it to the database session.
                3. Commits the changes to persist the data in the User table.

            Parameters:
                users_csv_file (str): The path to the CSV file containing user data.

            Returns:
                None
        """

        with self.app.app_context():
            data = self.read_csv(users_csv_file)

            for row in data[1:]:  # Skip the header row.
                user = self.create_user_from_csv_row(row)
                self.session.add(user)

            self.session.commit()

    def update(self, users_csv_file: str) -> None:
        """
            Update the User table in the database based on data from a CSV file.

            This method:
                1. Reads data from the specified CSV file, skipping the header row.
                2. For each row:
                    - Retrieves the corresponding User instance from the database.
                    - Updates User attributes if values differ, including date and number conversions.
                    - Adds a new User if not found in the database.
                3. Commits the changes to persist the updated data in the User table.

            Parameters:
                users_csv_file (str): The path to the CSV file containing user data.

            Returns:
                None
        """

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
        """
            Read data from a CSV file.

            This static method:
                1. Opens the specified CSV file in read mode.
                2. Uses the CSV reader to iterate over rows and appends them to a list.
                3. Returns the list containing CSV data.

            Parameters:
                file_path (str): The path to the CSV file.

            Returns:
                list[list[str]]: A list of lists, where each inner list represents a row of the CSV file.
        """

        data = []

        with open(file_path, 'r') as file:
            reader = csv.reader(file)
            for row in reader:
                data.append(row)

        return data

    @staticmethod
    def write_csv(file_path: str, data: list[list[str]]) -> None:
        """
            Write data to a CSV file.

            This static method:
                1. Opens the specified CSV file in write mode.
                2. Uses the CSV writer to write rows of data to the file.

            Parameters:
                file_path (str): The path to the CSV file.
                data (list[list[str]]): A list of lists, where each inner list represents a row of data.

            Returns:
                None
        """

        with open(file_path, 'w') as file:
            writer = csv.writer(file)
            writer.writerows(data)

    def delete_user_from_csv(self, user_email: str) -> None:
        """
            Delete a user's data from the CSV file.

            This method:
                1. Reads data from the users CSV file.
                2. Creates a new list excluding the row with the specified user_email.
                3. Writes the updated data back to the CSV file.

            Parameters:
                user_email (str): The email of the user to be deleted.

            Returns:
                None

            Raises:
                Exception: If the user is not found in the CSV file, indicating a potential inconsistency.
        """

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
        """
            Update user information in the CSV file.

            This method:
                1. Reads data from the users CSV file.
                2. Finds the user's row based on the specified user_email.
                3. Updates the user's information with the provided dictionary.
                4. Writes the updated data back to the CSV file.

            Parameters:
                user_email (str): The email of the user to be updated.
                user_information_to_be_updated (dict): A dictionary containing key-value pairs of information to be updated.

            Returns:
                None

            Raises:
                Exception: If the user is not found in the CSV file, indicating a potential inconsistency.
        """

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
        """
            Extract expert skills from a JSON file.

            This static method:
                1. Reads data from the specified JSON file.
                2. Searches for the expert's email in the JSON data.
                3. Retrieves and concatenates the descriptions of experiences related to the expert's skills.

            Parameters:
                json_file_path (str): The path to the JSON file containing expert profiles.
                expert_email (str): The email of the expert to retrieve skills for.

            Returns:
                str: A string containing concatenated descriptions of experiences related to the expert's skills.
        """

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

    def validate_csv(self, users_csv_file: str) -> tuple[bool, str]:
        """
            Validate the format of a CSV file.

            This method:
                1. Reads the headers from the specified CSV file.
                2. Checks if all required columns are present.
                3. Verifies the correct order of columns.

            Parameters:
                users_csv_file (str): The path to the CSV file to be validated.

            Returns:
                Tuple[bool, str]: A tuple indicating whether the CSV file is valid (True/False) and a message.
        """

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
    """
        Represents a user in the application.

        Attributes:
            user_id (int): The unique identifier for the user (primary key).
            first_name (str): The user's first name.
            last_name (str): The user's last name.
            registration_date (datetime.date): The date when the user registered (nullable).
            email (str): The unique email address of the user (unique, not nullable).
            membership_category (str): The category of membership for the user (nullable).
            job_position (str): The user's job position (nullable).
            affiliation_organization (str): The organization the user is affiliated with (nullable).
            skills (str): The skills possessed by the user (nullable).
            years_experience_ia (float): The years of experience in artificial intelligence (nullable).
            years_experience_healthcare (float): The years of experience in healthcare (nullable).
            community_involvement (str): The user's involvement in the community (nullable).
            suggestions (str): Any suggestions provided by the user (nullable).
            tags (str): Keywords associated with the user's skills (nullable).
            consent (str): User's consent information (nullable).
            profile_photo (str): The filename of the user's profile photo (nullable).
            linkedin (str): The user's LinkedIn profile link (nullable).
    """

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
