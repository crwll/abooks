from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class UserBook(Base):
    __tablename__ = "user_books"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    current_position = Column(Integer, default=0)
    progress_percent = Column(Float, default=0.0)
    status = Column(String, default="planned")
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="user_books")
    book = relationship("Book", back_populates="user_books")
    bookmarks = relationship("Bookmark", back_populates="user_book", cascade="all, delete-orphan")
    reading_sessions = relationship("ReadingSession", back_populates="user_book", cascade="all, delete-orphan")
