from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.repositories.user_book_repository import UserBookRepository
from app.repositories.user_settings_repository import UserSettingsRepository

router = APIRouter(prefix="/api/user-books", tags=["user-books"])


class PositionUpdate(BaseModel):
    current_position: int
    progress_percent: float


class SettingsUpdate(BaseModel):
    font_size: int = None
    line_height: float = None
    paragraph_spacing: int = None
    spritz_speed: int = None


@router.get("/{user_book_id}")
async def get_user_book(
    user_book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    user_book = user_book_repo.get(user_book_id)
    
    if not user_book or user_book.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="User book not found")
    
    settings_repo = UserSettingsRepository(db)
    settings = settings_repo.get_or_create(current_user.id)
    
    return {
        "user_book": user_book,
        "settings": settings
    }


@router.put("/{user_book_id}/position")
async def update_position(
    user_book_id: int,
    data: PositionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    user_book = user_book_repo.get(user_book_id)
    
    if not user_book or user_book.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="User book not found")
    
    update_data = {
        "current_position": data.current_position,
        "progress_percent": data.progress_percent
    }
    
    if user_book.status == "planned" and data.current_position > 0:
        update_data["status"] = "reading"
        update_data["started_at"] = datetime.utcnow()
    elif data.progress_percent >= 100:
        update_data["status"] = "finished"
        update_data["finished_at"] = datetime.utcnow()
    
    updated = user_book_repo.update(user_book_id, update_data)
    return updated


@router.put("/settings")
async def update_settings(
    data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings_repo = UserSettingsRepository(db)
    settings = settings_repo.get_or_create(current_user.id)
    
    update_data = {}
    if data.font_size is not None:
        update_data["font_size"] = data.font_size
    if data.line_height is not None:
        update_data["line_height"] = data.line_height
    if data.paragraph_spacing is not None:
        update_data["paragraph_spacing"] = data.paragraph_spacing
    if data.spritz_speed is not None:
        update_data["spritz_speed"] = data.spritz_speed
    
    updated = settings_repo.update(settings.id, update_data)
    return updated
