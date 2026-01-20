import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Settings } from 'lucide-react';
import { getTheme } from '../../utils/theme';

const SpritzReader = ({ content, darkMode, onComplete }) => {
  const theme = getTheme(darkMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(250);
  const [words, setWords] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (content) {
      const wordArray = content.split(/\s+/).filter(w => w.length > 0);
      setWords(wordArray);
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
      style={{
        minHeight: '100vh',
        background: theme.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          fontSize: '48px',
          fontWeight: '600',
          color: theme.textPrimary,
          marginBottom: '40px',
          letterSpacing: '0.05em',
        }}
      >
        {currentWord.substring(0, orp)}
        <span style={{ color: theme.accent }}>{currentWord[orp]}</span>
        {currentWord.substring(orp + 1)}
      </div>

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

      <div
        style={{
          marginTop: '40px',
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
  );
};

export default SpritzReader;
