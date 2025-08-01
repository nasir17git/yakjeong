from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid

class Participant(Base):
    __tablename__ = "participants"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id = Column(String, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    room = relationship("Room", back_populates="participants")
    responses = relationship("Response", back_populates="participant", cascade="all, delete-orphan")
    
    # 방 내에서 이름 중복 방지를 위한 유니크 제약조건은 애플리케이션 레벨에서 처리
