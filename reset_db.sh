#!/bin/bash

echo "🔄 데이터베이스를 초기화합니다..."

# Docker 컨테이너가 실행 중인지 확인
if [ "$(docker-compose ps -q backend)" ]; then
    echo "백엔드 컨테이너 중지 중..."
    docker-compose stop backend
fi

# 데이터베이스 파일 삭제
if [ -f "./backend/yakjeong.db" ]; then
    echo "기존 데이터베이스 파일 삭제 중..."
    rm -f ./backend/yakjeong.db
fi

# Docker 볼륨의 데이터베이스 파일도 삭제
echo "Docker 볼륨 데이터 삭제 중..."
docker-compose down -v

echo "✅ 데이터베이스 초기화 완료!"
echo ""
echo "서비스를 다시 시작하려면 다음 명령어를 실행하세요:"
echo "  ./start.sh"
