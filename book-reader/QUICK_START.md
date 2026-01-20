# Быстрый старт (без Docker)

## Для Windows разработки рекомендуется запуск без Docker

### 1. Backend

```powershell
# Переходим в папку backend
cd backend

# Создаем виртуальное окружение
python -m venv venv

# Активируем (Windows PowerShell)
.\venv\Scripts\activate

# Устанавливаем зависимости
pip install -r requirements.txt

# Инициализируем БД
python init_db.py

# Запускаем сервер
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend будет доступен на: http://localhost:8000
API документация: http://localhost:8000/docs

### 2. Frontend (в новом терминале)

```powershell
# Переходим в папку frontend
cd frontend

# Устанавливаем зависимости (первый раз)
npm install

# Запускаем dev сервер
npm run dev
```

Frontend будет доступен на: http://localhost:5173

## Переменные окружения

Создайте файл `.env` в корне проекта (опционально):

```env
# Backend будет использовать dev настройки по умолчанию
ENV=development
DEBUG=true
SKIP_TG_VALIDATION=true
```

## Проблемы и решения

### "python не найден"
Установите Python 3.11+ с https://python.org

### "npm не найден"
Установите Node.js 20+ с https://nodejs.org

### Ошибка при pip install
Обновите pip:
```powershell
python -m pip install --upgrade pip
```

### Порт занят
Измените порт в команде запуска:
```powershell
# Backend на другом порту
uvicorn app.main:app --reload --port 8001

# Frontend на другом порту
npm run dev -- --port 5174
```
