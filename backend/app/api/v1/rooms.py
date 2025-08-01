from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.room import Room
from app.models.participant import Participant
from app.models.response import Response
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse, RoomWithParticipants
from app.schemas.response import OptimalTimeSlot
from app.services.schedule_optimizer import ScheduleOptimizer
import json

router = APIRouter()

@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(room_data: RoomCreate, db: Session = Depends(get_db)):
    """새로운 방 생성"""
    room_dict = room_data.dict()
    settings = room_dict.pop('settings', None)
    
    room = Room(**room_dict)
    if settings:
        room.set_settings(settings)
    
    db.add(room)
    db.commit()
    db.refresh(room)
    
    # 응답 데이터 생성
    room_data = {
        "id": room.id,
        "title": room.title,
        "description": room.description,
        "room_type": room.room_type,
        "creator_name": room.creator_name,
        "deadline": room.deadline,
        "settings": room.get_settings(),
        "created_at": room.created_at,
        "updated_at": room.updated_at,
        "is_active": room.is_active
    }
    
    return RoomResponse(**room_data)

@router.get("/{room_id}", response_model=RoomWithParticipants)
async def get_room(room_id: str, db: Session = Depends(get_db)):
    """방 정보 조회 (참여자 포함)"""
    room = db.query(Room).filter(Room.id == room_id, Room.is_active == True).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # 참여자 정보 가져오기
    participants = db.query(Participant).filter(Participant.room_id == room_id).all()
    
    # 응답 데이터 생성
    room_data = {
        "id": room.id,
        "title": room.title,
        "description": room.description,
        "room_type": room.room_type,
        "creator_name": room.creator_name,
        "deadline": room.deadline,
        "settings": room.get_settings(),
        "created_at": room.created_at,
        "updated_at": room.updated_at,
        "is_active": room.is_active,
        "participants": [
            {
                "id": p.id,
                "room_id": p.room_id,
                "name": p.name,
                "created_at": p.created_at
            } for p in participants
        ]
    }
    
    return RoomWithParticipants(**room_data)

@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(room_id: str, room_update: RoomUpdate, db: Session = Depends(get_db)):
    """방 정보 수정"""
    room = db.query(Room).filter(Room.id == room_id, Room.is_active == True).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    update_data = room_update.dict(exclude_unset=True)
    settings = update_data.pop('settings', None)
    
    for field, value in update_data.items():
        setattr(room, field, value)
    
    if settings is not None:
        room.set_settings(settings)
    
    db.commit()
    db.refresh(room)
    
    # 응답 데이터 생성
    room_data = {
        "id": room.id,
        "title": room.title,
        "description": room.description,
        "room_type": room.room_type,
        "creator_name": room.creator_name,
        "deadline": room.deadline,
        "settings": room.get_settings(),
        "created_at": room.created_at,
        "updated_at": room.updated_at,
        "is_active": room.is_active
    }
    
    return RoomResponse(**room_data)

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(room_id: str, db: Session = Depends(get_db)):
    """방 삭제 (비활성화)"""
    room = db.query(Room).filter(Room.id == room_id, Room.is_active == True).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    room.is_active = False
    db.commit()

@router.get("/{room_id}/optimal-times", response_model=List[OptimalTimeSlot])
async def get_optimal_times(room_id: str, db: Session = Depends(get_db)):
    """최적 시간대 계산"""
    room = db.query(Room).filter(Room.id == room_id, Room.is_active == True).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # 참여자들의 응답 데이터 수집 (활성화된 응답만)
    participants = db.query(Participant).filter(Participant.room_id == room_id).all()
    responses_data = []
    
    for participant in participants:
        # 활성화된 최신 응답만 가져오기
        active_response = db.query(Response).filter(
            Response.participant_id == participant.id,
            Response.is_active == True
        ).order_by(Response.created_at.desc()).first()
        
        if active_response:
            try:
                # Response 모델의 response_data 프로퍼티는 이미 파싱된 객체를 반환
                response_data = active_response.response_data
                responses_data.append({
                    'participant_name': participant.name,
                    'response_data': response_data
                })
                print(f"Participant {participant.name} active response: {response_data}")  # 디버깅용
            except Exception as e:
                print(f"응답 데이터 처리 오류: {e}")
                continue
    
    # 일정 최적화 알고리즘 실행
    optimizer = ScheduleOptimizer(room.room_type)
    optimal_times = await optimizer.find_optimal_times(responses_data, room.get_settings())
    
    return optimal_times
