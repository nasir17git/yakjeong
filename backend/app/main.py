from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 데이터베이스 및 모델 import
from app.database import engine, Base

# 모델들을 먼저 import (테이블 생성을 위해)
from app.models import room, participant, response

# API 라우터 import
from app.api.v1 import rooms, participants, responses

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="YakJeong API",
    description="약속 결정 서비스 API",
    version="1.0.0"
)

# CORS 설정 - 개발 환경용
# 프로덕션에서는 실제 도메인으로 변경 필요
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # 프로덕션에서 변경 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(rooms.router, prefix="/api/v1/rooms", tags=["rooms"])
app.include_router(participants.router, prefix="/api/v1/participants", tags=["participants"])
app.include_router(responses.router, prefix="/api/v1/responses", tags=["responses"])

@app.get("/")
async def root():
    return {"message": "YakJeong API Server"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
