# Инструкция по деплою на Ubuntu 22.04

## Предварительные требования

- Сервер Ubuntu 22.04
- Домен и настроенный поддомен (например: books.yourdomain.com)
- SSH доступ с sudo правами
- Telegram Bot Token от @BotFather

---

## Шаг 1: Подключение к серверу и установка зависимостей

```bash
# Подключаемся к серверу
ssh user@your-server-ip

# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Добавляем текущего пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker

# Проверяем установку
docker --version
docker-compose --version
```

---

## Шаг 2: Установка и настройка Nginx + SSL

```bash
# Устанавливаем Nginx
sudo apt install -y nginx

# Устанавливаем Certbot для SSL
sudo apt install -y certbot python3-certbot-nginx

# Получаем SSL сертификат
sudo certbot --nginx -d books.yourdomain.com

# Certbot автоматически настроит Nginx и создаст конфигурацию
# Выберите опцию 2 (Redirect) для автоматического редиректа с HTTP на HTTPS
```

---

## Шаг 3: Настройка Nginx для проксирования

```bash
# Создаём конфигурацию Nginx
sudo nano /etc/nginx/sites-available/book-reader
```

Вставьте следующую конфигурацию:

```nginx
server {
    server_name books.yourdomain.com;

    # Увеличиваем лимиты для загрузки книг
    client_max_body_size 50M;

    # Фронтенд (статика)
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API бэкенда
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Увеличиваем таймауты для Flibusta
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/books.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/books.yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = books.yourdomain.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name books.yourdomain.com;
    return 404;
}
```

```bash
# Активируем конфигурацию
sudo ln -s /etc/nginx/sites-available/book-reader /etc/nginx/sites-enabled/

# Удаляем дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Шаг 4: Установка Tor для доступа к Flibusta

```bash
# Устанавливаем Tor
sudo apt install -y tor

# Запускаем и добавляем в автозагрузку
sudo systemctl start tor
sudo systemctl enable tor

# Проверяем, что Tor работает на порту 9050
sudo netstat -tlnp | grep 9050
```

---

## Шаг 5: Подготовка проекта на сервере

```bash
# Создаём директорию для проекта
mkdir -p ~/book-reader
cd ~/book-reader

# Клонируем проект (если используете Git)
# git clone your-repo-url .

# ИЛИ загружаем файлы через scp с локальной машины:
```

На вашей **локальной машине**:

```bash
# Из директории проекта
scp -r book-reader/ user@your-server-ip:~/book-reader/
```

---

## Шаг 6: Настройка переменных окружения

На сервере:

```bash
cd ~/book-reader
nano .env
```

Создайте `.env` файл со следующим содержимым:

```env
# Окружение
ENV=production
DEBUG=false

# Telegram Bot
TG_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
SKIP_TG_VALIDATION=false

# База данных
DATABASE_URL=sqlite:///./data/database.db

# Flibusta
FLIBUSTA_URL=http://flibustaongezhld6dibs2dps6vm4nvqg2kp7vgowbu76tzopgnhazqd.onion
TOR_PROXY_HOST=172.17.0.1
TOR_PROXY_PORT=9050
```

**Важно:**
- Замените `YOUR_BOT_TOKEN_HERE` на реальный токен от @BotFather
- `172.17.0.1` - это IP хоста Docker для доступа к Tor на хосте
- Можно также использовать clearnet зеркало: `FLIBUSTA_URL=https://flibusta.is`

```bash
# Сохраняем (Ctrl+O, Enter, Ctrl+X)
```

---

## Шаг 7: Создание структуры данных

```bash
cd ~/book-reader

# Создаём директорию для данных
mkdir -p data/books

# Устанавливаем права
chmod 755 data
chmod 755 data/books
```

---

## Шаг 8: Запуск приложения

```bash
cd ~/book-reader

# Собираем и запускаем контейнеры
docker-compose up -d --build

# Проверяем статус контейнеров
docker-compose ps

# Смотрим логи
docker-compose logs -f

# Для выхода из логов нажмите Ctrl+C
```

Контейнеры должны быть в статусе `Up`:
- `book-reader-backend` - порт 8000
- `book-reader-frontend` - порт 80

---

## Шаг 9: Проверка работоспособности

```bash
# Проверяем API бэкенда
curl http://localhost:8000/api/health

# Проверяем фронтенд
curl http://localhost:80

# Проверяем через домен
curl https://books.yourdomain.com
```

---

## Шаг 10: Настройка Telegram Bot

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)

2. Настройте WebApp URL:
```
/newapp
Выберите вашего бота
Название: Book Reader
URL: https://books.yourdomain.com
Короткое имя: reader
```

3. Настройте Menu Button:
```
/setmenubutton
Выберите вашего бота
Текст: 📚 Открыть читалку
URL: https://books.yourdomain.com
```

4. Протестируйте:
   - Найдите своего бота в Telegram
   - Нажмите `/start`
   - Нажмите кнопку "Открыть читалку"
   - Приложение должно открыться

---

## Шаг 11: Настройка автозапуска и мониторинга

```bash
# Создаём systemd сервис для автозапуска
sudo nano /etc/systemd/system/book-reader.service
```

Вставьте:

```ini
[Unit]
Description=Book Reader Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/YOUR_USERNAME/book-reader
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=YOUR_USERNAME

[Install]
WantedBy=multi-user.target
```

**Замените `YOUR_USERNAME` на ваше имя пользователя!**

```bash
# Активируем сервис
sudo systemctl daemon-reload
sudo systemctl enable book-reader.service

# Проверяем
sudo systemctl status book-reader.service
```

---

## Полезные команды для управления

### Просмотр логов:
```bash
cd ~/book-reader

# Все логи
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только frontend
docker-compose logs -f frontend

# Последние 100 строк
docker-compose logs --tail=100 backend
```

### Перезапуск:
```bash
cd ~/book-reader

# Перезапуск всего
docker-compose restart

# Перезапуск только backend
docker-compose restart backend

# Полная пересборка
docker-compose down
docker-compose up -d --build
```

### Обновление приложения:
```bash
cd ~/book-reader

# Загружаем новый код (через git или scp)
git pull  # если используете git

# Пересобираем и перезапускаем
docker-compose down
docker-compose up -d --build
```

### Очистка:
```bash
# Удаляем старые образы
docker system prune -a

# Удаляем всё (ВНИМАНИЕ: удалит данные!)
docker-compose down -v
```

### Резервное копирование БД:
```bash
# Создаём бэкап
cp ~/book-reader/data/database.db ~/book-reader/data/database.db.backup-$(date +%Y%m%d)

# Автоматический ежедневный бэкап через cron
crontab -e
# Добавьте строку:
0 3 * * * cp ~/book-reader/data/database.db ~/book-reader/data/database.db.backup-$(date +\%Y\%m\%d)
```

---

## Проверка Flibusta

```bash
# Проверяем, что Tor работает
sudo systemctl status tor

# Тестируем поиск книг
curl "http://localhost:8000/api/flibusta/search?query=Булгаков"
```

Если поиск не работает:
1. Проверьте `.env` файл
2. Убедитесь, что Tor запущен
3. Попробуйте использовать clearnet зеркало: `FLIBUSTA_URL=https://flibusta.is`
4. Перезапустите контейнеры

---

## Автообновление SSL сертификата

```bash
# Certbot автоматически настраивает обновление через systemd timer
sudo systemctl status certbot.timer

# Проверка автообновления (dry-run)
sudo certbot renew --dry-run
```

---

## Решение проблем

### Контейнеры не запускаются:
```bash
docker-compose logs
# Смотрим ошибки в логах
```

### Ошибка доступа к Tor:
```bash
# Проверяем Tor
sudo systemctl status tor
sudo netstat -tlnp | grep 9050

# Используйте clearnet вместо Tor (в .env):
FLIBUSTA_URL=https://flibusta.is
# Закомментируйте TOR_PROXY_HOST и TOR_PROXY_PORT
```

### Nginx ошибки:
```bash
sudo nginx -t
sudo systemctl status nginx
sudo journalctl -u nginx -n 50
```

### Telegram не открывает WebApp:
- Проверьте, что домен доступен: `curl https://books.yourdomain.com`
- Убедитесь, что SSL сертификат валиден
- Проверьте URL в настройках бота у @BotFather

---

## Безопасность (опционально)

### Настройка firewall:
```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### Ограничение доступа только для Telegram IP:
```nginx
# В /etc/nginx/sites-available/book-reader добавьте в location /:
location / {
    # Telegram IP ranges (примерные, проверьте актуальные)
    allow 149.154.160.0/20;
    allow 91.108.4.0/22;
    deny all;
    
    proxy_pass http://localhost:80;
    # ... остальные настройки
}
```

---

## Мониторинг производительности

```bash
# Использование ресурсов контейнерами
docker stats

# Место на диске
df -h
du -sh ~/book-reader/data

# Размер БД
ls -lh ~/book-reader/data/database.db
```

---

## Поздравляем! 🎉

Ваше приложение развёрнуто и работает на:
- **URL:** https://books.yourdomain.com
- **API:** https://books.yourdomain.com/api
- **Telegram Bot:** @your_bot_name

Теперь пользователи могут открыть бота в Telegram и начать читать книги!
