from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.response import Response
from app.models.participant import Participant
from app.schemas.response import ResponseCreate, ResponseUpdate, ResponseResponse
import json

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
    
    # 기존 응답이 있는지 확인
    existing_response = db.query(Response).filter(
        Response.participant_id == response_data.participant_id
    ).first()
    
    if existing_response:
        # 기존 응답 업데이트
        existing_response.response_data = json.dumps(response_data.response_data)
        existing_response.version += 1
        db.commit()
        db.refresh(existing_response)
        return existing_response
    else:
        # 새로운 응답 생성
        response = Response(
            participant_id=response_data.participant_id,
            response_data=json.dumps(response_data.response_data)
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
    
    # JSON 문자열을 파이썬 객체로 변환
    for response in responses:
        try:
            response.response_data = json.loads(response.response_data)
        except:
            response.response_data = {}
    
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
    
    # JSON 문자열을 파이썬 객체로 변환
    try:
        response.response_data = json.loads(response.response_data)
    except:
        response.response_data = {}
    
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
    
    response.response_data = json.dumps(response_update.response_data)
    response.version += 1
    db.commit()
    db.refresh(response)
    
    # JSON 문자열을 파이썬 객체로 변환하여 반환
    try:
        response.response_data = json.loads(response.response_data)
    except:
        response.response_data = {}
    
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
