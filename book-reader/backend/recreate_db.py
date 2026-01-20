"""
Пересоздание БД с новой схемой (без file_data)
"""
import os
from pathlib import Path
from app.core.database import Base, engine

DATABASE_PATH = Path("data/database.db")
WAL_PATH = Path("data/database.db-wal")
SHM_PATH = Path("data/database.db-shm")

def recreate_db():
    print("Пересоздаем БД с новой схемой...")
    
    # Удаляем старые файлы БД
    for path in [DATABASE_PATH, WAL_PATH, SHM_PATH]:
        if path.exists():
            try:
                os.remove(path)
                print(f"[OK] Удален файл: {path}")
            except Exception as e:
                print(f"[WARN] Не удалось удалить {path}: {e}")
    
    # Создаем новую БД
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] БД успешно создана с новой схемой!")
    except Exception as e:
        print(f"[ERR] Ошибка создания БД: {e}")

if __name__ == "__main__":
    recreate_db()
