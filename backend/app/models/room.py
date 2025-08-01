from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    room_type = Column(Integer, nullable=False)  # 1: 시간기준, 2: 블럭기준, 3: 날짜기준
    creator_name = Column(String(100), nullable=False)
    max_participants = Column(Integer)
    deadline = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # 관계 설정
    participants = relationship("Participant", back_populates="room", cascade="all, delete-orphan")
