#!/usr/bin/env python3
"""
Скрипт для тестирования подключения к Флибусте
"""
import sys
import requests
from app.core.config import settings

print("=" * 60)
print("Тест подключения к Флибусте")
print("=" * 60)

# Выводим текущие настройки
print(f"\nНастройки:")
print(f"  FLIBUSTA_URL: {settings.flibusta_url}")
print(f"  TOR_PROXY_HOST: {settings.tor_proxy_host}")
print(f"  TOR_PROXY_PORT: {settings.tor_proxy_port}")
print()

# Проверка 1: Tor прокси (если используется .onion)
if '.onion' in settings.flibusta_url:
    print("[1] Проверка Tor прокси...")
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((settings.tor_proxy_host, settings.tor_proxy_port))
        sock.close()
        
        if result == 0:
            print(f"  [OK] Tor прокси доступен на {settings.tor_proxy_host}:{settings.tor_proxy_port}")
        else:
            print(f"  [FAIL] Tor прокси НЕ доступен!")
            print(f"         Запустите Tor Browser или установите Tor")
            sys.exit(1)
    except Exception as e:
        print(f"  [FAIL] Ошибка проверки прокси: {e}")
        sys.exit(1)
else:
    print("[INFO] Используется обычное зеркало (не .onion)")

# Проверка 2: Подключение к Флибусте
print("\n[2] Проверка доступа к Флибусте...")
try:
    session = requests.Session()
    
    if '.onion' in settings.flibusta_url:
        # Настраиваем Tor прокси
        proxies = {
            'http': f'socks5h://{settings.tor_proxy_host}:{settings.tor_proxy_port}',
            'https': f'socks5h://{settings.tor_proxy_host}:{settings.tor_proxy_port}'
        }
        session.proxies.update(proxies)
        print(f"  → Используем Tor прокси")
    
    # Пробуем подключиться
    print(f"  → Подключаемся к {settings.flibusta_url}...")
    response = session.get(settings.flibusta_url, timeout=30)
    
    if response.status_code == 200:
        print(f"  [OK] Флибуста доступна! (код: {response.status_code})")
    else:
        print(f"  [WARN] Получен код {response.status_code}")
        
except requests.exceptions.Timeout:
    print(f"  [FAIL] Таймаут подключения!")
    print(f"         .onion адреса работают медленно, попробуйте ещё раз")
except requests.exceptions.ConnectionError as e:
    print(f"  [FAIL] Ошибка подключения: {e}")
    print(f"\n  Рекомендации:")
    if '.onion' in settings.flibusta_url:
        print(f"    1. Убедитесь что Tor запущен")
        print(f"    2. Проверьте порт прокси (обычно 9050 или 9150)")
    else:
        print(f"    1. Проверьте интернет подключение")
        print(f"    2. Зеркало может быть заблокировано")
        print(f"    3. Попробуйте другое зеркало")
except Exception as e:
    print(f"  [FAIL] Неожиданная ошибка: {e}")

# Проверка 3: Тест поиска через OPDS
print("\n[3] Проверка OPDS каталога...")
try:
    search_url = f"{settings.flibusta_url}/opds/search?searchTerm=test"
    print(f"  → Запрос: {search_url}")
    
    response = session.get(search_url, timeout=30)
    
    if response.status_code == 200:
        print(f"  [OK] OPDS работает!")
        print(f"  [OK] Размер ответа: {len(response.content)} байт")
    else:
        print(f"  [FAIL] OPDS вернул код {response.status_code}")
        
except Exception as e:
    print(f"  [FAIL] Ошибка OPDS: {e}")

# Альтернативные зеркала
print("\n" + "=" * 60)
print("Альтернативные варианты:")
print("=" * 60)
print("\nClearnet зеркала (не требуют Tor):")
print("  - https://flibusta.is")
print("  - http://flibusta.is")
print("  - https://flibusta.appspot.com")

print("\nOnion адрес (требует Tor):")
print("  - http://flibustaongezhld6dibs2dps6vm4nvqg2kp7vgowbu76tzopgnhazqd.onion")

print("\nДля изменения добавьте в .env:")
print("  FLIBUSTA_URL=https://flibusta.is")
print()
