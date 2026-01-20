from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ReadingSession(Base):
    __tablename__ = "reading_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_book_id = Column(Integer, ForeignKey("user_books.id", ondelete="CASCADE"), nullable=False)
    words_count = Column(Integer, default=0)
    speed_wpm = Column(Integer, default=0)
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_book = relationship("UserBook", back_populates="reading_sessions")
