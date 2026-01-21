import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initTelegram, getTelegramTheme } from './services/telegram';
import { getTheme } from './utils/theme';
import BottomNav from './components/common/BottomNav';
import DevPanel from './components/dev/DevPanel';
import LibraryPage from './pages/LibraryPage';
import ReaderPage from './pages/ReaderPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;  // По умолчанию темная
  });
  const theme = getTheme(darkMode);

  useEffect(() => {
    const tg = initTelegram();
    if (tg) {
      const tgTheme = getTelegramTheme();
      setDarkMode(tgTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div 
      style={{
        minHeight: '100vh',
        minHeight: 'var(--tg-viewport-height, 100vh)',
        background: theme.bg,
        color: theme.textPrimary,
        fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        transition: 'background 0.3s ease, color 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<LibraryPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/reader/:bookId" element={<ReaderPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/profile" element={<ProfilePage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        </Routes>
        <BottomNav theme={theme} darkMode={darkMode} />
        <DevPanel />
      </Router>
    </div>
  );
}

export default App;
