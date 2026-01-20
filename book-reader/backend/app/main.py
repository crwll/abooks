from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import auth, users, books, user_books, bookmarks, reading_sessions, flibusta

app = FastAPI(
    title="Book Reader API",
    description="API для Telegram WebApp читалки книг",
    version="1.0.0",
    debug=settings.debug
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(books.router)
app.include_router(user_books.router)
app.include_router(bookmarks.router)
app.include_router(reading_sessions.router)
app.include_router(flibusta.router)


@app.on_event("startup")
async def startup_event():
    init_db()


@app.get("/")
async def root():
    return {
        "message": "Book Reader API",
        "version": "1.0.0",
        "env": settings.env,
        "debug": settings.debug
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
