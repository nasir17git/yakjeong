from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import room, participant, response
from app.api.v1 import rooms, participants, responses

# 데이터베이스 테이블 생성
room.Base.metadata.create_all(bind=engine)
participant.Base.metadata.create_all(bind=engine)
response.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Yakjeong API",
    description="일정 조율 서비스 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
    return {"message": "Yakjeong API Server"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
