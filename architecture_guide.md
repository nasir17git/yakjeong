# 1. plan.md를 보고 이서비스에 적절한 시스템구조나 서비스 구성이나 기술스택등 권장해줘

# Yakjeong 프로젝트 아키텍처 가이드

## 🏗️ **권장 시스템 아키텍처**

### **전체 시스템 구조**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vue)   │◄──►│  (FastAPI)      │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - 방 생성/관리   │    │ - RESTful API   │    │ - 방 정보       │
│ - 응답 입력     │    │ - 비즈니스 로직  │    │ - 참여자 응답   │
│ - 결과 시각화   │    │ - 조율 알고리즘  │    │ - 이력 관리     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **마이크로서비스 아키텍처 (확장 시)**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Room Service  │    │Response Service │    │Schedule Service │
│                 │    │                 │    │                 │
│ - 방 생성/관리   │    │ - 참여자 응답    │    │ - 조율 알고리즘  │
│ - 권한 관리     │    │ - 이력 관리     │    │ - 최적화 계산   │
│ - 설정 변경     │    │ - 데이터 검증   │    │ - 결과 생성     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Message Queue  │
                    │   (SQS/SNS)     │
                    │                 │
                    │ - 이벤트 처리    │
                    │ - 비동기 작업   │
                    └─────────────────┘
```

## 🛠️ **상세 기술 스택**

### **Backend (Python)**
```yaml
Core Framework:
  FastAPI: 
    - 버전: 0.104+
    - 장점: 고성능, 자동 API 문서, 타입 힌트 지원
    - 비동기 처리로 높은 동시성 지원

Database ORM:
  SQLAlchemy:
    - 버전: 2.0+
    - Core + ORM 방식 혼용
    - 복잡한 쿼리 최적화 가능
  
  Alembic:
    - 데이터베이스 마이그레이션 관리
    - 버전 관리 및 롤백 지원

Data Validation:
  Pydantic:
    - 버전: 2.0+
    - 자동 데이터 검증 및 직렬화
    - FastAPI와 완벽 통합

Authentication:
  python-jose[cryptography]:
    - JWT 토큰 기반 인증
    - 이름 기반 간단 인증 구현

Testing:
  pytest:
    - 단위 테스트 및 통합 테스트
    - pytest-asyncio: 비동기 테스트
    - httpx: API 테스트 클라이언트

Additional Libraries:
  - uvicorn: ASGI 서버
  - python-multipart: 파일 업로드 지원
  - python-dotenv: 환경 변수 관리
  - celery: 백그라운드 작업 (선택사항)
```

### **Database**
```yaml
Primary Database:
  PostgreSQL 15+:
    - JSONB 필드로 유연한 응답 데이터 저장
    - 복잡한 시간 계산을 위한 날짜/시간 함수
    - 트랜잭션 지원으로 데이터 일관성 보장
    - 인덱싱 최적화

Cache Layer:
  Redis 7+:
    - 세션 데이터 저장
    - 방 정보 캐싱 (TTL 설정)
    - 실시간 데이터 임시 저장
    - Pub/Sub 기능으로 실시간 알림

Connection Pooling:
  - SQLAlchemy 커넥션 풀
  - Redis 커넥션 풀
  - 최적화된 커넥션 관리
```

### **Frontend**
```yaml
Option 1 (권장): React 18 + TypeScript
  Core:
    - React 18 (Concurrent Features)
    - TypeScript 5+
    - Vite (빌드 도구)
  
  State Management:
    - Zustand (가벼운 상태 관리)
    - 또는 Redux Toolkit (복잡한 상태)
  
  UI Framework:
    - Tailwind CSS 3+ (유틸리티 우선)
    - Headless UI (접근성 고려)
    - 또는 Ant Design (완성된 컴포넌트)
  
  Data Fetching:
    - TanStack Query (React Query)
    - Axios 또는 Fetch API
  
  Real-time:
    - Socket.IO Client
    - 또는 native WebSocket
  
  Visualization:
    - Chart.js 4+ (간단한 차트)
    - D3.js 7+ (복잡한 시각화)
    - Recharts (React 전용)

Option 2: Vue.js 3 + TypeScript
  Core:
    - Vue 3 (Composition API)
    - TypeScript
    - Vite
  
  State Management:
    - Pinia (Vue 3 권장)
  
  UI Framework:
    - Vuetify 3
    - 또는 Quasar Framework
```

## 🏛️ **AWS 인프라 구성**

### **컴퓨팅 서비스**
```yaml
Application Hosting:
  Amazon ECS Fargate:
    - 서버리스 컨테이너 실행
    - 자동 스케일링
    - 관리 오버헤드 최소화
    
  Alternative: AWS Lambda
    - 서버리스 함수
    - 간단한 API에 적합
    - 콜드 스타트 고려 필요

Load Balancing:
  Application Load Balancer (ALB):
    - HTTP/HTTPS 트래픽 분산
    - 헬스 체크 및 자동 복구
    - SSL/TLS 종료
    - WebSocket 지원
```

### **데이터베이스 서비스**
```yaml
Primary Database:
  Amazon RDS PostgreSQL:
    - Multi-AZ 배포 (고가용성)
    - 자동 백업 및 스냅샷
    - 읽기 전용 복제본 (성능 향상)
    - 자동 패치 관리

Cache:
  Amazon ElastiCache Redis:
    - 클러스터 모드 지원
    - 자동 장애 조치
    - 백업 및 복원
    - VPC 보안
```

### **스토리지 및 CDN**
```yaml
Static Assets:
  Amazon S3:
    - 프론트엔드 정적 파일 호스팅
    - 버전 관리
    - 라이프사이클 정책

Content Delivery:
  Amazon CloudFront:
    - 전 세계 엣지 로케이션
    - 캐싱 최적화
    - HTTPS 강제
    - 압축 지원
```

### **보안 및 모니터링**
```yaml
Security:
  AWS WAF:
    - 웹 애플리케이션 방화벽
    - DDoS 보호
    - SQL 인젝션 방지

  AWS Certificate Manager:
    - SSL/TLS 인증서 자동 관리
    - 무료 인증서 제공

Monitoring:
  Amazon CloudWatch:
    - 애플리케이션 메트릭
    - 로그 수집 및 분석
    - 알람 설정

  AWS X-Ray:
    - 분산 추적
    - 성능 분석
    - 병목 지점 식별
```

## 📊 **데이터베이스 스키마 설계**

### **핵심 테이블 구조**
```sql
-- 방 정보 테이블
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    room_type INTEGER NOT NULL, -- 1: 시간기준, 2: 블럭기준, 3: 날짜기준
    creator_name VARCHAR(100) NOT NULL,
    max_participants INTEGER,
    deadline TIMESTAMP WITH TIME ZONE,
    settings JSONB, -- 유연한 설정 저장
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 참여자 테이블
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, name) -- 방 내에서 이름 중복 방지
);

-- 응답 테이블
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    response_data JSONB NOT NULL, -- 시간대/날짜 선택 데이터
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 응답 이력 테이블
CREATE TABLE response_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    previous_data JSONB,
    action VARCHAR(50), -- 'create', 'update', 'delete'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_rooms_active ON rooms(is_active, created_at);
CREATE INDEX idx_participants_room ON participants(room_id);
CREATE INDEX idx_responses_participant ON responses(participant_id);
CREATE INDEX idx_response_history_response ON response_history(response_id, created_at);
```

## 🔧 **핵심 알고리즘 설계**

### **시간대 조율 알고리즘**
```python
from typing import List, Dict, Tuple
from datetime import datetime, timedelta

class ScheduleOptimizer:
    def __init__(self, room_type: int):
        self.room_type = room_type
    
    def find_optimal_times(self, responses: List[Dict]) -> List[Tuple[datetime, int]]:
        """
        최적의 시간대를 찾는 알고리즘
        
        Args:
            responses: 참여자들의 응답 데이터
            
        Returns:
            (시간대, 참여 가능 인원수) 튜플의 리스트
        """
        if self.room_type == 1:  # 시간 기준
            return self._optimize_hourly_schedule(responses)
        elif self.room_type == 2:  # 블럭 기준
            return self._optimize_block_schedule(responses)
        else:  # 날짜 기준
            return self._optimize_daily_schedule(responses)
    
    def _optimize_hourly_schedule(self, responses: List[Dict]) -> List[Tuple[datetime, int]]:
        """시간 단위 최적화"""
        time_counts = {}
        
        for response in responses:
            available_times = response.get('available_times', [])
            for time_slot in available_times:
                if time_slot not in time_counts:
                    time_counts[time_slot] = 0
                time_counts[time_slot] += 1
        
        # 참여 가능 인원수 기준으로 정렬
        sorted_times = sorted(
            time_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        return [(datetime.fromisoformat(time), count) 
                for time, count in sorted_times]
    
    def _calculate_overlap_score(self, responses: List[Dict]) -> Dict[str, float]:
        """겹치는 시간대의 점수 계산"""
        # 가중치 기반 점수 계산 로직
        pass
```

## 🚀 **배포 및 DevOps 전략**

### **컨테이너화**
```dockerfile
# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Docker Compose (개발환경)**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/yakjeong
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=yakjeong
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### **CI/CD 파이프라인**
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest
      
      - name: Run tests
        run: |
          cd backend
          pytest

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2
      
      - name: Build and push Docker images
        run: |
          # ECR 로그인
          aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin $ECR_REGISTRY
          
          # 백엔드 이미지 빌드 및 푸시
          docker build -t $ECR_REGISTRY/yakjeong-backend:latest ./backend
          docker push $ECR_REGISTRY/yakjeong-backend:latest
          
          # 프론트엔드 이미지 빌드 및 푸시
          docker build -t $ECR_REGISTRY/yakjeong-frontend:latest ./frontend
          docker push $ECR_REGISTRY/yakjeong-frontend:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster yakjeong-cluster --service yakjeong-backend --force-new-deployment
          aws ecs update-service --cluster yakjeong-cluster --service yakjeong-frontend --force-new-deployment
```

## 📈 **성능 최적화 전략**

### **데이터베이스 최적화**
```sql
-- 성능 향상을 위한 인덱스
CREATE INDEX CONCURRENTLY idx_rooms_deadline ON rooms(deadline) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_responses_data_gin ON responses USING GIN(response_data);

-- 파티셔닝 (대용량 데이터 처리 시)
CREATE TABLE response_history_2024 PARTITION OF response_history
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### **캐싱 전략**
```python
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expiration=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # 캐시에서 확인
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # 캐시 미스 시 실행
            result = await func(*args, **kwargs)
            
            # 결과 캐싱
            redis_client.setex(
                cache_key, 
                expiration, 
                json.dumps(result, default=str)
            )
            
            return result
        return wrapper
    return decorator

@cache_result(expiration=600)  # 10분 캐싱
async def get_room_optimal_times(room_id: str):
    # 복잡한 계산 로직
    pass
```

이 아키텍처 가이드를 기반으로 프로젝트를 시작하시면 확장 가능하고 안정적인 서비스를 구축할 수 있습니다. 각 단계별로 더 자세한 구현 가이드가 필요하시면 말씀해 주세요!
