import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User } from 'lucide-react';

const BottomNav = ({ theme }) => {
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
        bottom: 0,
        left: 0,
        right: 0,
        background: theme.surface1,
        padding: '12px 0',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 20px))',
        display: 'flex',
        justifyContent: 'space-around',
        borderTop: `1px solid ${theme.divider}`,
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
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 24px',
            }}
          >
            <Icon
              size={24}
              color={isActive ? theme.textPrimary : theme.textTertiary}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: '500',
                color: isActive ? theme.textPrimary : theme.textTertiary,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
