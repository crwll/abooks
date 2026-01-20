import React, { useState } from 'react';
import { Settings } from 'lucide-react';

const DevPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isDev = import.meta.env.VITE_ENV === 'development';

  if (!isDev) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#dfff00',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 9999,
        }}
      >
        <Settings size={24} color="#000" />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '140px',
            right: '16px',
            background: '#1c1c1e',
            borderRadius: '16px',
            padding: '16px',
            minWidth: '250px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 9999,
          }}
        >
          <h3 style={{ color: '#dfff00', margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            DEV MODE
          </h3>
          <div style={{ color: '#8e8e93', fontSize: '12px', lineHeight: '1.5' }}>
            <p style={{ margin: '4px 0' }}>User ID: 123456789</p>
            <p style={{ margin: '4px 0' }}>Username: dev_user</p>
            <p style={{ margin: '4px 0' }}>Auth: Dev Bypass</p>
            <p style={{ margin: '12px 0 4px 0', color: '#fff', fontWeight: '600' }}>API:</p>
            <p style={{ margin: '4px 0' }}>{import.meta.env.VITE_API_URL || 'localhost:8000'}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default DevPanel;
