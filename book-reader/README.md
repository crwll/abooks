# Book Reader - Telegram WebApp

Telegram WebApp для чтения электронных книг с поддержкой Spritz, библиотеки, закладок и интеграцией с Флибустой.

## Технологический стек

- **Frontend**: React, Tailwind CSS, lucide-react
- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: SQLite
- **Infrastructure**: Docker, Docker Compose

## Быстрый старт

### Development режим (без Telegram)

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Запустите с Docker Compose:
```bash
docker-compose -f docker-compose.dev.yml up
```

3. Откройте в браузере:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Production режим (с Telegram)

1. Настройте `.env` с production параметрами
2. Запустите:
```bash
docker-compose up -d
```

## Разработка без Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Структура проекта

```
book-reader/
├── frontend/          # React приложение
├── backend/           # FastAPI приложение
├── data/              # Данные (книги, БД)
└── docker-compose.yml # Docker конфигурация
```

## Особенности

- 🎨 Современный UI с темной/светлой темой
- 📚 Парсинг FB2 формата
- 🔖 Система закладок
- ⚡ Режим скорочтения Spritz
- 📊 Статистика чтения
- 🔍 Поиск на Флибусте
- 💾 Автосохранение прогресса
