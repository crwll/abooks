# Настройка доступа к Флибусте

## Варианты подключения

### 1. Обычные зеркала (Рекомендуется для начала)

Самый простой способ - использовать clearnet зеркала:

```env
FLIBUSTA_URL=https://flibusta.is
```

Другие доступные зеркала:
- `https://flibusta.is`
- `http://flibusta.is`
- `https://flibusta.appspot.com`

**Плюсы:** Работает сразу, не требует настройки  
**Минусы:** Может быть заблокировано провайдером

---

### 2. Через Tor (.onion адрес)

Для использования .onion адреса нужен запущенный Tor.

#### Windows

1. **Установите Tor Browser** или **Tor Expert Bundle**
   - Скачайте с https://www.torproject.org/download/

2. **Запустите Tor**
   - Если Tor Browser: просто запустите браузер
   - Если Expert Bundle: запустите `tor.exe`

3. **Настройте переменные окружения:**

```env
TOR_PROXY_HOST=localhost
TOR_PROXY_PORT=9050
FLIBUSTA_URL=http://flibustaongezhld6dibs2dps6vm4nvqg2kp7vgowbu76tzopgnhazqd.onion
```

4. **Проверьте, что Tor работает:**
```powershell
# Должен ответить Tor SOCKS прокси
Test-NetConnection -ComputerName localhost -Port 9050
```

#### Linux/Mac

1. **Установите Tor:**

```bash
# Ubuntu/Debian
sudo apt install tor

# MacOS
brew install tor
```

2. **Запустите Tor:**

```bash
sudo systemctl start tor
# или
tor
```

3. **Настройте .env:**

```env
TOR_PROXY_HOST=localhost
TOR_PROXY_PORT=9050
FLIBUSTA_URL=http://flibustaongezhld6dibs2dps6vm4nvqg2kp7vgowbu76tzopgnhazqd.onion
```

#### Docker

Добавьте Tor контейнер в `docker-compose.yml`:

```yaml
services:
  tor:
    image: goldy/tor-hidden-service:latest
    ports:
      - "9050:9050"
    restart: unless-stopped

  backend:
    environment:
      - TOR_PROXY_HOST=tor
      - TOR_PROXY_PORT=9050
      - FLIBUSTA_URL=http://flibustaongezhld6dibs2dps6vm4nvqg2kp7vgowbu76tzopgnhazqd.onion
    depends_on:
      - tor
```

---

## Проверка работы

### Тест подключения к Tor

```python
import requests

proxies = {
    'http': 'socks5h://localhost:9050',
    'https': 'socks5h://localhost:9050'
}

try:
    response = requests.get(
        'http://flibustaongezhld6dibs2dps6vm4nvqg2kp7vgowbu76tzopgnhazqd.onion',
        proxies=proxies,
        timeout=30
    )
    print("✓ Tor работает!")
except Exception as e:
    print(f"✗ Ошибка: {e}")
```

### Тест API

```bash
# Проверка поиска
curl "http://localhost:8000/api/flibusta/search?query=Булгаков"
```

---

## Решение проблем

### "Книги не найдены"

**Причины:**
1. Tor не запущен (для .onion)
2. Неправильный прокси
3. Зеркало недоступно

**Решение:**
```bash
# 1. Проверьте Tor
netstat -an | findstr 9050  # Windows
netstat -an | grep 9050     # Linux/Mac

# 2. Попробуйте clearnet зеркало
FLIBUSTA_URL=https://flibusta.is

# 3. Проверьте логи backend
docker-compose logs backend
```

### Timeout ошибки с .onion

.onion адреса работают медленнее. Увеличьте timeout:
- В коде уже установлен 30 секунд для скачивания
- Для поиска - 10 секунд

### Tor прокси не отвечает

```bash
# Windows - перезапустите Tor Browser
# или перезапустите tor.exe

# Linux
sudo systemctl restart tor

# Docker
docker-compose restart tor
```

---

## Рекомендации

1. **Для разработки:** используйте clearnet зеркала (`flibusta.is`)
2. **Для продакшена:** настройте Tor в Docker
3. **Резервный вариант:** в коде есть автоматический фоллбек на clearnet при проблемах с Tor

---

## Актуальные адреса (на январь 2026)

**Clearnet:**
- https://flibusta.is
- https://flibusta.appspot.com

**Onion:**
- http://flibustaongezhld6dibs2dps6vm4nvqg2kp7vgowbu76tzopgnhazqd.onion

**I2P:**
- http://flibusta.i2p (требует I2P)
