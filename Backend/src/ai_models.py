from langchain.pydantic_v1 import BaseModel, Field
from typing import List


class Experts(BaseModel):
    profiles: List[str] = Field(description="the list of experts profiles")
