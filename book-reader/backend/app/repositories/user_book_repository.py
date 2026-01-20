from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.user_book import UserBook
from app.models.book import Book
from app.repositories.base_repository import BaseRepository


class UserBookRepository(BaseRepository[UserBook]):
    def __init__(self, db: Session):
        super().__init__(UserBook, db)

    def get_user_books(self, user_id: int, status: Optional[str] = None) -> List[UserBook]:
        query = (
            self.db.query(UserBook)
            .filter(UserBook.user_id == user_id)
            .options(joinedload(UserBook.book))
        )
        if status:
            query = query.filter(UserBook.status == status)
        return query.all()

    def get_by_user_and_book(self, user_id: int, book_id: int) -> Optional[UserBook]:
        return (
            self.db.query(UserBook)
            .filter(and_(UserBook.user_id == user_id, UserBook.book_id == book_id))
            .options(joinedload(UserBook.book))
            .first()
        )
