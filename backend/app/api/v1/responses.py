from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.response import Response
from app.models.participant import Participant
from app.schemas.response import ResponseCreate, ResponseUpdate, ResponseResponse

router = APIRouter()

@router.post("/", response_model=ResponseResponse, status_code=status.HTTP_201_CREATED)
async def create_response(response_data: ResponseCreate, db: Session = Depends(get_db)):
    """새로운 응답 생성"""
    # 참여자 존재 확인
    participant = db.query(Participant).filter(Participant.id == response_data.participant_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )
    
    # 기존 응답이 있는지 확인하고 버전 번호 결정
    existing_responses = db.query(Response).filter(
        Response.participant_id == response_data.participant_id
    ).all()
    
    # 다음 버전 번호 계산
    next_version = max([r.version for r in existing_responses], default=0) + 1
    
    # 항상 새로운 응답 생성 (기존 응답 업데이트하지 않음)
    response = Response(
        participant_id=response_data.participant_id,
        response_data=response_data.response_data,
        version=next_version
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    return response

@router.get("/participant/{participant_id}", response_model=List[ResponseResponse])
async def get_responses_by_participant(participant_id: str, db: Session = Depends(get_db)):
    """참여자의 응답 목록 조회"""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )
    
    responses = db.query(Response).filter(
        Response.participant_id == participant_id
    ).order_by(Response.created_at.desc()).all()
    
    return responses

@router.get("/{response_id}", response_model=ResponseResponse)
async def get_response(response_id: str, db: Session = Depends(get_db)):
    """응답 정보 조회"""
    response = db.query(Response).filter(Response.id == response_id).first()
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    return response

@router.put("/{response_id}", response_model=ResponseResponse)
async def update_response(response_id: str, response_update: ResponseUpdate, db: Session = Depends(get_db)):
    """응답 수정"""
    response = db.query(Response).filter(Response.id == response_id).first()
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    response.response_data = response_update.response_data
    response.version += 1
    db.commit()
    db.refresh(response)
    
    return response

@router.put("/{response_id}/activate", response_model=ResponseResponse)
async def activate_response(response_id: str, db: Session = Depends(get_db)):
    """특정 응답을 활성화 (해당 참여자의 다른 응답들은 비활성화)"""
    response = db.query(Response).filter(Response.id == response_id).first()
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    # 해당 참여자의 모든 응답을 비활성화
    db.query(Response).filter(
        Response.participant_id == response.participant_id
    ).update({"is_active": False})
    
    # 선택된 응답만 활성화
    response.is_active = True
    db.commit()
    db.refresh(response)
    
    return response

@router.delete("/{response_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_response(response_id: str, db: Session = Depends(get_db)):
    """응답 삭제"""
    response = db.query(Response).filter(Response.id == response_id).first()
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    db.delete(response)
    db.commit()
