from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any, TYPE_CHECKING, ForwardRef
from datetime import datetime

if TYPE_CHECKING:
    from .participant import ParticipantResponse

class TimeBlock(BaseModel):
    id: str
    name: str
    time_range: str
    memo: Optional[str] = None

class RoomBase(BaseModel):
    title: str
    description: Optional[str] = None
    room_type: int  # 1: 시간기준, 2: 블럭기준, 3: 날짜기준
    creator_name: str
    deadline: Optional[datetime] = None
    settings: Optional[Dict[str, Any]] = None  # 블럭 기준일 때 커스텀 블럭 정보 저장

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    settings: Optional[Dict[str, Any]] = None

class RoomResponse(RoomBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool

class RoomWithParticipants(RoomResponse):
    model_config = ConfigDict(from_attributes=True)
    
    participants: List[ForwardRef('ParticipantResponse')] = []
