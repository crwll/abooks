"""
Сервис для работы с Флибустой через веб-интерфейс
"""
import requests
from typing import List, Dict, Optional
from lxml import html
from app.core.config import settings


class FlibustaService:
    """Сервис для поиска и скачивания книг с Флибусты"""
    
    # Зеркала Флибусты (можно переключаться если одно не работает)
    MIRRORS = [
        "https://flibusta.is",
        "http://flibusta.is",
        "https://flibusta.appspot.com",
    ]
    
    def __init__(self):
        # Используем настройки из конфига или дефолтное зеркало
        self.base_url = settings.flibusta_url if hasattr(settings, 'flibusta_url') and settings.flibusta_url else self.MIRRORS[0]
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Если используется .onion адрес, настраиваем Tor прокси
        if '.onion' in self.base_url:
            try:
                tor_proxy = f"socks5h://{settings.tor_proxy_host}:{settings.tor_proxy_port}"
                self.session.proxies = {
                    'http': tor_proxy,
                    'https': tor_proxy
                }
                print(f"Using Tor proxy: {tor_proxy}")
            except Exception as e:
                print(f"Error setting up Tor proxy: {e}")
                print("Falling back to clearnet mirror")
                self.base_url = self.MIRRORS[0]
                self.session.proxies = {}
    
    def search_books(self, query: str, limit: int = 20) -> List[Dict]:
        """
        Поиск книг по названию или автору
        
        Args:
            query: Поисковый запрос
            limit: Максимальное количество результатов
            
        Returns:
            List[Dict]: Список найденных книг
        """
        if not query or not query.strip():
            return []
        
        # Список URL для попытки (текущий + зеркала)
        urls_to_try = [self.base_url] + [m for m in self.MIRRORS if m != self.base_url]
        
        for url in urls_to_try:
            try:
                # Если это .onion, используем Tor прокси
                session = self.session if '.onion' in url else requests.Session()
                if '.onion' not in url:
                    session.headers.update({
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    })
                
                # Используем веб-поиск вместо OPDS
                search_url = f"{url}/booksearch"
                params = {'ask': query.strip()}
                
                print(f"Trying to search on: {url}")
                
                response = session.get(search_url, params=params, timeout=30)
                response.raise_for_status()
                
                # Парсим HTML
                books = self._parse_html_results(response.content, limit, url)
                if books:
                    print(f"Successfully found {len(books)} books on {url}")
                    self.base_url = url  # Запоминаем рабочее зеркало
                    return books
                    
            except Exception as e:
                print(f"Error searching on {url}: {e}")
                continue
        
        print("All mirrors failed")
        return []
    
    def download_book(self, book_id: str, format: str = "fb2") -> Optional[bytes]:
        """
        Скачивание книги по ID
        
        Args:
            book_id: ID книги на Флибусте
            format: Формат файла (fb2, epub, mobi)
            
        Returns:
            bytes: Содержимое файла книги
        """
        # Список URL для попытки (текущий + зеркала)
        urls_to_try = [self.base_url] + [m for m in self.MIRRORS if m != self.base_url]
        
        for url in urls_to_try:
            try:
                # Если это .onion, используем Tor прокси
                session = self.session if '.onion' in url else requests.Session()
                if '.onion' not in url:
                    session.headers.update({
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    })
                
                download_url = f"{url}/b/{book_id}/{format}"
                print(f"Trying to download from: {download_url}")
                
                response = session.get(download_url, timeout=30)
                response.raise_for_status()
                
                # Проверяем что получили
                content = response.content
                print(f"Downloaded {len(content)} bytes from {url}")
                print(f"Content-Type: {response.headers.get('Content-Type')}")
                print(f"First 100 bytes: {content[:100]}")
                
                if not content:
                    print("Empty content received")
                    continue
                
                print(f"Successfully downloaded book from {url}")
                self.base_url = url  # Запоминаем рабочее зеркало
                return content
                
            except Exception as e:
                print(f"Error downloading from {url}: {e}")
                continue
        
        print("All mirrors failed for download")
        return None
    
    def _parse_html_results(self, html_content: bytes, limit: int, base_url: str) -> List[Dict]:
        """Парсинг HTML результатов поиска"""
        results = []
        
        try:
            tree = html.fromstring(html_content)
            
            # Ищем ссылки на книги
            book_links = tree.xpath('//ul/li/a[contains(@href, "/b/")]')
            
            for link in book_links[:limit]:
                try:
                    title_text = link.text_content().strip()
                    href = link.get('href')
                    
                    if not href or not title_text:
                        continue
                    
                    # Извлекаем ID книги
                    book_id = href.split('/b/')[-1].split('/')[0]
                    
                    author = 'Неизвестный автор'
                    title = title_text
                    
                    # Пытаемся извлечь автора из родительского элемента
                    parent = link.getparent()
                    if parent is not None:
                        full_text = parent.text_content().strip()
                        
                        # Пробуем разные разделители
                        for separator in [' — ', ' - ', ': ', '—', ' – ']:
                            if separator in full_text:
                                parts = full_text.split(separator, 1)
                                potential_author = parts[0].strip()
                                potential_title = parts[1].strip() if len(parts) > 1 else title_text
                                
                                if len(potential_author) > 0 and len(potential_author) < 100:
                                    author = potential_author
                                    title = potential_title
                                    break
                    
                    results.append({
                        'id': book_id,
                        'title': title,
                        'author': author,
                        'summary': '',
                        'has_fb2': True,  # Предполагаем что FB2 доступен
                    })
                    
                except Exception as e:
                    print(f"Error parsing book link: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error parsing HTML: {e}")
            
        return results
