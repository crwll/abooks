import re
from lxml import etree
from typing import Dict, List, Optional
import base64


class FB2Parser:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.tree = None
        self.root = None
        self.ns = {'fb': 'http://www.gribuser.ru/xml/fictionbook/2.0'}
        
    def parse(self) -> Dict:
        try:
            self.tree = etree.parse(self.file_path)
            self.root = self.tree.getroot()
            
            return {
                "title": self.get_title(),
                "author": self.get_author(),
                "annotation": self.get_annotation(),
                "cover": self.get_cover(),
                "chapters": self.get_chapters(),
                "total_pages": self.estimate_pages()
            }
        except Exception as e:
            raise Exception(f"Error parsing FB2: {str(e)}")
    
    def get_title(self) -> str:
        title_elem = self.root.find('.//fb:title-info/fb:book-title', self.ns)
        return title_elem.text.strip() if title_elem is not None and title_elem.text else "Без названия"
    
    def get_author(self) -> str:
        author_elem = self.root.find('.//fb:title-info/fb:author', self.ns)
        if author_elem is not None:
            first_name = author_elem.find('fb:first-name', self.ns)
            last_name = author_elem.find('fb:last-name', self.ns)
            
            parts = []
            if first_name is not None and first_name.text:
                parts.append(first_name.text.strip())
            if last_name is not None and last_name.text:
                parts.append(last_name.text.strip())
            
            return ' '.join(parts) if parts else "Неизвестный автор"
        return "Неизвестный автор"
    
    def get_annotation(self) -> Optional[str]:
        annotation_elem = self.root.find('.//fb:title-info/fb:annotation', self.ns)
        if annotation_elem is not None:
            text_parts = []
            for p in annotation_elem.findall('.//fb:p', self.ns):
                if p.text:
                    text_parts.append(p.text.strip())
            return '\n\n'.join(text_parts) if text_parts else None
        return None
    
    def get_cover(self) -> Optional[bytes]:
        coverpage = self.root.find('.//fb:title-info/fb:coverpage', self.ns)
        if coverpage is not None:
            image_elem = coverpage.find('.//fb:image', self.ns)
            if image_elem is not None:
                href = image_elem.get('{http://www.w3.org/1999/xlink}href')
                if href and href.startswith('#'):
                    binary_id = href[1:]
                    binary_elem = self.root.find(f'.//fb:binary[@id="{binary_id}"]', self.ns)
                    if binary_elem is not None and binary_elem.text:
                        try:
                            return base64.b64decode(binary_elem.text)
                        except:
                            pass
        return None
    
    def get_chapters(self) -> List[Dict]:
        chapters = []
        body = self.root.find('.//fb:body', self.ns)
        
        if body is not None:
            # Ищем только секции ПЕРВОГО уровня (прямые дети body)
            sections = body.findall('fb:section', self.ns)
            
            if not sections:
                sections = [body]
            
            for i, section in enumerate(sections):
                # Ищем title только на первом уровне секции
                title_elem = section.find('fb:title', self.ns)
                title = "Глава " + str(i + 1)
                
                if title_elem is not None:
                    title_parts = []
                    for p in title_elem.findall('fb:p', self.ns):
                        # Используем itertext() для захвата текста внутри вложенных тегов
                        text = ''.join(p.itertext()).strip()
                        if text:
                            title_parts.append(text)
                    if title_parts:
                        title = ' '.join(title_parts)
                
                # Извлекаем контент с учетом вложенных подсекций
                content = self.extract_section_content(section, skip_title=True, level=1)
                
                if content:
                    chapters.append({
                        "title": title,
                        "content": content
                    })
        
        return chapters
    
    def extract_section_content(self, section, skip_title=False, level=1) -> str:
        paragraphs = []
        
        for elem in section:
            # Пропускаем title на первом уровне, если указано
            if skip_title and elem.tag.endswith('title'):
                continue
                
            if elem.tag.endswith('p'):
                text = ''.join(elem.itertext()).strip()
                if text:
                    paragraphs.append(text)
                    
            elif elem.tag.endswith('section'):
                # Обрабатываем вложенные подсекции (подглавы)
                subsection_title_elem = elem.find('fb:title', self.ns)
                if subsection_title_elem is not None:
                    title_parts = []
                    for p in subsection_title_elem.findall('fb:p', self.ns):
                        # Используем itertext() для захвата текста внутри вложенных тегов (<strong>, <em> и т.д.)
                        text = ''.join(p.itertext()).strip()
                        if text:
                            title_parts.append(text)
                    if title_parts:
                        # Добавляем маркеры в зависимости от уровня вложенности
                        marker = '#' * min(level + 2, 6)  # Максимум 6 уровней
                        paragraphs.append(marker + ' ' + ' '.join(title_parts))
                
                # Рекурсивно извлекаем контент подсекции с увеличенным уровнем
                subsection_content = self.extract_section_content(elem, skip_title=True, level=level + 1)
                if subsection_content:
                    paragraphs.append(subsection_content)
        
        return '\n\n'.join(paragraphs)
    
    def estimate_pages(self) -> int:
        body = self.root.find('.//fb:body', self.ns)
        if body is not None:
            text = ''.join(body.itertext())
            words = len(text.split())
            return max(1, words // 250)
        return 1
