# Yakjeong 구현 가이드

## 📁 **상세 프로젝트 구조**

```
yakjeong/
├── backend/                          # Python FastAPI 백엔드
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI 애플리케이션 진입점
│   │   ├── config.py                 # 환경 설정 관리
│   │   ├── database.py               # 데이터베이스 연결 설정
│   │   ├── dependencies.py           # 의존성 주입
│   │   │
│   │   ├── models/                   # SQLAlchemy 데이터 모델
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # 기본 모델 클래스
│   │   │   ├── room.py              # 방 모델
│   │   │   ├── participant.py       # 참여자 모델
│   │   │   ├── response.py          # 응답 모델
│   │   │   └── history.py           # 이력 모델
│   │   │
│   │   ├── schemas/                  # Pydantic 스키마
│   │   │   ├── __init__.py
│   │   │   ├── room.py              # 방 관련 스키마
│   │   │   ├── participant.py       # 참여자 스키마
│   │   │   ├── response.py          # 응답 스키마
│   │   │   └── common.py            # 공통 스키마
│   │   │
│   │   ├── api/                      # API 라우터
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── rooms.py         # 방 관련 API
│   │   │   │   ├── participants.py  # 참여자 API
│   │   │   │   ├── responses.py     # 응답 API
│   │   │   │   └── analytics.py     # 분석 API
│   │   │   └── websocket.py         # WebSocket 핸들러
│   │   │
│   │   ├── services/                 # 비즈니스 로직
│   │   │   ├── __init__.py
│   │   │   ├── room_service.py      # 방 관리 서비스
│   │   │   ├── participant_service.py # 참여자 관리
│   │   │   ├── response_service.py   # 응답 관리
│   │   │   ├── schedule_optimizer.py # 일정 최적화 알고리즘
│   │   │   └── notification_service.py # 알림 서비스
│   │   │
│   │   ├── core/                     # 핵심 유틸리티
│   │   │   ├── __init__.py
│   │   │   ├── security.py          # 보안 관련
│   │   │   ├── cache.py             # 캐시 관리
│   │   │   └── exceptions.py        # 커스텀 예외
│   │   │
│   │   └── utils/                    # 유틸리티 함수
│   │       ├── __init__.py
│   │       ├── datetime_utils.py    # 날짜/시간 유틸
│   │       ├── validators.py        # 검증 함수
│   │       └── helpers.py           # 기타 도우미 함수
│   │
│   ├── alembic/                      # 데이터베이스 마이그레이션
│   │   ├── versions/
│   │   ├── env.py
│   │   └── alembic.ini
│   │
│   ├── tests/                        # 테스트 코드
│   │   ├── __init__.py
│   │   ├── conftest.py              # pytest 설정
│   │   ├── test_api/
│   │   │   ├── test_rooms.py
│   │   │   ├── test_participants.py
│   │   │   └── test_responses.py
│   │   ├── test_services/
│   │   │   ├── test_room_service.py
│   │   │   └── test_schedule_optimizer.py
│   │   └── test_utils/
│   │
│   ├── requirements.txt              # Python 의존성
│   ├── requirements-dev.txt          # 개발 의존성
│   ├── Dockerfile                    # Docker 이미지 빌드
│   ├── docker-compose.yml            # 로컬 개발 환경
│   └── .env.example                  # 환경 변수 예시
│
├── frontend/                         # React 프론트엔드
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/               # 재사용 가능한 컴포넌트
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Loading.tsx
│   │   │   │
│   │   │   ├── Room/
│   │   │   │   ├── RoomCard.tsx
│   │   │   │   ├── RoomForm.tsx
│   │   │   │   ├── RoomSettings.tsx
│   │   │   │   └── RoomHeader.tsx
│   │   │   │
│   │   │   ├── Participant/
│   │   │   │   ├── ParticipantList.tsx
│   │   │   │   ├── ParticipantForm.tsx
│   │   │   │   └── ParticipantCard.tsx
│   │   │   │
│   │   │   ├── Schedule/
│   │   │   │   ├── TimeSlotPicker.tsx
│   │   │   │   ├── DatePicker.tsx
│   │   │   │   ├── ScheduleGrid.tsx
│   │   │   │   └── OptimalTimeDisplay.tsx
│   │   │   │
│   │   │   └── Visualization/
│   │   │       ├── ParticipationChart.tsx
│   │   │       ├── TimelineChart.tsx
│   │   │       └── HeatmapChart.tsx
│   │   │
│   │   ├── pages/                    # 페이지 컴포넌트
│   │   │   ├── Home.tsx
│   │   │   ├── CreateRoom.tsx
│   │   │   ├── RoomDetail.tsx
│   │   │   ├── ParticipantResponse.tsx
│   │   │   └── Results.tsx
│   │   │
│   │   ├── hooks/                    # 커스텀 훅
│   │   │   ├── useRoom.ts
│   │   │   ├── useParticipant.ts
│   │   │   ├── useResponse.ts
│   │   │   └── useWebSocket.ts
│   │   │
│   │   ├── services/                 # API 서비스
│   │   │   ├── api.ts               # API 클라이언트 설정
│   │   │   ├── roomService.ts
│   │   │   ├── participantService.ts
│   │   │   └── responseService.ts
│   │   │
│   │   ├── store/                    # 상태 관리
│   │   │   ├── roomStore.ts
│   │   │   ├── participantStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── utils/                    # 유틸리티
│   │   │   ├── dateUtils.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── types/                    # TypeScript 타입 정의
│   │   │   ├── room.ts
│   │   │   ├── participant.ts
│   │   │   ├── response.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── styles/                   # 스타일 파일
│   │   │   ├── globals.css
│   │   │   └── components.css
│   │   │
│   │   ├── App.tsx                   # 메인 앱 컴포넌트
│   │   ├── main.tsx                  # 앱 진입점
│   │   └── vite-env.d.ts
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── infrastructure/                   # 인프라 코드 (IaC)
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── vpc/
│   │   │   ├── ecs/
│   │   │   ├── rds/
│   │   │   └── elasticache/
│   │   └── environments/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── prod/
│   │
│   └── cloudformation/               # 대안: CloudFormation
│       ├── network.yaml
│       ├── database.yaml
│       ├── application.yaml
│       └── monitoring.yaml
│
├── .github/                          # GitHub Actions
│   └── workflows/
│       ├── ci.yml                   # 지속적 통합
│       ├── cd.yml                   # 지속적 배포
│       └── security.yml             # 보안 스캔
│
├── docs/                            # 문서
│   ├── api/                         # API 문서
│   ├── deployment/                  # 배포 가이드
│   └── development/                 # 개발 가이드
│
├── scripts/                         # 유틸리티 스크립트
│   ├── setup.sh                    # 초기 설정
│   ├── deploy.sh                   # 배포 스크립트
│   └── backup.sh                   # 백업 스크립트
│
├── docker-compose.yml               # 전체 스택 개발 환경
├── docker-compose.prod.yml          # 프로덕션 환경
├── .gitignore
├── README.md
└── LICENSE
```

## 🚀 **단계별 구현 가이드**

### **Phase 1: 기본 인프라 구축 (1-2주)**

#### 1.1 개발 환경 설정
```bash
# 프로젝트 초기화
mkdir yakjeong && cd yakjeong
git init

# 백엔드 설정
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary redis python-dotenv
pip freeze > requirements.txt

# 프론트엔드 설정
cd ../
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios @tanstack/react-query zustand tailwindcss
```

#### 1.2 기본 FastAPI 앱 구조
```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import rooms, participants, responses
from app.database import engine
from app.models import base

# 데이터베이스 테이블 생성
base.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Yakjeong API",
    description="일정 조율 서비스 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(rooms.router, prefix="/api/v1/rooms", tags=["rooms"])
app.include_router(participants.router, prefix="/api/v1/participants", tags=["participants"])
app.include_router(responses.router, prefix="/api/v1/responses", tags=["responses"])

@app.get("/")
async def root():
    return {"message": "Yakjeong API Server"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### **Phase 2: 핵심 기능 구현 (3-4주)**

#### 2.1 데이터 모델 구현
```python
# backend/app/models/room.py
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.models.base import Base

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    room_type = Column(Integer, nullable=False)  # 1: 시간, 2: 블럭, 3: 날짜
    creator_name = Column(String(100), nullable=False)
    max_participants = Column(Integer)
    deadline = Column(DateTime(timezone=True))
    settings = Column(JSONB)  # 유연한 설정 저장
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # 관계 설정
    participants = relationship("Participant", back_populates="room", cascade="all, delete-orphan")
```

#### 2.2 API 엔드포인트 구현
```python
# backend/app/api/v1/rooms.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.room import RoomCreate, RoomResponse, RoomUpdate
from app.services.room_service import RoomService

router = APIRouter()

@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db)
):
    """새로운 방 생성"""
    room_service = RoomService(db)
    return await room_service.create_room(room_data)

@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: str,
    db: Session = Depends(get_db)
):
    """방 정보 조회"""
    room_service = RoomService(db)
    room = await room_service.get_room(room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return room

@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: str,
    room_update: RoomUpdate,
    db: Session = Depends(get_db)
):
    """방 정보 수정"""
    room_service = RoomService(db)
    return await room_service.update_room(room_id, room_update)

@router.get("/{room_id}/optimal-times")
async def get_optimal_times(
    room_id: str,
    db: Session = Depends(get_db)
):
    """최적 시간대 계산"""
    room_service = RoomService(db)
    return await room_service.calculate_optimal_times(room_id)
```

#### 2.3 비즈니스 로직 구현
```python
# backend/app/services/schedule_optimizer.py
from typing import List, Dict, Tuple, Any
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import json

class ScheduleOptimizer:
    def __init__(self, room_type: int):
        self.room_type = room_type
    
    async def find_optimal_times(self, responses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """최적의 시간대 찾기"""
        if self.room_type == 1:  # 시간 기준
            return await self._optimize_hourly_schedule(responses)
        elif self.room_type == 2:  # 블럭 기준
            return await self._optimize_block_schedule(responses)
        else:  # 날짜 기준
            return await self._optimize_daily_schedule(responses)
    
    async def _optimize_hourly_schedule(self, responses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """시간 단위 최적화 알고리즘"""
        time_availability = defaultdict(list)
        
        # 각 참여자의 가능한 시간대 수집
        for response in responses:
            participant_name = response.get('participant_name')
            available_times = response.get('response_data', {}).get('available_times', [])
            
            for time_slot in available_times:
                time_availability[time_slot].append(participant_name)
        
        # 참여 가능 인원수 기준으로 정렬
        optimal_times = []
        for time_slot, participants in time_availability.items():
            optimal_times.append({
                'time_slot': time_slot,
                'available_participants': participants,
                'participant_count': len(participants),
                'availability_rate': len(participants) / len(responses) if responses else 0
            })
        
        # 참여 가능 인원수 내림차순 정렬
        optimal_times.sort(key=lambda x: x['participant_count'], reverse=True)
        
        return optimal_times
    
    async def _calculate_conflict_score(self, responses: List[Dict[str, Any]]) -> Dict[str, float]:
        """시간대별 충돌 점수 계산"""
        conflict_scores = {}
        
        for response in responses:
            unavailable_times = response.get('response_data', {}).get('unavailable_times', [])
            for time_slot in unavailable_times:
                if time_slot not in conflict_scores:
                    conflict_scores[time_slot] = 0
                conflict_scores[time_slot] += 1
        
        return conflict_scores
    
    async def _optimize_with_priority(self, responses: List[Dict[str, Any]], priorities: Dict[str, int]) -> List[Dict[str, Any]]:
        """우선순위를 고려한 최적화"""
        weighted_availability = defaultdict(float)
        
        for response in responses:
            participant_name = response.get('participant_name')
            priority = priorities.get(participant_name, 1)  # 기본 우선순위 1
            available_times = response.get('response_data', {}).get('available_times', [])
            
            for time_slot in available_times:
                weighted_availability[time_slot] += priority
        
        # 가중치 기준으로 정렬
        optimal_times = []
        for time_slot, weight in weighted_availability.items():
            optimal_times.append({
                'time_slot': time_slot,
                'weighted_score': weight,
                'priority_adjusted': True
            })
        
        optimal_times.sort(key=lambda x: x['weighted_score'], reverse=True)
        return optimal_times
```

### **Phase 3: 프론트엔드 구현 (2-3주)**

#### 3.1 React 컴포넌트 구조
```typescript
// frontend/src/types/room.ts
export interface Room {
  id: string;
  title: string;
  description?: string;
  roomType: number;
  creatorName: string;
  maxParticipants?: number;
  deadline?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateRoomRequest {
  title: string;
  description?: string;
  roomType: number;
  creatorName: string;
  maxParticipants?: number;
  deadline?: string;
  settings?: Record<string, any>;
}
```

```typescript
// frontend/src/services/roomService.ts
import axios from 'axios';
import { Room, CreateRoomRequest } from '../types/room';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const roomService = {
  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    const response = await api.post('/rooms/', roomData);
    return response.data;
  },

  async getRoom(roomId: string): Promise<Room> {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },

  async updateRoom(roomId: string, roomData: Partial<Room>): Promise<Room> {
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
  },

  async getOptimalTimes(roomId: string): Promise<any[]> {
    const response = await api.get(`/rooms/${roomId}/optimal-times`);
    return response.data;
  },
};
```

#### 3.2 상태 관리 (Zustand)
```typescript
// frontend/src/store/roomStore.ts
import { create } from 'zustand';
import { Room } from '../types/room';
import { roomService } from '../services/roomService';

interface RoomState {
  currentRoom: Room | null;
  rooms: Room[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentRoom: (room: Room | null) => void;
  fetchRoom: (roomId: string) => Promise<void>;
  createRoom: (roomData: any) => Promise<Room>;
  updateRoom: (roomId: string, roomData: any) => Promise<void>;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoom: null,
  rooms: [],
  loading: false,
  error: null,

  setCurrentRoom: (room) => set({ currentRoom: room }),

  fetchRoom: async (roomId: string) => {
    set({ loading: true, error: null });
    try {
      const room = await roomService.getRoom(roomId);
      set({ currentRoom: room, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch room',
        loading: false 
      });
    }
  },

  createRoom: async (roomData) => {
    set({ loading: true, error: null });
    try {
      const room = await roomService.createRoom(roomData);
      set({ 
        rooms: [...get().rooms, room],
        currentRoom: room,
        loading: false 
      });
      return room;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create room',
        loading: false 
      });
      throw error;
    }
  },

  updateRoom: async (roomId: string, roomData: any) => {
    set({ loading: true, error: null });
    try {
      const updatedRoom = await roomService.updateRoom(roomId, roomData);
      set({ 
        currentRoom: updatedRoom,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update room',
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
```

### **Phase 4: 실시간 기능 및 최적화 (2주)**

#### 4.1 WebSocket 구현
```python
# backend/app/api/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except:
                    # 연결이 끊어진 경우 제거
                    self.active_connections[room_id].remove(connection)

manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # 메시지 타입에 따른 처리
            if message_data["type"] == "participant_joined":
                await manager.broadcast_to_room(
                    json.dumps({
                        "type": "participant_update",
                        "data": message_data["data"]
                    }),
                    room_id
                )
            elif message_data["type"] == "response_updated":
                await manager.broadcast_to_room(
                    json.dumps({
                        "type": "response_update",
                        "data": message_data["data"]
                    }),
                    room_id
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
```

#### 4.2 프론트엔드 WebSocket 훅
```typescript
// frontend/src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

interface UseWebSocketProps {
  roomId: string;
  onMessage?: (data: any) => void;
}

export const useWebSocket = ({ roomId, onMessage }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/${roomId}`;
    
    const connect = () => {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        setError(null);
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
      
      ws.current.onclose = () => {
        setIsConnected(false);
        // 재연결 시도
        setTimeout(connect, 3000);
      };
      
      ws.current.onerror = (error) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      ws.current?.close();
    };
  }, [roomId, onMessage]);

  const sendMessage = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, error, sendMessage };
};
```

이 구현 가이드를 따라 단계별로 개발하시면 안정적이고 확장 가능한 yakjeong 서비스를 구축할 수 있습니다. 각 단계에서 더 자세한 구현이 필요하시면 언제든 말씀해 주세요!
