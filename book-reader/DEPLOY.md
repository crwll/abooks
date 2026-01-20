# Деплой на Ubuntu 22.04

## Подготовка сервера

```bash
# Установите Docker, Docker Compose и Certbot
sudo apt update
sudo apt install -y docker.io docker-compose git certbot
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Откройте порты
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Перелогиньтесь после добавления в группу docker.

## Настройка домена

Убедитесь, что DNS-запись A для `abook.testsstand.ru` указывает на IP сервера.

## Деплой проекта

```bash
# 1. Клонируйте проект
cd /opt
sudo git clone <your-repo-url> abooks
sudo chown -R $USER:$USER abooks
cd abooks/book-reader

# 2. Создайте .env файл
cp env.example .env
nano .env  # Укажите TG_BOT_TOKEN

# 3. Создайте директории
mkdir -p data/books ssl

# 4. Получите SSL сертификат
sudo certbot certonly --standalone -d abook.testsstand.ru
sudo cp /etc/letsencrypt/live/abook.testsstand.ru/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/abook.testsstand.ru/privkey.pem ssl/
sudo chown -R $USER:$USER ssl/

# 5. Запустите проект
docker-compose up -d --build

# 6. Проверьте статус
docker-compose ps
docker-compose logs -f
```

## Автообновление SSL

```bash
# Создайте скрипт обновления
sudo tee /etc/cron.monthly/renew-cert.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/abook.testsstand.ru/fullchain.pem /opt/abooks/book-reader/ssl/
cp /etc/letsencrypt/live/abook.testsstand.ru/privkey.pem /opt/abooks/book-reader/ssl/
docker restart book-reader-frontend
EOF

sudo chmod +x /etc/cron.monthly/renew-cert.sh
```

## Обновление

```bash
cd /opt/abooks/book-reader
git pull
docker-compose up -d --build
```

## Остановка

```bash
docker-compose down
```

Приложение будет доступно на порту 80 (http://your-server-ip)
