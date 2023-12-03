from langchain.pydantic_v1 import BaseModel, Field
from typing import List


class Experts(BaseModel):
    """
        Pydantic model representing a list of expert profiles.

        Attributes:
            profiles (List[str]): The list of expert profiles.
    """

    profiles: List[str] = Field(description="the list of experts profiles")
