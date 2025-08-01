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
    room = Room(**room_data.dict())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room

@router.get("/", response_model=List[RoomResponse])
async def get_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """방 목록 조회"""
    rooms = db.query(Room).filter(Room.is_active == True).offset(skip).limit(limit).all()
    return rooms

@router.get("/{room_id}", response_model=RoomWithParticipants)
async def get_room(room_id: str, db: Session = Depends(get_db)):
    """방 정보 조회 (참여자 포함)"""
    room = db.query(Room).filter(Room.id == room_id, Room.is_active == True).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return room

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
    for field, value in update_data.items():
        setattr(room, field, value)
    
    db.commit()
    db.refresh(room)
    return room

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
    
    # 참여자들의 응답 데이터 수집
    participants = db.query(Participant).filter(Participant.room_id == room_id).all()
    responses_data = []
    
    for participant in participants:
        latest_response = db.query(Response).filter(
            Response.participant_id == participant.id
        ).order_by(Response.created_at.desc()).first()
        
        if latest_response:
            try:
                response_data = json.loads(latest_response.response_data)
                responses_data.append({
                    'participant_name': participant.name,
                    'response_data': response_data
                })
            except:
                continue
    
    # 일정 최적화 알고리즘 실행
    optimizer = ScheduleOptimizer(room.room_type)
    optimal_times = await optimizer.find_optimal_times(responses_data)
    
    return optimal_times
