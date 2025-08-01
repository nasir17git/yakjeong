from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from app.database import Base
from datetime import datetime
import uuid
import json

class Response(Base):
    __tablename__ = "responses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    participant_id = Column(String, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    _response_data = Column("response_data", Text, nullable=False)  # JSON 문자열로 저장
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)  # 활성화 상태
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    participant = relationship("Participant", back_populates="responses")
    
    @hybrid_property
    def response_data(self):
        """JSON 문자열을 파이썬 객체로 변환"""
        try:
            return json.loads(self._response_data)
        except (json.JSONDecodeError, TypeError):
            return {}
    
    @response_data.setter
    def response_data(self, value):
        """파이썬 객체를 JSON 문자열로 변환하여 저장 (한글 지원)"""
        if isinstance(value, str):
            # 이미 JSON 문자열인 경우
            self._response_data = value
        else:
            # 딕셔너리나 다른 객체인 경우
            self._response_data = json.dumps(value, ensure_ascii=False)
    
    def get_response_data(self):
        """JSON 문자열을 파이썬 객체로 변환 (하위 호환성)"""
        return self.response_data
    
    def set_response_data(self, data):
        """파이썬 객체를 JSON 문자열로 변환하여 저장 (하위 호환성)"""
        self.response_data = data
