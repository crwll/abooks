from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from pathlib import Path
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.book import Book
from app.models.user_book import UserBook
from app.repositories.book_repository import BookRepository
from app.repositories.user_book_repository import UserBookRepository
from app.services.fb2_parser import FB2Parser

router = APIRouter(prefix="/api/books", tags=["books"])

# Папка для хранения книг
BOOKS_DIR = Path("data/books")
BOOKS_DIR.mkdir(parents=True, exist_ok=True)


class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    file_path: Optional[str] = None
    cover_path: Optional[str] = None
    total_pages: int

    class Config:
        from_attributes = True


class UserBookResponse(BaseModel):
    id: int
    book: BookResponse
    current_position: int
    progress_percent: float
    status: str
    started_at: Optional[datetime]
    finished_at: Optional[datetime]

    class Config:
        from_attributes = True


class BookContentResponse(BaseModel):
    chapters: List[dict]
    current_chapter: int
    total_chapters: int


@router.get("/", response_model=List[UserBookResponse])
async def get_user_books(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    user_books = user_book_repo.get_user_books(current_user.id, status)
    return user_books


@router.get("/reading", response_model=List[UserBookResponse])
async def get_reading_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    user_books = user_book_repo.get_user_books(current_user.id, status="reading")
    return user_books


@router.post("/", response_model=UserBookResponse)
async def add_book(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.fb2'):
        raise HTTPException(status_code=400, detail="Only FB2 files are supported")
    
    try:
        # Генерируем уникальное имя файла
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = BOOKS_DIR / safe_filename
        
        # Сохраняем файл на диск
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Парсим книгу
        parser = FB2Parser(str(file_path))
        parsed_data = parser.parse()
        
        # Сохраняем информацию в БД (без содержимого файла)
        book_repo = BookRepository(db)
        book = book_repo.create({
            "title": parsed_data["title"],
            "author": parsed_data["author"],
            "file_path": str(file_path),
            "file_name": file.filename,
            "total_pages": parsed_data["total_pages"]
        })
        
        user_book_repo = UserBookRepository(db)
        user_book = user_book_repo.create({
            "user_id": current_user.id,
            "book_id": book.id,
            "status": "planned"
        })
        
        return user_book
    except Exception as e:
        # Если что-то пошло не так, удаляем файл
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing book: {str(e)}")


@router.get("/{book_id}", response_model=UserBookResponse)
async def get_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    user_book = user_book_repo.get_by_user_and_book(current_user.id, book_id)
    
    if not user_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return user_book


@router.get("/{book_id}/content", response_model=BookContentResponse)
async def get_book_content(
    book_id: int,
    chapter: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    user_book = user_book_repo.get_by_user_and_book(current_user.id, book_id)
    
    if not user_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if not user_book.book.file_path or not os.path.exists(user_book.book.file_path):
        raise HTTPException(status_code=404, detail="Book file not found")
    
    try:
        # Читаем напрямую из файла
        parser = FB2Parser(user_book.book.file_path)
        parsed_data = parser.parse()
        chapters = parsed_data["chapters"]
        
        return {
            "chapters": chapters,
            "current_chapter": chapter,
            "total_chapters": len(chapters)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading book: {str(e)}")


@router.delete("/{book_id}")
async def delete_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_book_repo = UserBookRepository(db)
    user_book = user_book_repo.get_by_user_and_book(current_user.id, book_id)
    
    if not user_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Удаляем файл с диска, если он существует
    if user_book.book.file_path and os.path.exists(user_book.book.file_path):
        try:
            os.remove(user_book.book.file_path)
        except Exception as e:
            print(f"Warning: Could not delete file {user_book.book.file_path}: {e}")
    
    user_book_repo.delete(user_book.id)
    
    return {"message": "Book deleted successfully"}
