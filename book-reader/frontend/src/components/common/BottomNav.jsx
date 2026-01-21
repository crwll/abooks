import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User } from 'lucide-react';

const BottomNav = ({ theme, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  if (location.pathname.startsWith('/reader')) {
    return null;
  }

  const tabs = [
    { id: 'library', path: '/', icon: Home, label: 'Библиотека' },
    { id: 'profile', path: '/profile', icon: User, label: 'Профиль' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
        bottom: 'max(16px, var(--tg-safe-area-inset-bottom, 16px))',
        left: '16px',
        right: '16px',
        background: theme.surface1,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        border: `1px solid ${theme.divider}`,
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              background: isActive ? theme.surface2 : 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '16px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              flex: isActive ? '1' : '0',
              justifyContent: 'center',
              minWidth: isActive ? 'auto' : '56px',
            }}
          >
            <Icon
              size={22}
              color={isActive ? theme.accent : theme.textTertiary}
              strokeWidth={isActive ? 2.5 : 2}
            />
            {isActive && (
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.textPrimary,
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
