import React, { useState, useEffect } from 'react';
import { getTheme } from '../utils/theme';
import { User, BookOpen, Clock, Heart } from 'lucide-react';
import api from '../services/api';

const ProfilePage = ({ darkMode, setDarkMode }) => {
  const theme = getTheme(darkMode);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/api/users/me/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '9999px',
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User size={36} color="#000" />
        </div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: theme.textPrimary,
            margin: '0 0 4px 0',
          }}
        >
          Читатель
        </h1>
        <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0 }}>
          {import.meta.env.VITE_ENV === 'development' ? 'Dev User' : 'Пользователь'}
        </p>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '32px' }}>
          {[
            { label: 'Прочитано', value: stats.books_read, icon: BookOpen },
            { label: 'В процессе', value: stats.books_in_progress, icon: Clock },
            { label: 'Страниц', value: stats.total_pages, icon: Heart },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: theme.surface2,
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <stat.icon size={22} color={theme.accent} style={{ marginBottom: '8px' }} />
              <p
                style={{
                  fontSize: 'clamp(24px, 6vw, 28px)',
                  fontWeight: '700',
                  color: theme.textPrimary,
                  margin: '0 0 4px 0',
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: theme.textSecondary, margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {stats && stats.average_speed > 0 && (
        <div style={{ background: theme.surface2, borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, margin: '0 0 12px 0' }}>
            Средняя скорость Spritz
          </h3>
          <p style={{ fontSize: '32px', fontWeight: '700', color: theme.accent, margin: 0 }}>
            {Math.round(stats.average_speed)} <span style={{ fontSize: '16px' }}>сл/мин</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
