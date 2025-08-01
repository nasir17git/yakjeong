from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid
import json

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    room_type = Column(Integer, nullable=False)  # 1: 시간기준, 2: 블럭기준, 3: 날짜기준
    creator_name = Column(String(100), nullable=False)
    deadline = Column(DateTime)
    settings = Column(Text)  # JSON 문자열로 저장 (블럭 기준일 때 커스텀 블럭 정보)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # 관계 설정
    participants = relationship("Participant", back_populates="room", cascade="all, delete-orphan")
    
    def get_settings(self):
        """JSON 문자열을 파이썬 객체로 변환"""
        if not self.settings:
            return {}
        try:
            return json.loads(self.settings)
        except:
            return {}
    
    def set_settings(self, data):
        """파이썬 객체를 JSON 문자열로 변환하여 저장 (한글 지원)"""
        if data:
            self.settings = json.dumps(data, ensure_ascii=False)
        else:
            self.settings = None
