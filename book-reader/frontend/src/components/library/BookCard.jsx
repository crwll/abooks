import React from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ userBook, theme }) => {
  const navigate = useNavigate();
  
  const { book, progress_percent } = userBook;
  const gradient = 'linear-gradient(135deg, #E8D5F2 0%, #B8A5D3 35%, #9B8FC2 70%, #7B6FA8 100%)';
  
  return (
    <div
      onClick={() => navigate(`/reader/${book.id}`)}
      style={{
        background: theme.surface2,
        borderRadius: '16px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div
        style={{
          aspectRatio: '3/4',
          borderRadius: '12px',
          marginBottom: '12px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BookOpen size={32} color="rgba(0,0,0,0.3)" />
      </div>
      <h3
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: theme.textPrimary,
          margin: '0 0 4px 0',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {book.title}
      </h3>
      <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0 }}>
        {book.author}
      </p>
      {progress_percent > 0 && (
        <div
          style={{
            marginTop: '8px',
            height: '3px',
            background: theme.surface3,
            borderRadius: '2px',
          }}
        >
          <div
            style={{
              width: `${progress_percent}%`,
              height: '100%',
              background: theme.accent,
              borderRadius: '2px',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BookCard;
