#!/usr/bin/env python3
"""
Тест поиска книг на Флибусте
"""
import sys
sys.path.insert(0, '.')

from app.services.flibusta_service import FlibustaService

print("=" * 60)
print("Тест поиска на Флибусте")
print("=" * 60)

service = FlibustaService()

# Тестовые запросы
test_queries = [
    "Булгаков",
    "Мастер и Маргарита",
    "Толстой"
]

for query in test_queries:
    print(f"\nПоиск: '{query}'")
    print("-" * 60)
    
    try:
        results = service.search_books(query, limit=5)
        
        if results:
            print(f"Найдено книг: {len(results)}\n")
            for i, book in enumerate(results, 1):
                print(f"{i}. {book['title']}")
                print(f"   Автор: {book['author']}")
                print(f"   ID: {book['id']}")
                print()
        else:
            print("Книги не найдены")
            
    except Exception as e:
        print(f"Ошибка: {e}")

print("=" * 60)
