from langchain.pydantic_v1 import BaseModel, Field
from typing import List
class User:
    def __init__(self):
        self.user_id = ''
        self.first_name = ''
        self.last_name = ''
        self.skills = ''
        self.years_experience_ia = ''
        self.years_experience_healthcare = ''
        self.tags = ''
        self.linldinSkills:list[str] = []


class Experts(BaseModel):
    profiles: List[str] = Field(description="the list of experts profiles")