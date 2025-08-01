from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid
import json

class Response(Base):
    __tablename__ = "responses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    participant_id = Column(String, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    response_data = Column(Text, nullable=False)  # JSON 문자열로 저장
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    participant = relationship("Participant", back_populates="responses")
    
    def get_response_data(self):
        """JSON 문자열을 파이썬 객체로 변환"""
        try:
            return json.loads(self.response_data)
        except:
            return {}
    
    def set_response_data(self, data):
        """파이썬 객체를 JSON 문자열로 변환하여 저장"""
        self.response_data = json.dumps(data)
