from typing import List
from sqlalchemy.orm import Session
from app.models.book import Book
from app.repositories.base_repository import BaseRepository


class BookRepository(BaseRepository[Book]):
    def __init__(self, db: Session):
        super().__init__(Book, db)

    def search(self, query: str, skip: int = 0, limit: int = 20) -> List[Book]:
        return (
            self.db.query(Book)
            .filter(
                (Book.title.ilike(f"%{query}%")) | (Book.author.ilike(f"%{query}%"))
            )
            .offset(skip)
            .limit(limit)
            .all()
        )
