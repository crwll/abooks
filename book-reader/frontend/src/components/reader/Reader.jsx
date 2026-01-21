import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight, Sun, Moon, Zap, List, Hash } from 'lucide-react';
import { getTheme } from '../../utils/theme';
import { getBooksService } from '../../services/books';
import api from '../../services/api';
import SpritzReader from '../spritz/SpritzReader';

const Reader = ({ darkMode, setDarkMode }) => {
  const theme = getTheme(darkMode);
  const navigate = useNavigate();
  const { bookId } = useParams();
  
  const [showControls, setShowControls] = useState(true);
  const [book, setBook] = useState(null);
  const [fullContent, setFullContent] = useState(''); 
  const [chaptersInfo, setChaptersInfo] = useState([]); // Инфо о главах (название, индекс)
  const [currentChapterTitle, setCurrentChapterTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // Spritz states
  const [spritzMode, setSpritzMode] = useState(false);
  const [rawChapters, setRawChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showSpritzEndModal, setShowSpritzEndModal] = useState(false);
  const [spritzInitialIndex, setSpritzInitialIndex] = useState(0);
  
  // Navigation modals
  const [showPageModal, setShowPageModal] = useState(false);
  const [showTocModal, setShowTocModal] = useState(false);
  const [pageInputValue, setPageInputValue] = useState('');
  
  const contentRef = useRef(null);
  const currentAnchorRef = useRef(null);

  // Загрузка книги и всего контента
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [bookData, contentData] = await Promise.all([
          getBooksService.getById(bookId),
          getBooksService.getContent(bookId)
        ]);
        
        setBook(bookData);
        
        if (contentData?.chapters) {
           setRawChapters(contentData.chapters);
           let fullText = '';
           const info = [];
           contentData.chapters.forEach((ch, idx) => {
               const chapterId = `chapter-${idx}`;
               info.push({ id: chapterId, title: ch.title, index: idx });

               // Параграфы с ID для отслеживания позиции
               const paragraphs = ch.content
                   .split('\n\n')
                   .filter(p => p.trim())
                   .map((p, pIdx) => {
                       const trimmed = p.trim();
                       
                       // Проверяем, является ли параграф подзаголовком (поддержка разных уровней)
                       const headerMatch = trimmed.match(/^(#{3,6})\s+(.+)$/);
                       if (headerMatch) {
                           const level = headerMatch[1].length; // 3, 4, 5 или 6
                           const subtitle = headerMatch[2];
                           
                           // Символы и стили в зависимости от уровня вложенности
                           const styles = {
                               3: { symbol: '§', fontSize: '1em', marginTop: '1.5em', indent: '0em' },
                               4: { symbol: '◆', fontSize: '1em', marginTop: '1.2em', indent: '1em' },
                               5: { symbol: '●', fontSize: '0.95em', marginTop: '1em', indent: '2em' },
                               6: { symbol: '◦', fontSize: '0.95em', marginTop: '0.8em', indent: '3em' }
                           };
                           
                           const style = styles[level] || styles[3];
                           
                           return `
                               <p id="${chapterId}-p-${pIdx}" class="reader-subheader" style="
                                   margin: ${style.marginTop} 0 0.6em 0; 
                                   padding-left: ${style.indent};
                                   text-align: left;
                                   font-size: ${style.fontSize}; 
                                   font-weight: 600; 
                                   opacity: 0.5;
                                   text-indent: 0;
                                   break-after: avoid;
                               "><span style="font-family: monospace; font-weight: 700;">${style.symbol}</span> ${subtitle}</p>
                           `;
                       }
                       
                       return `<p id="${chapterId}-p-${pIdx}" class="reader-paragraph" style="margin-bottom: 0.8em; text-align: justify; text-indent: 1.5em;">${trimmed}</p>`;
                   })
                   .join('');

               // break-before: column гарантирует начало с новой колонки (страницы)
               // Добавляем ID и класс к заголовку для отслеживания
               fullText += `
                 <div id="${chapterId}" class="chapter" style="break-before: column; margin-bottom: 20vh;">
                    <h3 id="${chapterId}-title" class="reader-header" style="font-size: 1.4em; font-weight: bold; margin-bottom: 1em; margin-top: 1em; color: inherit; text-align: center; break-after: avoid;">${ch.title}</h3>
                    ${paragraphs}
                 </div>
               `;
           });
           setFullContent(fullText);
           setChaptersInfo(info);
        }

      } catch (error) {
        console.error('Error loading:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bookId]);

  // Расчет страниц и восстановление позиции
  useEffect(() => {
    const timer = setTimeout(calculatePages, 150);
    const handleResize = () => calculatePages();
    window.addEventListener('resize', handleResize);
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
    };
  }, [fullContent, fontSize]);

  // Обновляем "якорь" (видимый элемент) при смене страницы
  useEffect(() => {
      // Ждем окончания анимации перехода (300мс) + небольшой буфер
      const timer = setTimeout(updateAnchor, 350);
      return () => clearTimeout(timer);
  }, [currentPage]);

  // Обновление заголовка главы при смене страницы
  useEffect(() => {
      findCurrentChapter();
  }, [currentPage, chaptersInfo, totalPages]);

  // Восстановление позиции при первой загрузке
  useEffect(() => {
      if (book && totalPages > 1 && currentPage === 0 && book.progress_percent > 0) {
          const page = Math.floor((book.progress_percent / 100) * totalPages);
          setCurrentPage(Math.min(page, totalPages - 1));
      }
  }, [book, totalPages]);

  const updateAnchor = () => {
      // Ищем элемент в центре экрана
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      const el = document.elementFromPoint(x, y);
      
      if (el) {
          // Ищем ближайший параграф или заголовок с ID
          const target = el.closest('.reader-paragraph, .reader-header');
          if (target && target.id) {
              currentAnchorRef.current = target.id;
          }
      }
  };

  const calculatePages = () => {
    if (contentRef.current) {
        const scrollW = contentRef.current.scrollWidth;
        const screenW = window.innerWidth;
        const pages = Math.ceil(scrollW / screenW);
        const newTotalPages = Math.max(1, pages);
        
        let newPage = 0;
        
        // Пытаемся восстановить позицию по якорю
        if (currentAnchorRef.current) {
            const anchor = document.getElementById(currentAnchorRef.current);
            if (anchor) {
                // offsetLeft показывает в какой колонке (странице) начинается элемент
                const anchorPage = Math.floor(anchor.offsetLeft / screenW);
                newPage = Math.min(anchorPage, newTotalPages - 1);
            } else {
                // Если якорь не найден, пытаемся остаться пропорционально (фоллбэк)
                // Но лучше использовать текущую страницу, если просто ресайз без смены контента
                newPage = Math.min(currentPage, Math.max(0, newTotalPages - 1));
            }
        } else {
             // Фоллбэк для начальной загрузки или если якоря нет
             newPage = Math.min(currentPage, Math.max(0, newTotalPages - 1));
        }

        setTotalPages(newTotalPages);
        setCurrentPage(newPage);
    }
  };

  const findCurrentChapter = () => {
      if (!contentRef.current || !chaptersInfo.length) return;
      
      const currentScrollX = currentPage * window.innerWidth;
      let foundTitle = chaptersInfo[0].title;
      let foundIndex = 0;
      let maxOffsetLeft = -1;
      
      for (const ch of chaptersInfo) {
          const el = document.getElementById(ch.id);
          if (el && el.offsetLeft !== undefined) {
              // Ищем главу с максимальным offsetLeft, который <= текущей позиции
              if (el.offsetLeft <= currentScrollX && el.offsetLeft > maxOffsetLeft) {
                  maxOffsetLeft = el.offsetLeft;
                  foundTitle = ch.title;
                  foundIndex = ch.index;
              }
          }
      }
      setCurrentChapterTitle(foundTitle);
      setCurrentChapterIndex(foundIndex);
  };
  
  const handleSpritzClose = (lastIndex, totalWords) => {
      setSpritzMode(false);
      
      const currentChapter = rawChapters[currentChapterIndex];
      const chapterInfo = chaptersInfo.find(c => c.index === currentChapterIndex);
      
      if (currentChapter && chapterInfo && lastIndex > 0) {
          // Split into paragraphs exactly as we did for rendering
          const paragraphs = currentChapter.content.split('\n\n').filter(p => p.trim());
          
          let wordCount = 0;
          let targetParagraphIndex = paragraphs.length > 0 ? paragraphs.length - 1 : 0;
          
          for (let i = 0; i < paragraphs.length; i++) {
              // Same split logic as SpritzReader
              const pWords = paragraphs[i].split(/\s+/).filter(w => w.length > 0).length;
              if (wordCount + pWords > lastIndex) {
                  targetParagraphIndex = i;
                  break;
              }
              wordCount += pWords;
          }
          
          // Find the element
          const paragraphId = `${chapterInfo.id}-p-${targetParagraphIndex}`;
          const el = document.getElementById(paragraphId);
          
          if (el) {
              const newPage = Math.floor(el.offsetLeft / window.innerWidth);
              changePage(newPage);
          }
      }
  };

  const startSpritz = () => {
      // Находим главу по видимому элементу в центре экрана
      let actualChapterIndex = 0;
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      const centerElement = document.elementFromPoint(x, y);
      
      if (centerElement) {
          // Ищем ближайший элемент с классом chapter
          const chapterElement = centerElement.closest('.chapter');
          if (chapterElement && chapterElement.id) {
              // ID имеет формат "chapter-N"
              const match = chapterElement.id.match(/^chapter-(\d+)$/);
              if (match) {
                  actualChapterIndex = parseInt(match[1], 10);
              }
          }
      }
      
      let startIndex = 0;
      const selection = window.getSelection();
      
      if (selection && selection.toString().trim().length > 0) {
          const selectedText = selection.toString().trim();
          const currentContent = rawChapters[actualChapterIndex]?.content || '';
          
          const idx = currentContent.indexOf(selectedText);
          if (idx !== -1) {
              const textBefore = currentContent.substring(0, idx);
              const wordsBefore = textBefore.split(/\s+/).filter(w => w.length > 0).length;
              startIndex = wordsBefore;
          }
      } else {
           const currentChapter = rawChapters[actualChapterIndex];
           if (currentChapter && currentAnchorRef.current) {
               const anchorId = currentAnchorRef.current;
               
               if (anchorId.startsWith(`chapter-${actualChapterIndex}-`)) {
                   if (anchorId.includes('-title')) {
                       startIndex = 0;
                   } else if (anchorId.includes('-p-')) {
                       const parts = anchorId.split('-p-');
                       if (parts.length === 2) {
                           const pIdx = parseInt(parts[1], 10);
                           
                           const paragraphs = currentChapter.content.split('\n\n').filter(p => p.trim());
                           let wordsCount = 0;
                           
                           for (let i = 0; i < pIdx && i < paragraphs.length; i++) {
                               const pWords = paragraphs[i].split(/\s+/).filter(w => w.length > 0).length;
                               wordsCount += pWords;
                           }
                           startIndex = wordsCount;
                       }
                   }
               }
           }
      }

      // Обновляем индекс главы синхронно
      setCurrentChapterIndex(actualChapterIndex);
      setSpritzInitialIndex(startIndex);
      setSpritzMode(true);
  };

  const handleSpritzComplete = () => {
    setShowSpritzEndModal(true);
  };

  const handleNextChapterSpritz = () => {
    const nextIndex = currentChapterIndex + 1;
    if (nextIndex < rawChapters.length) {
        setCurrentChapterIndex(nextIndex);
        setShowSpritzEndModal(false);
        
        // Sync reader position to the new chapter
        const nextChapterInfo = chaptersInfo.find(ch => ch.index === nextIndex);
        if (nextChapterInfo) {
            const el = document.getElementById(nextChapterInfo.id);
            if (el) {
                const page = Math.round(el.offsetLeft / window.innerWidth);
                setCurrentPage(page);
                updatePosition(page);
            }
        }
    } else {
        setSpritzMode(false);
        setShowSpritzEndModal(false);
    }
  };

  const updatePosition = async (page) => {
      if (!book) return;
      const progress = (page / totalPages) * 100;
      try {
          await api.put(`/api/user-books/${book.id}/position`, {
              current_position: page,
              progress_percent: progress
          });
      } catch (err) { console.error(err); }
  };

  const changePage = (newPage) => {
      const p = Math.max(0, Math.min(newPage, totalPages - 1));
      setCurrentPage(p);
      updatePosition(p);
      if (showControls) setShowControls(false);
  };
  
  const changeFontSize = (delta) => {
      // Перед изменением шрифта обновляем якорь, чтобы не потерять место
      updateAnchor();
      setFontSize(prev => Math.max(14, Math.min(32, prev + delta)));
  };

  const handleGoToPage = () => {
      const pageNum = parseInt(pageInputValue, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          changePage(pageNum - 1);
          setShowPageModal(false);
          setPageInputValue('');
      }
  };

  const handleGoToChapter = (chapterIndex) => {
      const chapterInfo = chaptersInfo.find(ch => ch.index === chapterIndex);
      if (chapterInfo) {
          const el = document.getElementById(chapterInfo.id);
          if (el) {
              const page = Math.floor(el.offsetLeft / window.innerWidth);
              changePage(page);
              setShowTocModal(false);
          }
      }
  };

  if (loading) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, color: theme.textSecondary }}>Загрузка...</div>;
  }

  return (
    <div 
      style={{ 
        height: '100vh', 
        height: 'var(--tg-viewport-height, 100vh)',
        width: '100vw', 
        background: theme.bg, 
        overflow: 'hidden',
        position: 'relative'
      }}
      onClick={() => setShowControls(!showControls)}
    >
      {/* Header */}
      <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          padding: '16px',
          paddingTop: 'max(16px, calc(var(--tg-content-safe-area-inset-top, var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px))) + 8px))',
          background: theme.bg,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 50,
          transform: showControls ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
          <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} style={{ background: theme.surface2, border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
             <ArrowLeft size={20} color={theme.textPrimary} />
          </button>
          
          <div style={{ flex: 1, textAlign: 'center', padding: '0 12px' }}>
              <div style={{ fontWeight: 'bold', color: theme.textPrimary, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {book?.book?.title}
              </div>
              <div style={{ fontSize: '12px', color: theme.textTertiary, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentChapterTitle}
              </div>
          </div>
          
          <button onClick={(e) => { e.stopPropagation(); setFavorite(!favorite); }} style={{ background: theme.surface2, border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
             <Heart size={20} color={favorite ? theme.error : theme.textPrimary} fill={favorite ? theme.error : 'none'} />
          </button>
      </div>

      {/* Font Controls */}
      <div style={{
          position: 'fixed',
          top: 'calc(80px + var(--tg-content-safe-area-inset-top, var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px))))',
          left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: '12px',
          zIndex: 49,
          transform: showControls ? 'translateY(0)' : 'translateY(-200%)',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          transition: 'transform 0.3s ease, opacity 0.2s ease'
      }}>
          <div style={{ background: theme.surface1, padding: '8px 16px', borderRadius: '24px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => changeFontSize(-1)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textPrimary }}>A-</button>
              <span style={{ fontSize: '14px', color: theme.textSecondary, minWidth: '24px', textAlign: 'center' }}>{fontSize}</span>
              <button onClick={() => changeFontSize(1)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: theme.textPrimary }}>A+</button>
              <div style={{ width: 1, height: 20, background: theme.divider }}></div>
              <button onClick={() => { setShowTocModal(true); setShowControls(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textPrimary }} title="Оглавление">
                  <List size={20} />
              </button>
              <div style={{ width: 1, height: 20, background: theme.divider }}></div>
              <button onClick={() => { setShowPageModal(true); setShowControls(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textPrimary }} title="Перейти на страницу">
                  <Hash size={20} />
              </button>
              <div style={{ width: 1, height: 20, background: theme.divider }}></div>
              <button onClick={() => startSpritz()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textPrimary }} title="Spritz чтение">
                  <Zap size={20} />
              </button>
              <div style={{ width: 1, height: 20, background: theme.divider }}></div>
              <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textPrimary }}>
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
          </div>
      </div>

      {/* Content Area */}
      <div style={{ 
          position: 'absolute',
          top: 'calc(70px + var(--tg-content-safe-area-inset-top, var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px))))', 
          bottom: 'calc(70px + var(--tg-content-safe-area-inset-bottom, var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))))',
          left: 0,
          right: 0,
          overflow: 'hidden' 
      }}>
          <div 
             ref={contentRef}
             style={{
                 height: '100%',
                 width: '100%',
                 columnWidth: 'calc(100vw - 32px)', 
                 columnGap: '32px',
                 columnFill: 'auto',
                 fontSize: `${fontSize}px`,
                 lineHeight: '1.6',
                 textAlign: 'justify',
                 color: theme.textPrimary,
                 transform: `translateX(calc(-${currentPage} * 100vw))`,
                 transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                 padding: '0 16px',
                 boxSizing: 'border-box'
             }}
             dangerouslySetInnerHTML={{ __html: fullContent }}
          />
      </div>

      {/* Click Zones */}
      <div style={{ 
        position: 'absolute', 
        top: 'calc(70px + var(--tg-content-safe-area-inset-top, var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px))))', 
        bottom: 'calc(70px + var(--tg-content-safe-area-inset-bottom, var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))))', 
        left: 0, width: '30%', zIndex: 10 
      }} onClick={(e) => { e.stopPropagation(); changePage(currentPage - 1); }} />
      <div style={{ 
        position: 'absolute', 
        top: 'calc(70px + var(--tg-content-safe-area-inset-top, var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px))))', 
        bottom: 'calc(70px + var(--tg-content-safe-area-inset-bottom, var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))))', 
        right: 0, width: '30%', zIndex: 10 
      }} onClick={(e) => { e.stopPropagation(); changePage(currentPage + 1); }} />

      {/* Footer */}
      <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '16px',
          paddingBottom: 'max(16px, calc(var(--tg-content-safe-area-inset-bottom, var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))) + 8px))',
          background: theme.bg,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 50,
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
      }}>
          <button 
             onClick={(e) => { e.stopPropagation(); changePage(currentPage - 1); }}
             disabled={currentPage === 0}
             style={{ 
                 background: theme.surface2, border: 'none', borderRadius: '50%', width: 44, height: 44, 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                 opacity: currentPage === 0 ? 0.5 : 1
             }}
          >
              <ChevronLeft size={24} color={theme.textPrimary} />
          </button>
          
          <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                  {currentPage + 1} / {totalPages}
              </div>
              <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '2px' }}>
                  {Math.round(((currentPage + 1) / totalPages) * 100)}%
              </div>
          </div>
          
          <button 
             onClick={(e) => { e.stopPropagation(); changePage(currentPage + 1); }}
             disabled={currentPage >= totalPages - 1}
             style={{ 
                 background: theme.surface2, border: 'none', borderRadius: '50%', width: 44, height: 44, 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                 opacity: currentPage >= totalPages - 1 ? 0.5 : 1
             }}
          >
              <ChevronRight size={24} color={theme.textPrimary} />
          </button>
      </div>

      {/* Spritz Reader Overlay */}
      {spritzMode && rawChapters.length > 0 && (
          <SpritzReader
              content={rawChapters[currentChapterIndex]?.content || ''}
              title={rawChapters[currentChapterIndex]?.title || ''}
              darkMode={darkMode}
              onComplete={handleSpritzComplete}
              onClose={handleSpritzClose}
              initialIndex={spritzInitialIndex}
              key={`${currentChapterIndex}-${spritzInitialIndex}`} 
          />
      )}

      {/* Spritz End Chapter Modal */}
      {showSpritzEndModal && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
              <div style={{
                  background: theme.surface1, padding: '24px', borderRadius: '12px',
                  maxWidth: '300px', textAlign: 'center', color: theme.textPrimary
              }}>
                  <h3 style={{ marginBottom: '16px' }}>Глава прочитана</h3>
                  <p style={{ marginBottom: '24px', color: theme.textSecondary }}>Перейти к следующей главе?</p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button onClick={() => { setSpritzMode(false); setShowSpritzEndModal(false); }} style={{
                          padding: '8px 16px', borderRadius: '8px', border: `1px solid ${theme.divider}`,
                          background: 'transparent', color: theme.textPrimary, cursor: 'pointer'
                      }}>
                          Выход
                      </button>
                      <button onClick={handleNextChapterSpritz} style={{
                          padding: '8px 16px', borderRadius: '8px', border: 'none',
                          background: theme.accent, color: '#fff', cursor: 'pointer'
                      }}>
                          Далее
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Go To Page Modal */}
      {showPageModal && (
          <div 
              style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.8)', zIndex: 200,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onClick={() => { setShowPageModal(false); setPageInputValue(''); }}
          >
              <div 
                  style={{
                      background: theme.surface1, padding: '24px', borderRadius: '12px',
                      maxWidth: '320px', width: '90%', color: theme.textPrimary
                  }}
                  onClick={e => e.stopPropagation()}
              >
                  <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Перейти на страницу</h3>
                  <div style={{ marginBottom: '20px' }}>
                      <input 
                          type="number"
                          min="1"
                          max={totalPages}
                          value={pageInputValue}
                          onChange={e => setPageInputValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleGoToPage(); }}
                          placeholder={`1 - ${totalPages}`}
                          autoFocus
                          style={{
                              width: '100%', padding: '12px', borderRadius: '8px',
                              border: `1px solid ${theme.divider}`, background: theme.surface2,
                              color: theme.textPrimary, fontSize: '16px', textAlign: 'center',
                              boxSizing: 'border-box'
                          }}
                      />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                          onClick={() => { setShowPageModal(false); setPageInputValue(''); }}
                          style={{
                              flex: 1, padding: '10px', borderRadius: '8px', 
                              border: `1px solid ${theme.divider}`,
                              background: 'transparent', color: theme.textPrimary, cursor: 'pointer',
                              fontSize: '14px'
                          }}
                      >
                          Отмена
                      </button>
                      <button 
                          onClick={handleGoToPage}
                          style={{
                              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                              background: theme.accent, color: '#fff', cursor: 'pointer',
                              fontSize: '14px', fontWeight: '500'
                          }}
                      >
                          Перейти
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Table of Contents Modal */}
      {showTocModal && (
          <div 
              style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.8)', zIndex: 200,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '20px'
              }}
              onClick={() => setShowTocModal(false)}
          >
              <div 
                  style={{
                      background: theme.surface1, borderRadius: '12px',
                      maxWidth: '500px', width: '100%', maxHeight: '80vh',
                      display: 'flex', flexDirection: 'column', color: theme.textPrimary
                  }}
                  onClick={e => e.stopPropagation()}
              >
                  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.divider}` }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Оглавление</h3>
                  </div>
                  <div style={{ 
                      flex: 1, overflowY: 'auto', padding: '8px 0'
                  }}>
                      {chaptersInfo.map((chapter) => (
                          <button
                              key={chapter.id}
                              onClick={() => handleGoToChapter(chapter.index)}
                              style={{
                                  width: '100%', padding: '12px 24px', border: 'none',
                                  background: chapter.index === currentChapterIndex ? theme.surface2 : 'transparent',
                                  color: chapter.index === currentChapterIndex ? theme.accent : theme.textPrimary,
                                  textAlign: 'left', cursor: 'pointer', fontSize: '15px',
                                  transition: 'background 0.2s',
                                  display: 'flex', alignItems: 'center', gap: '12px',
                                  borderLeft: chapter.index === currentChapterIndex ? `3px solid ${theme.accent}` : '3px solid transparent'
                              }}
                              onMouseEnter={e => { 
                                  if (chapter.index !== currentChapterIndex) {
                                      e.currentTarget.style.background = theme.surface2;
                                      e.currentTarget.style.opacity = '0.8';
                                  }
                              }}
                              onMouseLeave={e => { 
                                  if (chapter.index !== currentChapterIndex) {
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.opacity = '1';
                                  }
                              }}
                          >
                              <span style={{ 
                                  color: theme.textTertiary, fontSize: '13px', minWidth: '32px',
                                  fontWeight: chapter.index === currentChapterIndex ? '600' : '400'
                              }}>
                                  {chapter.index + 1}
                              </span>
                              <span style={{ 
                                  flex: 1,
                                  fontWeight: chapter.index === currentChapterIndex ? '500' : '400'
                              }}>
                                  {chapter.title}
                              </span>
                          </button>
                      ))}
                  </div>
                  <div style={{ padding: '16px 24px', borderTop: `1px solid ${theme.divider}` }}>
                      <button 
                          onClick={() => setShowTocModal(false)}
                          style={{
                              width: '100%', padding: '10px', borderRadius: '8px',
                              border: `1px solid ${theme.divider}`,
                              background: 'transparent', color: theme.textPrimary,
                              cursor: 'pointer', fontSize: '14px'
                          }}
                      >
                          Закрыть
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Reader;
