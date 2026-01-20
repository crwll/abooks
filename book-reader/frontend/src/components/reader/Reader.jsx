import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { getTheme } from '../../utils/theme';
import { getBooksService } from '../../services/books';
import api from '../../services/api';

const Reader = ({ darkMode, setDarkMode }) => {
  const theme = getTheme(darkMode);
  const navigate = useNavigate();
  const { bookId } = useParams();
  
  const [showControls, setShowControls] = useState(true);
  const [book, setBook] = useState(null);
  const [content, setContent] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(17);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, [bookId]);

  useEffect(() => {
    if (book) {
      loadContent(currentChapter);
    }
  }, [currentChapter, book]);

  const loadBook = async () => {
    try {
      const userBookData = await getBooksService.getById(bookId);
      setBook(userBookData);
      // Загружаем с сохраненной позиции
      const savedChapter = Math.floor((userBookData.current_position || 0) / 1000);
      setCurrentChapter(savedChapter);
    } catch (error) {
      console.error('Error loading book:', error);
    }
  };

  const loadContent = async (chapter) => {
    try {
      setLoading(true);
      const contentData = await getBooksService.getContent(bookId, chapter);
      setContent(contentData);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePosition = async (chapter) => {
    if (!book) return;
    
    const position = chapter * 1000;
    const progress = ((chapter + 1) / (content?.total_chapters || 1)) * 100;
    
    try {
      // book.id - это user_book_id, а не book_id
      await api.put(`/api/user-books/${book.id}/position`, {
        current_position: position,
        progress_percent: Math.min(progress, 100)
      });
      console.log('Position updated:', { chapter, position, progress: Math.min(progress, 100) });
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const handleChapterChange = (newChapter) => {
    if (newChapter >= 0 && newChapter < (content?.total_chapters || 0)) {
      setCurrentChapter(newChapter);
      updatePosition(newChapter);
    }
  };

  const changeFontSize = (delta) => {
    setFontSize(prev => Math.max(14, Math.min(24, prev + delta)));
  };

  if (loading && !content) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: theme.textSecondary }}>Загрузка...</p>
      </div>
    );
  }

  const currentChapterData = content?.chapters?.[currentChapter];

  return (
    <div 
      style={{ minHeight: '100vh', background: theme.bg }}
      onClick={() => setShowControls(!showControls)}
    >
      {/* Header */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: theme.bg,
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          transform: showControls ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/'); }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '9999px',
            background: theme.surface2,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </button>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <p style={{ fontSize: '15px', fontWeight: '600', color: theme.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {book?.book?.title || 'Книга'}
          </p>
          <p style={{ fontSize: '12px', color: theme.textTertiary, margin: '4px 0 0 0' }}>
            {currentChapterData?.title || `Глава ${currentChapter + 1}`}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setFavorite(!favorite); }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '9999px',
            background: theme.surface2,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart
            size={20}
            color={favorite ? theme.error : theme.textPrimary}
            fill={favorite ? theme.error : 'none'}
          />
        </button>
      </div>

      {/* Font Controls */}
      <div
        style={{
          position: 'fixed',
          top: '76px',
          left: 0,
          right: 0,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          background: theme.bg,
          zIndex: 10,
          transform: showControls ? 'translateY(0)' : 'translateY(-200%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); changeFontSize(-2); }}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            background: theme.surface2,
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: theme.textPrimary,
          }}
        >
          A-
        </button>
        <span style={{ fontSize: '13px', color: theme.textSecondary, minWidth: '36px', textAlign: 'center' }}>
          {fontSize}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); changeFontSize(2); }}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            background: theme.surface2,
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: theme.textPrimary,
          }}
        >
          A+
        </button>
        <div style={{ width: '1px', height: '20px', background: theme.divider }} />
        <button
          onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }}
          style={{
            padding: '8px 12px',
            borderRadius: '9999px',
            background: theme.surface2,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {darkMode ? <Sun size={18} color={theme.textPrimary} /> : <Moon size={18} color={theme.textPrimary} />}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '140px 16px 120px', maxWidth: '680px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(20px, 5vw, 24px)',
            fontWeight: '600',
            color: theme.textPrimary,
            letterSpacing: '-0.01em',
            margin: '0 0 8px 0',
          }}
        >
          {currentChapterData?.title || `Глава ${currentChapter + 1}`}
        </h2>
        <div
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.8',
            color: theme.textPrimary,
            whiteSpace: 'pre-wrap',
          }}
        >
          {currentChapterData?.content || 'Загрузка...'}
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: theme.surface1,
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 20px))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); handleChapterChange(currentChapter - 1); }}
          disabled={currentChapter === 0}
          style={{
            padding: '12px 16px',
            borderRadius: '9999px',
            background: currentChapter === 0 ? theme.surface2 : theme.accent,
            border: 'none',
            cursor: currentChapter === 0 ? 'default' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: currentChapter === 0 ? theme.textTertiary : '#000',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: currentChapter === 0 ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontSize: '13px', color: theme.textSecondary }}>
          {currentChapter + 1} / {content?.total_chapters || 1}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleChapterChange(currentChapter + 1); }}
          disabled={currentChapter >= (content?.total_chapters || 1) - 1}
          style={{
            padding: '12px 16px',
            borderRadius: '9999px',
            background: currentChapter >= (content?.total_chapters || 1) - 1 ? theme.surface2 : theme.accent,
            border: 'none',
            cursor: currentChapter >= (content?.total_chapters || 1) - 1 ? 'default' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: currentChapter >= (content?.total_chapters || 1) - 1 ? theme.textTertiary : '#000',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: currentChapter >= (content?.total_chapters || 1) - 1 ? 0.5 : 1,
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Reader;
