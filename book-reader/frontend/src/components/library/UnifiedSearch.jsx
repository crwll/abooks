import React, { useState, useEffect } from 'react';
import { Search, Download, Loader, BookOpen, Library } from 'lucide-react';
import api from '../../services/api';

const UnifiedSearch = ({ theme, onBookAdded, darkMode }) => {
  const [query, setQuery] = useState('');
  const [libraryResults, setLibraryResults] = useState([]);
  const [flibustaResults, setFlibustaResults] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [loadingFlibusta, setLoadingFlibusta] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.trim().length < 2) {
      setLibraryResults([]);
      setFlibustaResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500); // debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async () => {
    const searchQuery = query.trim();
    if (!searchQuery) return;

    setError('');

    // Поиск в библиотеке
    setLoadingLibrary(true);
    try {
      const response = await api.get('/api/books');
      const filtered = response.data.filter(
        (userBook) =>
          userBook.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          userBook.book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setLibraryResults(filtered);
    } catch (err) {
      console.error('Library search error:', err);
    } finally {
      setLoadingLibrary(false);
    }

    // Поиск на Флибусте
    setLoadingFlibusta(true);
    try {
      const response = await api.get('/api/flibusta/search', {
        params: { query: searchQuery, limit: 20 }
      });
      setFlibustaResults(response.data);
    } catch (err) {
      console.error('Flibusta search error:', err);
      setError('Ошибка поиска на Флибусте');
    } finally {
      setLoadingFlibusta(false);
    }
  };

  const handleDownload = async (book) => {
    setDownloading(book.id);
    setError('');

    try {
      const response = await api.post('/api/flibusta/download', {
        book_id: book.id,
        title: book.title,
        author: book.author
      });

      alert(response.data.message || 'Книга добавлена в библиотеку!');
      
      if (onBookAdded) {
        onBookAdded();
      }
      
      // Обновляем поиск
      handleSearch();
    } catch (err) {
      console.error('Download error:', err);
      const errorMsg = err.response?.data?.detail || 'Ошибка скачивания книги';
      setError(errorMsg);
    } finally {
      setDownloading(null);
    }
  };

  const handleLibraryBookClick = (userBook) => {
    window.location.href = `/#/reader/${userBook.book.id}`;
  };

  const isLoading = loadingLibrary || loadingFlibusta;
  const hasResults = libraryResults.length > 0 || flibustaResults.length > 0;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Поисковая строка */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search 
          size={20} 
          color={theme.textSecondary}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          placeholder="Поиск в библиотеке и на Флибусте..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px 14px 48px',
            fontSize: '16px',
            borderRadius: '16px',
            border: 'none',
            background: theme.surface2,
            color: theme.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
          }}
          autoFocus
        />
        {isLoading && (
          <Loader
            size={20}
            color={theme.textSecondary}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              animation: 'spin 1s linear infinite'
            }}
          />
        )}
      </div>

      {error && (
        <p style={{ color: theme.error, fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </p>
      )}

      {/* Результаты */}
      {query.trim().length >= 2 && (
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Результаты из библиотеки */}
          {libraryResults.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '12px',
                color: theme.textSecondary,
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <Library size={16} />
                <span>МОЯ БИБЛИОТЕКА ({libraryResults.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {libraryResults.map((userBook) => (
                  <div
                    key={userBook.id}
                    onClick={() => handleLibraryBookClick(userBook)}
                    style={{
                      background: theme.surface2,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: `2px solid transparent`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.surface3;
                      e.currentTarget.style.borderColor = theme.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme.surface2;
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                    }}>
                      {userBook.book.title}
                    </h3>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      color: theme.textSecondary,
                    }}>
                      {userBook.book.author}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: theme.textTertiary,
                    }}>
                      <BookOpen size={14} />
                      <span>Прогресс: {userBook.progress_percent.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Результаты с Флибусты */}
          {flibustaResults.length > 0 && (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '12px',
                color: theme.textSecondary,
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <Search size={16} />
                <span>ФЛИБУСТА ({flibustaResults.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {flibustaResults.map((book) => (
                  <div
                    key={book.id}
                    style={{
                      background: theme.surface2,
                      borderRadius: '12px',
                      padding: '16px',
                    }}
                  >
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                    }}>
                      {book.title}
                    </h3>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      color: theme.textSecondary,
                    }}>
                      {book.author}
                    </p>
                    
                    {book.summary && (
                      <p style={{
                        margin: '0 0 12px 0',
                        fontSize: '13px',
                        color: theme.textTertiary,
                        lineHeight: '1.4',
                      }}>
                        {book.summary}
                      </p>
                    )}

                    <button
                      onClick={() => handleDownload(book)}
                      disabled={downloading === book.id || !book.has_fb2}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: book.has_fb2 ? theme.accent : theme.surface3,
                        color: book.has_fb2 ? '#000' : theme.textTertiary,
                        cursor: book.has_fb2 && downloading !== book.id ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        justifyContent: 'center',
                      }}
                    >
                      {downloading === book.id ? (
                        <>
                          <Loader size={16} />
                          Скачивание...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          {book.has_fb2 ? 'Добавить в библиотеку' : 'FB2 недоступен'}
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Нет результатов */}
          {!isLoading && !hasResults && query.trim().length >= 2 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: theme.textSecondary,
            }}>
              <Search size={48} color={theme.textTertiary} style={{ marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>Ничего не найдено</p>
            </div>
          )}
        </div>
      )}

      {/* Подсказка */}
      {query.trim().length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: theme.textSecondary,
        }}>
          <Search size={48} color={theme.textTertiary} style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '14px' }}>
            Начните вводить для поиска в библиотеке и на Флибусте
          </p>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: translateY(-50%) rotate(0deg); }
            to { transform: translateY(-50%) rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default UnifiedSearch;
