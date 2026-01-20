from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.repositories.reading_session_repository import ReadingSessionRepository
from app.repositories.user_book_repository import UserBookRepository

router = APIRouter(prefix="/api/reading-sessions", tags=["reading-sessions"])


class ReadingSessionCreate(BaseModel):
    user_book_id: int
    words_count: int
    speed_wpm: int
    duration_seconds: int


class ReadingSessionResponse(BaseModel):
    id: int
    user_book_id: int
    words_count: int
    speed_wpm: int
    duration_seconds: int

    class Config:
        from_attributes = True


@router.post("/", response_model=ReadingSessionResponse)
async def create_session(
    data: ReadingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    user_book = user_book_repo.get(data.user_book_id)
    
    if not user_book or user_book.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="User book not found")
    
    session_repo = ReadingSessionRepository(db)
    session = session_repo.create({
        "user_book_id": data.user_book_id,
        "words_count": data.words_count,
        "speed_wpm": data.speed_wpm,
        "duration_seconds": data.duration_seconds
    })
    
    return session


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_repo = ReadingSessionRepository(db)
    average_speed = session_repo.get_average_speed(current_user.id)
    
    return {
        "average_speed": average_speed
    }
