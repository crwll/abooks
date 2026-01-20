"""
Скрипт миграции для добавления хранения файлов в БД
"""
import sqlite3
import os

def migrate():
    db_path = "./data/database.db"
    
    if not os.path.exists(db_path):
        print("База данных не найдена. Запустите init_db.py")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Проверяем, существуют ли уже новые колонки
        cursor.execute("PRAGMA table_info(books)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'file_data' not in columns:
            print("Добавляем новые колонки...")
            cursor.execute("ALTER TABLE books ADD COLUMN file_data BLOB")
            cursor.execute("ALTER TABLE books ADD COLUMN file_name TEXT")
            
            # Делаем file_path nullable
            cursor.execute("""
                CREATE TABLE books_new (
                    id INTEGER PRIMARY KEY,
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    file_path TEXT,
                    file_data BLOB,
                    file_name TEXT,
                    cover_path TEXT,
                    total_pages INTEGER DEFAULT 0,
                    created_at TIMESTAMP
                )
            """)
            
            cursor.execute("""
                INSERT INTO books_new 
                SELECT id, title, author, file_path, NULL, NULL, cover_path, total_pages, created_at
                FROM books
            """)
            
            cursor.execute("DROP TABLE books")
            cursor.execute("ALTER TABLE books_new RENAME TO books")
            
            # Восстанавливаем индексы
            cursor.execute("CREATE INDEX idx_books_title ON books(title)")
            cursor.execute("CREATE INDEX idx_books_author ON books(author)")
            
            conn.commit()
            print("Миграция успешно выполнена!")
        else:
            print("Миграция уже выполнена ранее.")
            
    except Exception as e:
        conn.rollback()
        print(f"Ошибка миграции: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
