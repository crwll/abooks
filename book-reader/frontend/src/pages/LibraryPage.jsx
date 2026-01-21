import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getTheme } from '../utils/theme';
import { Search, Moon, Sun } from 'lucide-react';
import UnifiedSearch from '../components/library/UnifiedSearch';
import BookCard from '../components/library/BookCard';
import { getBooksService } from '../services/books';

const LibraryPage = ({ darkMode, setDarkMode }) => {
  const theme = getTheme(darkMode);
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await getBooksService.getAll();
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем книги при монтировании и при возврате на страницу
  useEffect(() => {
    loadBooks();
  }, [location.pathname]);

  const handleBookAdded = () => {
    loadBooks(); // Перезагружаем список книг
  };

  return (
    <div style={{ 
      padding: '16px', 
      paddingTop: 'var(--tg-content-safe-area-inset-top, calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 70px))',
      paddingBottom: '100px',
      minHeight: 'var(--tg-viewport-stable-height, 100vh)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: 'clamp(24px, 6vw, 28px)',
            fontWeight: '700',
            letterSpacing: '-0.01em',
            color: theme.textPrimary,
            margin: 0,
          }}
        >
          Библиотека
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '9999px',
              background: showSearch ? theme.accent : theme.surface2,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <Search size={20} color={showSearch ? '#000' : theme.textPrimary} />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
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
              transition: 'all 0.2s ease',
            }}
          >
            {darkMode ? <Sun size={20} color={theme.textPrimary} /> : <Moon size={20} color={theme.textPrimary} />}
          </button>
        </div>
      </div>

      {showSearch ? (
        <UnifiedSearch
          theme={theme}
          darkMode={darkMode}
          onBookAdded={handleBookAdded}
        />
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: theme.textSecondary }}>
          <p>Загрузка...</p>
        </div>
      ) : books.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: theme.textSecondary,
          }}
        >
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>
            Библиотека пуста
          </p>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>
            Используйте поиск для добавления книг с Флибусты
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px',
          }}
        >
          {books.map((userBook) => (
            <BookCard key={userBook.id} userBook={userBook} theme={theme} onUpdate={loadBooks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
