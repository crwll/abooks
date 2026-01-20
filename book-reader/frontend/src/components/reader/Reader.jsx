import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight, Sun, Moon, Zap } from 'lucide-react';
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
                   .map((p, pIdx) => `<p id="${chapterId}-p-${pIdx}" class="reader-paragraph" style="margin-bottom: 0.8em; text-align: justify; text-indent: 1.5em;">${p.trim()}</p>`)
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
      
      for (const ch of chaptersInfo) {
          const el = document.getElementById(ch.id);
          if (el) {
              if (el.offsetLeft <= currentScrollX + 50) { 
                  foundTitle = ch.title;
                  foundIndex = ch.index;
              }
          }
      }
      setCurrentChapterTitle(foundTitle);
      setCurrentChapterIndex(foundIndex);
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

  if (loading) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, color: theme.textSecondary }}>Загрузка...</div>;
  }

  return (
    <div 
      style={{ 
        height: '100vh', 
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
          padding: '16px', background: theme.bg,
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
          position: 'fixed', top: '80px', left: 0, right: 0,
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
              <button onClick={() => setSpritzMode(!spritzMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textPrimary }}>
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
          top: '70px', 
          bottom: '70px',
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
      <div style={{ position: 'absolute', top: 70, bottom: 70, left: 0, width: '30%', zIndex: 10 }} onClick={(e) => { e.stopPropagation(); changePage(currentPage - 1); }} />
      <div style={{ position: 'absolute', top: 70, bottom: 70, right: 0, width: '30%', zIndex: 10 }} onClick={(e) => { e.stopPropagation(); changePage(currentPage + 1); }} />

      {/* Footer */}
      <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '16px', background: theme.bg,
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
              onClose={() => setSpritzMode(false)}
              key={currentChapterIndex} 
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
    </div>
  );
};

export default Reader;
