from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.reading_session import ReadingSession
from app.repositories.base_repository import BaseRepository


class ReadingSessionRepository(BaseRepository[ReadingSession]):
    def __init__(self, db: Session):
        super().__init__(ReadingSession, db)

    def get_by_user_book(self, user_book_id: int) -> List[ReadingSession]:
        return (
            self.db.query(ReadingSession)
            .filter(ReadingSession.user_book_id == user_book_id)
            .order_by(ReadingSession.created_at.desc())
            .all()
        )

    def get_average_speed(self, user_id: int) -> float:
        from app.models.user_book import UserBook
        result = (
            self.db.query(func.avg(ReadingSession.speed_wpm))
            .join(UserBook)
            .filter(UserBook.user_id == user_id)
            .scalar()
        )
        return result if result else 0.0
