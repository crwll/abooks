import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { getTheme } from '../../utils/theme';

const SpritzReader = ({ content, title, darkMode, onComplete, onClose }) => {
  const theme = getTheme(darkMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(250);
  const [fontSize, setFontSize] = useState(48);
  const [words, setWords] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (content) {
      const wordArray = content.split(/\s+/).filter(w => w.length > 0);
      setWords(wordArray);
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  }, [content]);

  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const delay = 60000 / wpm;
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            if (onComplete) onComplete();
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, wpm, words]);

  const currentWord = words[currentIndex] || '';
  const orp = Math.floor(currentWord.length / 3);

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
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        zIndex: 110,
        opacity: !isPlaying ? 1 : 0,
        pointerEvents: !isPlaying ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }}>
        <button 
          onClick={onClose} 
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

      {/* Word Display - Centered */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `${fontSize}px`,
          fontWeight: '600',
          color: theme.textPrimary,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          width: '100%',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'inline-block' }}>
           {currentWord.substring(0, orp)}
           <span style={{ color: theme.accent }}>{currentWord[orp]}</span>
           {currentWord.substring(orp + 1)}
        </div>
      </div>

      {/* Bottom Controls */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          paddingBottom: '40px',
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
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

        <div
          style={{
            width: '100%',
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
      </div>
    </div>
  );
};

export default SpritzReader;
