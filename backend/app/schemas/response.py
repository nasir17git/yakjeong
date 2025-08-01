from pydantic import BaseModel
from typing import Any, Dict, List
from datetime import datetime

class ResponseBase(BaseModel):
    response_data: Dict[str, Any]

class ResponseCreate(ResponseBase):
    participant_id: str

class ResponseUpdate(BaseModel):
    response_data: Dict[str, Any]

class ResponseResponse(ResponseBase):
    id: str
    participant_id: str
    version: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class OptimalTimeSlot(BaseModel):
    time_slot: str
    available_participants: List[str]
    participant_count: int
    availability_rate: float
