from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import tempfile
import os
import gzip
import zipfile
import io
from pathlib import Path
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.flibusta_service import FlibustaService
from app.services.fb2_parser import FB2Parser
from app.repositories.book_repository import BookRepository
from app.repositories.user_book_repository import UserBookRepository

router = APIRouter(prefix="/api/flibusta", tags=["flibusta"])

# Папка для хранения книг
BOOKS_DIR = Path("data/books")
BOOKS_DIR.mkdir(parents=True, exist_ok=True)


class FlibustaBookResponse(BaseModel):
    id: str
    title: str
    author: str
    summary: str
    has_fb2: bool


class DownloadBookRequest(BaseModel):
    book_id: str
    title: str
    author: str


@router.get("/search", response_model=List[FlibustaBookResponse])
async def search_books(
    query: str = Query(..., min_length=2, description="Поисковый запрос"),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
):
    """
    Поиск книг на Флибусте
    """
    try:
        flibusta = FlibustaService()
        books = flibusta.search_books(query, limit)
        return books
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Ошибка поиска на Флибусте: {str(e)}"
        )


@router.post("/download")
async def download_and_add_book(
    request: DownloadBookRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Скачивание книги с Флибусты и добавление в библиотеку пользователя
    """
    try:
        # Скачиваем книгу
        flibusta = FlibustaService()
        content = flibusta.download_book(request.book_id, format="fb2")
        
        if not content:
            raise HTTPException(
                status_code=404, 
                detail="Не удалось скачать книгу с Флибусты"
            )
        
        # Проверяем и распаковываем если нужно
        try:
            # Проверяем, не ZIP ли это
            if content[:2] == b'PK':
                print("Detected ZIP archive, extracting...")
                try:
                    with zipfile.ZipFile(io.BytesIO(content)) as zf:
                        # Ищем FB2 файл в архиве
                        fb2_files = [f for f in zf.namelist() if f.endswith('.fb2')]
                        if not fb2_files:
                            raise HTTPException(
                                status_code=500,
                                detail="В архиве не найден FB2 файл"
                            )
                        # Берем первый FB2 файл
                        print(f"Found FB2 file in archive: {fb2_files[0]}")
                        content = zf.read(fb2_files[0])
                except zipfile.BadZipFile:
                    raise HTTPException(
                        status_code=500,
                        detail="Не удалось распаковать архив"
                    )
            
            # Проверяем, не gzip ли это
            elif content[:2] == b'\x1f\x8b':
                print("Detected gzip, decompressing...")
                content = gzip.decompress(content)
            
            # Проверяем, что это XML
            if not content.strip().startswith(b'<?xml') and not content.strip().startswith(b'<FictionBook'):
                # Логируем первые 200 байт для диагностики
                preview = content[:200]
                print(f"Invalid content (first 200 bytes): {preview}")
                raise HTTPException(
                    status_code=500,
                    detail="Флибуста вернула некорректный файл. Попробуйте другую книгу или повторите позже."
                )
        except HTTPException:
            raise
        except gzip.BadGzipFile:
            pass  # Не gzip, продолжаем
        
        # Создаем временный файл для парсинга
        with tempfile.NamedTemporaryFile(delete=False, suffix='.fb2') as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Парсим книгу
            parser = FB2Parser(tmp_path)
            parsed_data = parser.parse()
            
            # Проверяем, нет ли уже такой книги у пользователя
            book_repo = BookRepository(db)
            existing_book = db.query(book_repo.model).filter(
                book_repo.model.title == parsed_data["title"],
                book_repo.model.author == parsed_data["author"]
            ).first()
            
            if existing_book:
                # Проверяем, есть ли у пользователя эта книга
                user_book_repo = UserBookRepository(db)
                existing_user_book = user_book_repo.get_by_user_and_book(
                    current_user.id, 
                    existing_book.id
                )
                
                if existing_user_book:
                    return {
                        "message": "Книга уже есть в вашей библиотеке",
                        "book_id": existing_book.id,
                        "user_book_id": existing_user_book.id
                    }
                else:
                    # Добавляем существующую книгу пользователю
                    user_book = user_book_repo.create({
                        "user_id": current_user.id,
                        "book_id": existing_book.id,
                        "status": "planned"
                    })
                    
                    return {
                        "message": "Книга добавлена в библиотеку",
                        "book_id": existing_book.id,
                        "user_book_id": user_book.id
                    }
            
            # Сохраняем файл на диск
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            safe_filename = f"{timestamp}_{current_user.id}_{request.book_id}.fb2"
            file_path = BOOKS_DIR / safe_filename
            
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Создаем новую книгу в БД
            book = book_repo.create({
                "title": parsed_data["title"],
                "author": parsed_data["author"],
                "file_path": str(file_path),
                "file_name": f"{request.book_id}.fb2",
                "total_pages": parsed_data["total_pages"]
            })
            
            # Добавляем книгу пользователю
            user_book_repo = UserBookRepository(db)
            user_book = user_book_repo.create({
                "user_id": current_user.id,
                "book_id": book.id,
                "status": "planned"
            })
            
            return {
                "message": "Книга успешно скачана и добавлена в библиотеку",
                "book_id": book.id,
                "user_book_id": user_book.id
            }
            
        finally:
            # Удаляем временный файл
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка обработки книги: {str(e)}"
        )
