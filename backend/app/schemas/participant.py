from pydantic import BaseModel, ConfigDict
from typing import Optional, List, TYPE_CHECKING, ForwardRef
from datetime import datetime

if TYPE_CHECKING:
    from .response import ResponseResponse

class ParticipantBase(BaseModel):
    name: str

class ParticipantCreate(ParticipantBase):
    room_id: str

class ParticipantResponse(ParticipantBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    room_id: str
    created_at: datetime

class ParticipantWithResponses(ParticipantResponse):
    model_config = ConfigDict(from_attributes=True)
    
    responses: List[ForwardRef('ResponseResponse')] = []
