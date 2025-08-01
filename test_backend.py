#!/usr/bin/env python3

import sys
import os

# 백엔드 경로를 Python path에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    print("🔍 백엔드 모듈 import 테스트 시작...")
    
    # 데이터베이스 모듈 테스트
    print("1. 데이터베이스 모듈 import...")
    from app.database import Base, engine, get_db
    print("   ✅ 데이터베이스 모듈 import 성공")
    
    # 모델 모듈 테스트
    print("2. 모델 모듈 import...")
    from app.models.room import Room
    from app.models.participant import Participant
    from app.models.response import Response
    print("   ✅ 모델 모듈 import 성공")
    
    # 스키마 모듈 테스트
    print("3. 스키마 모듈 import...")
    from app.schemas.room import RoomCreate, RoomResponse
    from app.schemas.participant import ParticipantCreate, ParticipantResponse
    from app.schemas.response import ResponseCreate, ResponseResponse
    print("   ✅ 스키마 모듈 import 성공")
    
    # API 모듈 테스트
    print("4. API 모듈 import...")
    from app.api.v1 import rooms, participants, responses
    print("   ✅ API 모듈 import 성공")
    
    # 서비스 모듈 테스트
    print("5. 서비스 모듈 import...")
    from app.services.schedule_optimizer import ScheduleOptimizer
    print("   ✅ 서비스 모듈 import 성공")
    
    # 메인 앱 모듈 테스트
    print("6. 메인 앱 모듈 import...")
    from app.main import app
    print("   ✅ 메인 앱 모듈 import 성공")
    
    print("\n🎉 모든 모듈 import 성공!")
    print("백엔드 코드에 문법 오류가 없습니다.")
    
except Exception as e:
    print(f"\n❌ 에러 발생: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
