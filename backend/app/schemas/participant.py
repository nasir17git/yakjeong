from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ParticipantBase(BaseModel):
    name: str

class ParticipantCreate(ParticipantBase):
    room_id: str

class ParticipantResponse(ParticipantBase):
    id: str
    room_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ParticipantWithResponses(ParticipantResponse):
    responses: List['ResponseResponse'] = []
    
    class Config:
        from_attributes = True

# Forward reference를 위한 import
from .response import ResponseResponse
ParticipantWithResponses.model_rebuild()
