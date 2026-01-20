from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.config import settings

# Настройки для SQLite
connect_args = {}
engine_kwargs = {}

if "sqlite" in settings.database_url:
    connect_args = {
        "check_same_thread": False,
        "timeout": 30
    }
    # Используем StaticPool для SQLite чтобы переиспользовать одно соединение
    engine_kwargs = {
        "poolclass": StaticPool,
        "connect_args": connect_args,
    }
else:
    engine_kwargs = {
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
    }

engine = create_engine(settings.database_url, **engine_kwargs)

# Включаем WAL режим для SQLite (улучшает конкурентность)
if "sqlite" in settings.database_url:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        try:
            # Пытаемся включить WAL режим, но не падаем если не получается
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
        except Exception as e:
            print(f"Warning: Could not set WAL mode: {e}")
            # Продолжаем работу в обычном режиме
        
        # Этот параметр важнее - он точно должен быть установлен
        cursor.execute("PRAGMA busy_timeout=60000")  # 60 секунд
        cursor.execute("PRAGMA temp_store=MEMORY")  # Временные данные в памяти
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
