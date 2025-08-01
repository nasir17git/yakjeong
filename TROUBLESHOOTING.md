# Yakjeong 문제 해결 가이드

## 🔧 일반적인 문제들

### 1. 백엔드 컨테이너가 시작되지 않는 경우

#### 증상
```
yakjeong_backend   | Traceback (most recent call last):
```

#### 해결 방법

**1단계: 로그 확인**
```bash
docker-compose logs backend
```

**2단계: 컨테이너 재빌드**
```bash
docker-compose down
docker-compose up --build backend
```

**3단계: 데이터베이스 초기화**
```bash
./reset_db.sh
./start.sh
```

### 2. 모듈 import 에러

#### 증상
```
ModuleNotFoundError: No module named 'app.models'
```

#### 해결 방법
```bash
# 컨테이너 내부에서 Python 경로 확인
docker-compose exec backend python -c "import sys; print(sys.path)"

# 컨테이너 재시작
docker-compose restart backend
```

### 3. 데이터베이스 연결 오류

#### 증상
```
sqlite3.OperationalError: unable to open database file
```

#### 해결 방법
```bash
# 데이터 디렉토리 권한 확인
docker-compose exec backend ls -la /app/data

# 권한 수정
docker-compose exec backend chmod 755 /app/data

# 데이터베이스 파일 생성
docker-compose exec backend touch /app/data/yakjeong.db
docker-compose exec backend chmod 644 /app/data/yakjeong.db
```

### 4. 포트 충돌 문제

#### 증상
```
Error starting userland proxy: listen tcp4 0.0.0.0:8000: bind: address already in use
```

#### 해결 방법
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :8000
lsof -i :3000

# 프로세스 종료 후 재시작
docker-compose down
./start.sh
```

### 5. 프론트엔드 빌드 오류

#### 증상
```
npm ERR! code ELIFECYCLE
```

#### 해결 방법
```bash
# node_modules 재설치
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose exec frontend npm install

# 또는 컨테이너 재빌드
docker-compose down
docker-compose up --build frontend
```

## 🔍 디버깅 명령어

### 컨테이너 상태 확인
```bash
docker-compose ps
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 컨테이너 내부 접속
```bash
# 백엔드 컨테이너 접속
docker-compose exec backend bash

# 프론트엔드 컨테이너 접속
docker-compose exec frontend sh
```

### 데이터베이스 확인
```bash
# 백엔드 컨테이너에서 Python 실행
docker-compose exec backend python

# Python 내에서 데이터베이스 확인
>>> from app.database import engine
>>> from app.models.room import Room
>>> Room.__table__.create(engine, checkfirst=True)
```

## 🚨 완전 초기화

모든 것을 처음부터 다시 시작하고 싶다면:

```bash
# 1. 모든 컨테이너 및 볼륨 삭제
docker-compose down -v
docker system prune -f

# 2. 데이터베이스 초기화
./reset_db.sh

# 3. 새로 시작
./start.sh
```

## 📞 추가 도움

위 방법들로 해결되지 않는다면:

1. **로그 수집**: `docker-compose logs > logs.txt`
2. **환경 정보**: `docker --version`, `docker-compose --version`
3. **에러 메시지**: 전체 에러 스택 트레이스 복사

이 정보들과 함께 이슈를 생성해주세요.
