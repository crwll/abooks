import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { getTheme } from '../../utils/theme';

const SpritzReader = ({ content, title, darkMode, onComplete, onClose, initialIndex = 0 }) => {
  const theme = getTheme(darkMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [wpm, setWpm] = useState(250);
  const [fontSize, setFontSize] = useState(48);
  const [pauseOnPunctuation, setPauseOnPunctuation] = useState(true);
  const [pauseOnNumbers, setPauseOnNumbers] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [words, setWords] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (content) {
      const wordArray = content.split(/\s+/).filter(w => w.length > 0);
      setWords(wordArray);
      setCurrentIndex(initialIndex);
      setIsPlaying(false);
      setTimeSpent(0);
    }
  }, [content]);

  const handleClose = () => {
      onClose(currentIndex, words.length);
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let timeoutId;
    if (isPlaying && words.length > 0) {
      const currentWord = words[currentIndex];
      let delay = 60000 / wpm;

      // Calculate delay multiplier based on word content
      if (currentWord) {
        if (pauseOnPunctuation) {
          if (/[.!?]+("|»)?$/.test(currentWord)) {
            delay *= 2.5; // End of sentence
          } else if (/[,:;]+("|»)?$/.test(currentWord)) {
            delay *= 1.5; // Clause break
          }
        }
        
        if (pauseOnNumbers && /\d/.test(currentWord)) {
          delay = Math.max(delay, (60000 / wpm) * 2); // Numbers
        }
      }

      timeoutId = setTimeout(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            if (onComplete) onComplete();
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isPlaying, wpm, words, currentIndex, pauseOnPunctuation, pauseOnNumbers]);

  const currentWord = words[currentIndex] || '';
  // Используем формулу из примера: round((length + 1) * 0.4) - 1
  const orp = Math.max(0, Math.round((currentWord.length + 1) * 0.4) - 1);

  return (
    <div
      onClick={() => setIsPlaying(!isPlaying)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        background: theme.bg,
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '16px',
        paddingTop: 'max(16px, calc(var(--tg-content-safe-area-inset-top, var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px))) + 8px))',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        zIndex: 110,
        opacity: !isPlaying ? 1 : 0,
        pointerEvents: !isPlaying ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }}>
        <button 
          onClick={handleClose} 
          style={{ 
            background: theme.surface2, 
            border: 'none', 
            borderRadius: '50%', 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            color: theme.textPrimary 
          }}
        >
          <X size={20} />
        </button>
        <div style={{ color: theme.textSecondary, fontSize: '14px', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Word Display - Spritz Style */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', 
          maxWidth: '90vw',
          padding: '20px 0',
          borderTop: `2px solid ${theme.surface3}`,
          borderBottom: `2px solid ${theme.surface3}`,
          pointerEvents: 'none'
        }}
      >
        {/* Top Marker */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: '40%',
            height: '10px',
            width: '2px',
            backgroundColor: theme.surface3,
            transform: 'translateX(-50%)'
        }} />

        {/* Bottom Marker */}
        <div style={{
            position: 'absolute',
            bottom: 0,
            left: '40%',
            height: '10px',
            width: '2px',
            backgroundColor: theme.surface3,
            transform: 'translateX(-50%)'
        }} />

        {/* Word Container */}
        <div style={{
            display: 'flex',
            alignItems: 'baseline', 
            justifyContent: 'center',
            fontSize: `${fontSize}px`,
            fontWeight: '600',
            color: theme.textPrimary,
            lineHeight: 1.2,
            fontFamily: '"Open Sans", sans-serif', 
        }}>
             {/* Prefix - 40% width, align right */}
             <div style={{
                 flex: '0 0 40%',
                 textAlign: 'right',
             }}>
                 {currentWord.substring(0, orp)}
             </div>
             
             {/* ORP Character - colored */}
             <div style={{
                 color: 'red', // Fixed red color as per example or stick to theme.accent? User example had 'color: red'.
                 // Let's use red for high contrast as requested in example style logic, but theme.accent is safer for dark mode.
                 // Example used: nth-child(2) { color: red }
                 // I'll stick to theme.accent to respect theme, but ensure it's visible.
                 color: theme.accent, 
             }}>
                 {currentWord[orp]}
             </div>

             {/* Suffix - remaining space */}
             <div style={{
                 flex: '1',
                 textAlign: 'left',
             }}>
                 {currentWord.substring(orp + 1)}
             </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 'calc(60px + var(--tg-content-safe-area-inset-bottom, var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))))',
          left: 0,
          right: 0,
          padding: '20px',
          background: `linear-gradient(to top, ${theme.bg} 90%, transparent)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: !isPlaying ? 1 : 0,
          pointerEvents: !isPlaying ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          zIndex: 110
      }}>
        <div style={{ marginBottom: '20px', color: theme.textSecondary, fontSize: '14px' }}>
          {currentIndex + 1} / {words.length} слов
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: theme.accent,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPlaying ? <Pause size={24} color="#000" /> : <Play size={24} color="#000" />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <button
            onClick={() => setWpm(Math.max(100, wpm - 50))}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              background: theme.surface2,
              border: 'none',
              cursor: 'pointer',
              color: theme.textPrimary,
            }}
          >
            -50
          </button>
          <span style={{ color: theme.textPrimary, minWidth: '100px', textAlign: 'center' }}>
            {wpm} сл/мин
          </span>
          <button
            onClick={() => setWpm(Math.min(1000, wpm + 50))}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              background: theme.surface2,
              border: 'none',
              cursor: 'pointer',
              color: theme.textPrimary,
            }}
          >
            +50
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <button
            onClick={() => setFontSize(Math.max(20, fontSize - 4))}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              background: theme.surface2,
              border: 'none',
              cursor: 'pointer',
              color: theme.textPrimary,
              fontSize: '14px'
            }}
          >
            A-
          </button>
          <span style={{ color: theme.textPrimary, minWidth: '80px', textAlign: 'center' }}>
             {fontSize}px
          </span>
           <button
            onClick={() => setFontSize(Math.min(120, fontSize + 4))}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              background: theme.surface2,
              border: 'none',
              cursor: 'pointer',
              color: theme.textPrimary,
              fontSize: '18px'
            }}
          >
            A+
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '20px' }}>
          <label style={{ 
            color: theme.textSecondary, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer', 
            fontSize: '13px',
            userSelect: 'none'
          }}>
            <input 
              type="checkbox" 
              checked={pauseOnPunctuation} 
              onChange={(e) => setPauseOnPunctuation(e.target.checked)}
              style={{ 
                accentColor: theme.accent,
                cursor: 'pointer',
                width: '16px',
                height: '16px'
              }}
            />
            Пауза на знаках
          </label>
          <label style={{ 
            color: theme.textSecondary, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer', 
            fontSize: '13px',
            userSelect: 'none'
          }}>
            <input 
              type="checkbox" 
              checked={pauseOnNumbers} 
              onChange={(e) => setPauseOnNumbers(e.target.checked)}
              style={{ 
                accentColor: theme.accent,
                cursor: 'pointer',
                width: '16px',
                height: '16px'
              }}
            />
            Пауза на цифрах
          </label>
        </div>
      </div>

      {/* Always Visible Footer (Progress & Timer) */}
      <div 
        style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            paddingBottom: 'var(--tg-content-safe-area-inset-bottom, var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 110,
            pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: 'calc(100% - 40px)',
            maxWidth: '400px',
            height: '4px',
            background: theme.surface3,
            borderRadius: '2px',
          }}
        >
          <div
            style={{
              width: `${((currentIndex + 1) / words.length) * 100}%`,
              height: '100%',
              background: theme.accent,
              borderRadius: '2px',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <div style={{ fontSize: '12px', color: theme.textSecondary, fontFamily: 'monospace' }}>
            {formatTime(timeSpent)}
        </div>
      </div>
    </div>
  );
};

export default SpritzReader;
