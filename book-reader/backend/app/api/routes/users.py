from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.user_book_repository import UserBookRepository
from app.repositories.reading_session_repository import ReadingSessionRepository

router = APIRouter(prefix="/api/users", tags=["users"])


class ReadingGoalUpdate(BaseModel):
    reading_goal: int


class UserStats(BaseModel):
    books_read: int
    books_in_progress: int
    total_pages: int
    average_speed: float


@router.put("/me/goal")
async def update_reading_goal(
    data: ReadingGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    updated_user = user_repo.update(current_user.id, {"reading_goal": data.reading_goal})
    return {"reading_goal": updated_user.reading_goal}


@router.get("/me/stats", response_model=UserStats)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    session_repo = ReadingSessionRepository(db)
    
    books_read = len(user_book_repo.get_user_books(current_user.id, status="finished"))
    books_in_progress = len(user_book_repo.get_user_books(current_user.id, status="reading"))
    
    total_pages = 0
    for user_book in user_book_repo.get_user_books(current_user.id):
        if user_book.book:
            total_pages += int(user_book.book.total_pages * (user_book.progress_percent / 100))
    
    average_speed = session_repo.get_average_speed(current_user.id)
    
    return {
        "books_read": books_read,
        "books_in_progress": books_in_progress,
        "total_pages": total_pages,
        "average_speed": average_speed
    }
