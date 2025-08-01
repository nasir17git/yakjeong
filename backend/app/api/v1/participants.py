from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.participant import Participant
from app.models.room import Room
from app.schemas.participant import ParticipantCreate, ParticipantResponse, ParticipantWithResponses

router = APIRouter()

@router.post("/", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED)
async def create_participant(participant_data: ParticipantCreate, db: Session = Depends(get_db)):
    """새로운 참여자 생성 또는 기존 참여자 반환"""
    # 방 존재 확인
    room = db.query(Room).filter(Room.id == participant_data.room_id, Room.is_active == True).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # 같은 방에서 같은 이름의 참여자가 있는지 확인
    existing_participant = db.query(Participant).filter(
        Participant.room_id == participant_data.room_id,
        Participant.name == participant_data.name
    ).first()
    
    if existing_participant:
        # 기존 참여자 반환 (새로운 응답을 위해)
        return existing_participant
    else:
        # 새로운 참여자 생성
        participant = Participant(**participant_data.dict())
        db.add(participant)
        db.commit()
        db.refresh(participant)
        return participant

@router.get("/room/{room_id}", response_model=List[ParticipantResponse])
async def get_participants_by_room(room_id: str, db: Session = Depends(get_db)):
    """방의 참여자 목록 조회"""
    # 방 존재 확인
    room = db.query(Room).filter(Room.id == room_id, Room.is_active == True).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    participants = db.query(Participant).filter(Participant.room_id == room_id).all()
    return participants

@router.get("/{participant_id}", response_model=ParticipantWithResponses)
async def get_participant(participant_id: str, db: Session = Depends(get_db)):
    """참여자 정보 조회 (응답 포함)"""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )
    return participant

@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_participant(participant_id: str, db: Session = Depends(get_db)):
    """참여자 삭제"""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )
    
    db.delete(participant)
    db.commit()
