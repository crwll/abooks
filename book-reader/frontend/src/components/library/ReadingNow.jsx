import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTheme } from '../../utils/theme';

const ReadingNow = ({ books, darkMode }) => {
  const theme = getTheme(darkMode);
  const navigate = useNavigate();
  
  if (!books || books.length === 0) return null;
  
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2
        style={{
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.textTertiary,
          margin: '0 0 16px 0',
        }}
      >
        Продолжить чтение
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {books.map((book) => {
          const gradient = book.gradient || 'linear-gradient(135deg, #E8D5F2 0%, #B8A5D3 35%, #9B8FC2 70%, #7B6FA8 100%)';
          
          return (
            <div
              key={book.id}
              onClick={() => navigate(`/reader/${book.id}`)}
              style={{
                padding: '20px',
                borderRadius: '20px',
                background: gradient,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'rgba(0,0,0,0.6)',
                    background: 'rgba(255,255,255,0.3)',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                  }}
                >
                  {book.genre || 'Книга'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(0,0,0,0.8)' }}>
                  {book.progress}%
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#000', margin: '0 0 4px 0' }}>
                {book.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', margin: 0 }}>{book.author}</p>
              <div
                style={{
                  marginTop: '16px',
                  height: '4px',
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '2px',
                }}
              >
                <div
                  style={{
                    width: `${book.progress}%`,
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReadingNow;
