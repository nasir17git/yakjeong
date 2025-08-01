#!/bin/bash

echo "🚀 Yakjeong 개발 환경을 시작합니다..."

# 기존 컨테이너 정리
echo "기존 컨테이너 정리 중..."
docker-compose down

# Docker Compose로 서비스 시작
echo "Docker 이미지 빌드 및 서비스 시작 중..."
docker-compose up --build -d

echo "✅ 서비스가 시작되었습니다!"
echo ""
echo "📍 접속 정보:"
echo "   - 프론트엔드: http://localhost:3000"
echo "   - 백엔드 API: http://localhost:8000"
echo "   - API 문서: http://localhost:8000/docs"
echo ""
echo "🔧 유용한 명령어:"
echo "   - 로그 확인: docker-compose logs -f"
echo "   - 백엔드 로그만: docker-compose logs -f backend"
echo "   - 프론트엔드 로그만: docker-compose logs -f frontend"
echo "   - 서비스 중지: docker-compose down"
echo "   - 컨테이너 상태: docker-compose ps"
echo ""
echo "⏳ 서비스가 완전히 시작될 때까지 잠시 기다려주세요..."

# 컨테이너 상태 확인
echo ""
echo "📊 컨테이너 상태:"
docker-compose ps

echo ""
echo "📋 실시간 로그를 보려면 다음 명령어를 실행하세요:"
echo "   docker-compose logs -f"
echo ""
echo "🎉 설정이 완료되었습니다!"
echo "브라우저에서 http://localhost:3000 을 열어보세요!"
