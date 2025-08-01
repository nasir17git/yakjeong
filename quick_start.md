# Yakjeong 빠른 시작 가이드

## 🚀 **5분 만에 개발 환경 구축하기**

### **1. 사전 요구사항**
```bash
# 필수 도구 설치 확인
docker --version          # Docker 20.10+
docker-compose --version  # Docker Compose 2.0+
python --version          # Python 3.11+
node --version            # Node.js 18+
npm --version             # npm 8+
```

### **2. 프로젝트 초기 설정**
```bash
# 프로젝트 클론 및 이동
cd /mnt/d/git/yakjeong

# 백엔드 환경 설정
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 기본 의존성 설치
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary redis python-dotenv pydantic[email]
pip freeze > requirements.txt

# 프론트엔드 환경 설정
cd ../frontend
npm create vite@latest . -- --template react-ts --force
npm install
npm install axios @tanstack/react-query zustand tailwindcss @types/node
```

### **3. Docker Compose로 전체 스택 실행**
```bash
# 루트 디렉토리에서 실행
cd /mnt/d/git/yakjeong
docker-compose up -d
```

### **4. 기본 파일 구조 생성**
```bash
# 백엔드 기본 구조 생성
mkdir -p backend/app/{models,schemas,api/v1,services,core,utils}
mkdir -p backend/tests/{test_api,test_services}
mkdir -p backend/alembic/versions

# 프론트엔드 기본 구조 생성
mkdir -p frontend/src/{components/{common,Room,Participant,Schedule},pages,hooks,services,store,types,utils}
```

## 📝 **핵심 파일 템플릿**

### **Backend 기본 설정**

#### 환경 설정 파일
```python
# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # 데이터베이스 설정
    database_url: str = "postgresql://user:password@localhost:5432/yakjeong"
    
    # Redis 설정
    redis_url: str = "redis://localhost:6379"
    
    # API 설정
    api_v1_str: str = "/api/v1"
    project_name: str = "Yakjeong"
    
    # CORS 설정
    backend_cors_origins: list[str] = ["http://localhost:3000"]
    
    # JWT 설정 (선택사항)
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
```

#### 데이터베이스 연결
```python
# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 메인 애플리케이션
```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title=settings.project_name,
    openapi_url=f"{settings.api_v1_str}/openapi.json"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Yakjeong API Server"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# API 라우터는 나중에 추가
# app.include_router(api_router, prefix=settings.api_v1_str)
```

### **Frontend 기본 설정**

#### 환경 설정
```typescript
// frontend/src/config/api.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  API_VERSION: '/api/v1',
  TIMEOUT: 10000,
};

export const WS_CONFIG = {
  BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000',
};
```

#### API 클라이언트
```typescript
// frontend/src/services/api.ts
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 오류 처리
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 메인 App 컴포넌트
```typescript
// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 페이지 컴포넌트들 (나중에 생성)
// import Home from './pages/Home';
// import CreateRoom from './pages/CreateRoom';
// import RoomDetail from './pages/RoomDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<div>Home Page (Coming Soon)</div>} />
            <Route path="/create" element={<div>Create Room (Coming Soon)</div>} />
            <Route path="/room/:id" element={<div>Room Detail (Coming Soon)</div>} />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

## 🐳 **Docker Compose 설정**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL 데이터베이스
  db:
    image: postgres:15
    container_name: yakjeong_db
    environment:
      POSTGRES_DB: yakjeong
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d yakjeong"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 캐시
  redis:
    image: redis:7-alpine
    container_name: yakjeong_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 백엔드 API 서버
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: yakjeong_backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/yakjeong
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # 프론트엔드 개발 서버
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: yakjeong_frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 🔧 **개발용 Dockerfile**

### **백엔드 개발용 Dockerfile**
```dockerfile
# backend/Dockerfile.dev
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 개발용 추가 패키지
RUN pip install pytest pytest-asyncio httpx

# 애플리케이션 코드 복사
COPY . .

EXPOSE 8000

# 개발 서버 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### **프론트엔드 개발용 Dockerfile**
```dockerfile
# frontend/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

EXPOSE 3000

# 개발 서버 실행
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## 🎯 **첫 번째 기능 구현 가이드**

### **1단계: 간단한 방 생성 API**
```python
# backend/app/models/room.py
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    room_type = Column(Integer, nullable=False)
    creator_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
```

```python
# backend/app/schemas/room.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RoomBase(BaseModel):
    title: str
    description: Optional[str] = None
    room_type: int
    creator_name: str

class RoomCreate(RoomBase):
    pass

class RoomResponse(RoomBase):
    id: str
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True
```

```python
# backend/app/api/v1/rooms.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomResponse

router = APIRouter()

@router.post("/", response_model=RoomResponse)
async def create_room(room_data: RoomCreate, db: Session = Depends(get_db)):
    room = Room(**room_data.dict())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room

@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
```

### **2단계: 프론트엔드 방 생성 폼**
```typescript
// frontend/src/components/Room/CreateRoomForm.tsx
import React, { useState } from 'react';
import api from '../../services/api';

interface CreateRoomFormProps {
  onSuccess?: (room: any) => void;
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room_type: 1,
    creator_name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/rooms/', formData);
      onSuccess?.(response.data);
      alert('방이 생성되었습니다!');
    } catch (error) {
      console.error('방 생성 실패:', error);
      alert('방 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">새 방 만들기</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">방 제목</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full p-2 border rounded-md"
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">방 유형</label>
        <select
          value={formData.room_type}
          onChange={(e) => setFormData({...formData, room_type: parseInt(e.target.value)})}
          className="w-full p-2 border rounded-md"
        >
          <option value={1}>시간 기준</option>
          <option value={2}>블럭 기준</option>
          <option value={3}>날짜 기준</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">생성자 이름</label>
        <input
          type="text"
          value={formData.creator_name}
          onChange={(e) => setFormData({...formData, creator_name: e.target.value})}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '생성 중...' : '방 만들기'}
      </button>
    </form>
  );
};

export default CreateRoomForm;
```

## ✅ **개발 시작 체크리스트**

- [ ] Docker 및 Docker Compose 설치 확인
- [ ] Python 3.11+ 및 Node.js 18+ 설치 확인
- [ ] 프로젝트 디렉토리 구조 생성
- [ ] 백엔드 가상환경 설정 및 의존성 설치
- [ ] 프론트엔드 Vite 프로젝트 생성 및 의존성 설치
- [ ] Docker Compose로 데이터베이스 및 Redis 실행
- [ ] 기본 FastAPI 앱 실행 확인 (http://localhost:8000)
- [ ] 기본 React 앱 실행 확인 (http://localhost:3000)
- [ ] API 문서 접근 확인 (http://localhost:8000/docs)

## 🚀 **다음 단계**

1. **데이터베이스 마이그레이션 설정** (Alembic)
2. **참여자 및 응답 모델 구현**
3. **WebSocket 실시간 통신 구현**
4. **일정 최적화 알고리즘 구현**
5. **프론트엔드 UI/UX 개선**
6. **테스트 코드 작성**
7. **배포 환경 구축**

이 가이드를 따라하시면 yakjeong 프로젝트를 빠르게 시작할 수 있습니다. 각 단계에서 문제가 발생하거나 추가 도움이 필요하시면 언제든 말씀해 주세요!
