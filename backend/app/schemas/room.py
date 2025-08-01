from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RoomBase(BaseModel):
    title: str
    description: Optional[str] = None
    room_type: int  # 1: 시간기준, 2: 블럭기준, 3: 날짜기준
    creator_name: str
    max_participants: Optional[int] = None
    deadline: Optional[datetime] = None

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    max_participants: Optional[int] = None
    deadline: Optional[datetime] = None

class RoomResponse(RoomBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class RoomWithParticipants(RoomResponse):
    participants: List['ParticipantResponse'] = []
    
    class Config:
        from_attributes = True

# Forward reference를 위한 import
from .participant import ParticipantResponse
RoomWithParticipants.model_rebuild()
