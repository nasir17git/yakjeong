#!/bin/bash

echo "🚀 Yakjeong 개발 환경을 시작합니다..."

# Docker Compose로 서비스 시작
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
echo "   - 서비스 중지: docker-compose down"
echo "   - 컨테이너 상태: docker-compose ps"
echo ""
echo "⏳ 서비스가 완전히 시작될 때까지 잠시 기다려주세요..."

# 서비스가 준비될 때까지 대기
echo "백엔드 서비스 확인 중..."
until curl -f http://localhost:8000/health > /dev/null 2>&1; do
    echo "⏳ 백엔드 서비스 시작 대기 중..."
    sleep 2
done

echo "✅ 백엔드 서비스가 준비되었습니다!"
echo "🎉 모든 서비스가 정상적으로 시작되었습니다!"
echo ""
echo "브라우저에서 http://localhost:3000 을 열어보세요!"
