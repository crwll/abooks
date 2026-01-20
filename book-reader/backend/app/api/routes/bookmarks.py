from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.repositories.bookmark_repository import BookmarkRepository
from app.repositories.user_book_repository import UserBookRepository

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])


class BookmarkCreate(BaseModel):
    user_book_id: int
    position: int
    comment: Optional[str] = None


class BookmarkUpdate(BaseModel):
    comment: str


class BookmarkResponse(BaseModel):
    id: int
    user_book_id: int
    position: int
    comment: Optional[str]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[BookmarkResponse])
async def get_bookmarks(
    user_book_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookmark_repo = BookmarkRepository(db)
    
    if user_book_id:
        user_book_repo = UserBookRepository(db)
        user_book = user_book_repo.get(user_book_id)
        if not user_book or user_book.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="User book not found")
        bookmarks = bookmark_repo.get_by_user_book(user_book_id)
    else:
        bookmarks = bookmark_repo.get_all_user_bookmarks(current_user.id)
    
    return bookmarks


@router.post("/", response_model=BookmarkResponse)
async def create_bookmark(
    data: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    user_book = user_book_repo.get(data.user_book_id)
    
    if not user_book or user_book.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="User book not found")
    
    bookmark_repo = BookmarkRepository(db)
    bookmark = bookmark_repo.create({
        "user_book_id": data.user_book_id,
        "position": data.position,
        "comment": data.comment
    })
    
    return bookmark


@router.put("/{bookmark_id}", response_model=BookmarkResponse)
async def update_bookmark(
    bookmark_id: int,
    data: BookmarkUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookmark_repo = BookmarkRepository(db)
    bookmark = bookmark_repo.get(bookmark_id)
    
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    user_book_repo = UserBookRepository(db)
    user_book = user_book_repo.get(bookmark.user_book_id)
    
    if not user_book or user_book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updated = bookmark_repo.update(bookmark_id, {"comment": data.comment})
    return updated


@router.delete("/{bookmark_id}")
async def delete_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookmark_repo = BookmarkRepository(db)
    bookmark = bookmark_repo.get(bookmark_id)
    
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    user_book_repo = UserBookRepository(db)
    user_book = user_book_repo.get(bookmark.user_book_id)
    
    if not user_book or user_book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    bookmark_repo.delete(bookmark_id)
    return {"message": "Bookmark deleted"}
