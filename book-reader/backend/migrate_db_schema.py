"""
Скрипт миграции схемы БД - удаление колонки file_data из таблицы books
ВАЖНО: Запускать ПОСЛЕ migrate_books_to_files.py
"""
import sqlite3
from pathlib import Path

DATABASE_PATH = "data/database.db"

def migrate_schema():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        print("Проверяем наличие колонки file_data...")
        
        # Получаем информацию о таблице
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        if 'file_data' not in column_names:
            print("[OK] Колонка file_data уже удалена")
            return
        
        print("Удаляем колонку file_data из таблицы books...")
        
        # В SQLite нельзя удалить колонку напрямую, нужно пересоздать таблицу
        # 1. Создаем временную таблицу без file_data
        cursor.execute("""
            CREATE TABLE books_new (
                id INTEGER PRIMARY KEY,
                title VARCHAR NOT NULL,
                author VARCHAR NOT NULL,
                file_path VARCHAR NOT NULL,
                file_name VARCHAR,
                cover_path VARCHAR,
                total_pages INTEGER DEFAULT 0,
                created_at DATETIME
            )
        """)
        
        # 2. Копируем данные
        cursor.execute("""
            INSERT INTO books_new (id, title, author, file_path, file_name, cover_path, total_pages, created_at)
            SELECT id, title, author, file_path, file_name, cover_path, total_pages, created_at
            FROM books
        """)
        
        # 3. Удаляем старую таблицу
        cursor.execute("DROP TABLE books")
        
        # 4. Переименовываем новую таблицу
        cursor.execute("ALTER TABLE books_new RENAME TO books")
        
        # 5. Создаем индексы
        cursor.execute("CREATE INDEX ix_books_title ON books (title)")
        cursor.execute("CREATE INDEX ix_books_author ON books (author)")
        cursor.execute("CREATE INDEX ix_books_id ON books (id)")
        
        conn.commit()
        print("[OK] Схема БД успешно обновлена - колонка file_data удалена")
        
    except Exception as e:
        print(f"[ERR] Ошибка миграции схемы: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("Начинаем миграцию схемы БД...")
    migrate_schema()
    print("Миграция схемы завершена!")
