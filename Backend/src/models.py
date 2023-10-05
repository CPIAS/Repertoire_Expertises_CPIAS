from dataclasses import dataclass
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


@dataclass
class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.Text, nullable=True)
    last_name = db.Column(db.Text, nullable=True)
    subscription_date = db.Column(db.Date, nullable=True)
    email = db.Column(db.Text, unique=True, nullable=False)
    membership_category = db.Column(db.Text, nullable=True)
    membership_category_other = db.Column(db.Text, nullable=True)
    job_position = db.Column(db.Text, nullable=True)
    affiliation_organization = db.Column(db.Text, nullable=True)
    affiliation_organization_other = db.Column(db.Text, nullable=True)
    skills = db.Column(db.Text, nullable=True)
    years_experience_ia = db.Column(db.Float, nullable=True)
    years_experience_healthcare = db.Column(db.Float, nullable=True)
    community_involvement = db.Column(db.Text, nullable=True)
    suggestions = db.Column(db.Text, nullable=True)

    user_id: int
    first_name: str
    last_name: str
    subscription_date: datetime.date
    email: str
    membership_category: str
    membership_category_other: str
    job_position: str
    affiliation_organization: str
    affiliation_organization_other: str
    skills: str
    years_experience_ia: float
    years_experience_healthcare: float
    community_involvement: str
    suggestions: str
