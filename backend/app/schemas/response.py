from pydantic import BaseModel, ConfigDict
from typing import Any, Dict, List
from datetime import datetime

class ResponseBase(BaseModel):
    response_data: Dict[str, Any]

class ResponseCreate(ResponseBase):
    participant_id: str

class ResponseUpdate(BaseModel):
    response_data: Dict[str, Any]

class ResponseResponse(ResponseBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    participant_id: str
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

class OptimalTimeSlot(BaseModel):
    time_slot: str
    available_participants: List[str]
    participant_count: int
    availability_rate: float
