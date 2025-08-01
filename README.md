# YakJeong (약정) - 약속 결정 서비스

약속과 결정을 쉽게! 참여자들의 가능한 시간을 수집하고 최적의 시간을 찾아주는 웹 서비스입니다.

## 🚀 빠른 시작

### 사전 요구사항
- Docker & Docker Compose
- Git

### 실행 방법

1. **프로젝트 클론**
```bash
git clone <repository-url>
cd yakjeong
```

2. **서비스 시작**
```bash
./start.sh
```

3. **브라우저에서 접속**
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8000
- API 문서: http://localhost:8000/docs

## 📋 주요 기능

### 🎯 3가지 조율 방식
- **시간 기준**: 24시간 중 가능한 시간대 선택
- **날짜 기준**: 여러 날짜 중 가능한 날짜 선택  
- **블럭 기준**: 미리 설정된 시간 블럭 선택

### ✨ 핵심 기능
- 방 생성 및 관리
- 참여자 응답 수집
- 최적 시간대 자동 계산
- 실시간 결과 확인
- 간편한 링크 공유

### 🔒 개인정보 보호
- **개별 링크 접근**: 모든 방은 고유한 링크를 통해서만 접근 가능
- **링크 기반 보안**: 링크를 알지 못하면 방에 접근할 수 없음
- **공개 목록 없음**: 생성된 방의 공개 목록이 없어 개인정보 보호

## 🏗️ 기술 스택

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **SQLAlchemy**: ORM 및 데이터베이스 관리
- **SQLite**: 로컬 개발용 데이터베이스
- **Pydantic**: 데이터 검증 및 직렬화

### Frontend
- **React 18**: 사용자 인터페이스
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **React Query**: 서버 상태 관리
- **Zustand**: 클라이언트 상태 관리
- **React Router**: 라우팅

## 📁 프로젝트 구조

```
yakjeong/
├── backend/                 # FastAPI 백엔드
│   ├── app/
│   │   ├── models/         # 데이터베이스 모델
│   │   ├── schemas/        # Pydantic 스키마
│   │   ├── api/           # API 라우터
│   │   └── services/      # 비즈니스 로직
│   └── requirements.txt
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── services/     # API 서비스
│   │   └── types/        # TypeScript 타입
│   └── package.json
└── docker-compose.yml     # 개발 환경 설정
```

## 🔧 개발 명령어

### 전체 서비스
```bash
# 서비스 시작
./start.sh

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 컨테이너 상태 확인
docker-compose ps
```

### 백엔드 개발
```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행
uvicorn app.main:app --reload
```

### 프론트엔드 개발
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 📖 API 문서

서비스 실행 후 http://localhost:8000/docs 에서 자동 생성된 API 문서를 확인할 수 있습니다.

### 주요 엔드포인트

#### 방 관리
- `POST /api/v1/rooms/` - 방 생성
- `GET /api/v1/rooms/{room_id}` - 방 정보 조회
- `GET /api/v1/rooms/{room_id}/optimal-times` - 최적 시간대 조회

#### 참여자 관리
- `POST /api/v1/participants/` - 참여자 생성
- `GET /api/v1/participants/room/{room_id}` - 방의 참여자 목록

#### 응답 관리
- `POST /api/v1/responses/` - 응답 생성/수정
- `GET /api/v1/responses/participant/{participant_id}` - 참여자 응답 조회

## 🎨 사용 방법

### 1. 방 만들기
1. "새 방 만들기" 클릭
2. 방 제목, 설명, 조율 방식 선택
3. 생성자 이름 입력
4. 선택사항: 최대 참여자 수, 마감일 설정
5. **방 생성 후 제공되는 링크들을 참여자들에게 공유**

### 2. 참여하기
1. 공유받은 참여 링크 접속
2. 이름 입력
3. 가능한 시간/날짜 선택
4. 응답 제출

### 3. 결과 확인
1. 결과 링크 접속 또는 방 정보에서 "결과 보기" 클릭
2. 최적 시간대 확인
3. 참여자별 응답 현황 확인

## 🔗 링크 유형

방 생성 후 3가지 링크가 제공됩니다:

- **방 정보 링크**: `/room/{id}` - 방 정보 및 참여자 현황 확인
- **참여 링크**: `/room/{id}/participate` - 직접 응답 참여
- **결과 링크**: `/room/{id}/results` - 최적 시간대 및 결과 확인

## 🔍 문제 해결

### 서비스가 시작되지 않는 경우
```bash
# Docker 상태 확인
docker --version
docker-compose --version

# 포트 충돌 확인
lsof -i :3000  # 프론트엔드 포트
lsof -i :8000  # 백엔드 포트

# 컨테이너 재시작
docker-compose down
docker-compose up --build
```

### 데이터베이스 초기화
```bash
# 백엔드 컨테이너 접속
docker-compose exec backend bash

# 데이터베이스 파일 삭제 (주의: 모든 데이터 삭제됨)
rm -f /app/data/yakjeong.db

# 서비스 재시작
docker-compose restart backend
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

**YakJeong** - 약속 결정을 쉽고 빠르게! 🎯
