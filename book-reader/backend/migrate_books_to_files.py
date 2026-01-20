"""
Скрипт миграции книг из БД в файловую систему
Извлекает file_data из БД и сохраняет в папку data/books
"""
import os
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, LargeBinary
from sqlalchemy.orm import sessionmaker, declarative_base

# Настройки БД
DATABASE_URL = "sqlite:///./data/database.db"
BOOKS_DIR = Path("data/books")
BOOKS_DIR.mkdir(parents=True, exist_ok=True)

# Создаем временную модель с file_data для миграции
Base = declarative_base()

class BookTemp(Base):
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True)
    title = Column(String)
    author = Column(String)
    file_path = Column(String)
    file_data = Column(LargeBinary)
    file_name = Column(String)
    created_at = Column(DateTime)

def migrate_books():
    # Подключаемся к БД
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Получаем все книги с file_data
        books_with_data = session.query(BookTemp).filter(BookTemp.file_data != None).all()
        
        print(f"Найдено {len(books_with_data)} книг для миграции")
        
        migrated = 0
        for book in books_with_data:
            try:
                # Генерируем имя файла
                timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                file_name = book.file_name or f"book_{book.id}.fb2"
                safe_filename = f"{timestamp}_{book.id}_{file_name}"
                file_path = BOOKS_DIR / safe_filename
                
                # Сохраняем file_data в файл
                with open(file_path, "wb") as f:
                    f.write(book.file_data)
                
                # Обновляем запись в БД
                book.file_path = str(file_path)
                book.file_data = None  # Очищаем file_data
                
                migrated += 1
                print(f"[OK] Мигрирована книга: {book.title} -> {file_path}")
                
            except Exception as e:
                print(f"[ERR] Ошибка миграции книги {book.id} ({book.title}): {e}")
        
        # Сохраняем изменения
        session.commit()
        print(f"\nУспешно мигрировано книг: {migrated}/{len(books_with_data)}")
        
    except Exception as e:
        print(f"Ошибка миграции: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    print("Начинаем миграцию книг из БД в файлы...")
    migrate_books()
    print("Миграция завершена!")
