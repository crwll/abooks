from typing import List
from sqlalchemy.orm import Session
from app.models.bookmark import Bookmark
from app.repositories.base_repository import BaseRepository


class BookmarkRepository(BaseRepository[Bookmark]):
    def __init__(self, db: Session):
        super().__init__(Bookmark, db)

    def get_by_user_book(self, user_book_id: int) -> List[Bookmark]:
        return (
            self.db.query(Bookmark)
            .filter(Bookmark.user_book_id == user_book_id)
            .order_by(Bookmark.position)
            .all()
        )

    def get_all_user_bookmarks(self, user_id: int) -> List[Bookmark]:
        from app.models.user_book import UserBook
        return (
            self.db.query(Bookmark)
            .join(UserBook)
            .filter(UserBook.user_id == user_id)
            .order_by(Bookmark.created_at.desc())
            .all()
        )
