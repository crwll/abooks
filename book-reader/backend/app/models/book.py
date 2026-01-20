from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    author = Column(String, nullable=False, index=True)
    file_path = Column(String, nullable=False)  # Путь к файлу в файловой системе
    file_name = Column(String, nullable=True)  # Оригинальное имя файла
    cover_path = Column(String, nullable=True)
    total_pages = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_books = relationship("UserBook", back_populates="book", cascade="all, delete-orphan")
