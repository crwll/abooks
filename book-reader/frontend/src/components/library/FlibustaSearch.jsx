import React, { useState } from 'react';
import { Search, Download, X, Loader, Book } from 'lucide-react';
import api from '../../services/api';

const FlibustaSearch = ({ theme, onBookAdded, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/api/flibusta/search`, {
        params: { query: query.trim(), limit: 20 }
      });
      setResults(response.data);
      
      if (response.data.length === 0) {
        setError('Книги не найдены');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Ошибка поиска. Проверьте доступ к Флибусте');
    } finally {
      setLoading(false);
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
      
      // Показываем успешное сообщение
      alert(response.data.message || 'Книга добавлена в библиотеку!');
      
      // Закрываем модальное окно и обновляем библиотеку
      if (onBookAdded) {
        onBookAdded();
      }
      onClose();
      
    } catch (err) {
      console.error('Download error:', err);
      const errorMsg = err.response?.data?.detail || 'Ошибка скачивания книги';
      setError(errorMsg);
    } finally {
      setDownloading(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.bg,
          borderRadius: '20px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${theme.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: theme.textPrimary }}>
            Поиск на Флибусте
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <X size={24} color={theme.textSecondary} />
          </button>
        </div>

        {/* Поиск */}
        <div style={{ padding: '20px', borderBottom: `1px solid ${theme.divider}` }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Название или автор..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '16px',
                borderRadius: '12px',
                border: 'none',
                background: theme.surface2,
                color: theme.textPrimary,
                outline: 'none',
              }}
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: query.trim() ? theme.accent : theme.surface2,
                color: query.trim() ? '#000' : theme.textSecondary,
                cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {loading ? <Loader size={20} /> : <Search size={20} />}
              {loading ? 'Поиск...' : 'Найти'}
            </button>
          </div>
          
          {error && (
            <p style={{ color: theme.error, fontSize: '14px', marginTop: '12px', marginBottom: 0 }}>
              {error}
            </p>
          )}
        </div>

        {/* Результаты */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {results.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.textSecondary }}>
              <Book size={48} color={theme.textTertiary} style={{ marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>Введите запрос для поиска</p>
            </div>
          )}

          {results.map((book) => (
            <div
              key={book.id}
              style={{
                background: theme.surface2,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
              }}
            >
              <h3
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.textPrimary,
                }}
              >
                {book.title}
              </h3>
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  color: theme.textSecondary,
                }}
              >
                {book.author}
              </p>
              
              {book.summary && (
                <p
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    color: theme.textTertiary,
                    lineHeight: '1.4',
                  }}
                >
                  {book.summary}
                </p>
              )}

              <button
                onClick={() => handleDownload(book)}
                disabled={downloading === book.id || !book.has_fb2}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
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
    </div>
  );
};

export default FlibustaSearch;
