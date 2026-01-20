import React, { useState, useEffect } from 'react';
import { Search, User, Home, ArrowLeft, Bookmark, Heart, Clock, Settings, ChevronRight, BookOpen, Moon, Sun, X, ChevronLeft } from 'lucide-react';

const sampleBooks = [
  { id: 1, title: 'Мастер и Маргарита', author: 'Михаил Булгаков', progress: 45, pages: 480, genre: 'Классика', gradient: 'linear-gradient(135deg, #E8D5F2 0%, #B8A5D3 35%, #9B8FC2 70%, #7B6FA8 100%)' },
  { id: 2, title: '1984', author: 'Джордж Оруэлл', progress: 0, pages: 320, genre: 'Антиутопия', gradient: 'linear-gradient(145deg, #FFD4C4 0%, #F5A08A 40%, #E87A7A 80%, #D65F6F 100%)' },
  { id: 3, title: 'Преступление и наказание', author: 'Фёдор Достоевский', progress: 100, pages: 576, genre: 'Классика', gradient: 'linear-gradient(135deg, #A8E6F0 0%, #6BC5D8 40%, #4DA6C4 100%)' },
  { id: 4, title: 'Война и мир', author: 'Лев Толстой', progress: 23, pages: 1225, genre: 'Исторический', gradient: 'linear-gradient(140deg, #C8F7DC 0%, #7DDBA3 50%, #5BC489 100%)' },
  { id: 5, title: 'Анна Каренина', author: 'Лев Толстой', progress: 0, pages: 864, genre: 'Классика', gradient: 'linear-gradient(135deg, #FFE5B4 0%, #F5C07A 50%, #E5A050 100%)' },
  { id: 6, title: 'Идиот', author: 'Фёдор Достоевский', progress: 67, pages: 640, genre: 'Классика', gradient: 'linear-gradient(145deg, #D4E5FF 0%, #A5C4F5 40%, #7AA3E8 100%)' },
];

const sampleContent = [
  { chapter: 'Глава 1', title: 'Никогда не разговаривайте с неизвестными', content: `Однажды весною, в час небывало жаркого заката, в Москве, на Патриарших прудах, появились два гражданина. Первый из них, одетый в серенькую летнюю пару, был маленького роста, упитан, лыс, свою приличную шляпу пирожком нёс в руке, а на хорошо выбритом лице его помещались сверхъестественных размеров очки в чёрной роговой оправе.

Второй — плечистый, рыжеватый, вихрастый молодой человек в заломленной на затылок клетчатой кепке — был в ковбойке, жёваных белых брюках и в чёрных тапочках.

Первый был не кто иной, как Михаил Александрович Берлиоз, председатель правления одной из крупнейших московских литературных ассоциаций, сокращённо именуемой МАССОЛИТ, и редактор толстого художественного журнала, а молодой спутник его — поэт Иван Николаевич Понырев, пишущий под псевдонимом Бездомный.

Попав в тень чуть зеленеющих лип, писатели первым долгом бросились к пёстро раскрашенной будочке с надписью «Пиво и воды».` },
  { chapter: 'Глава 2', title: 'Понтий Пилат', content: `В белом плаще с кровавым подбоем, шаркающей кавалерийской походкой, ранним утром четырнадцатого числа весеннего месяца нисана в крытую колоннаду между двумя крыльями дворца Ирода Великого вышел прокуратор Иудеи Понтий Пилат.

Более всего на свете прокуратор ненавидел запах розового масла, и всё теперь предвещало нехороший день, так как запах этот начал преследовать прокуратора с рассвета. Прокуратору казалось, что розовый запах источают кипарисы и пальмы в саду, что к запаху кожи и конвоя примешивается проклятая розовая струя.

От флигелей в тылу дворца, где расположилась пришедшая с прокуратором в Ершалаим первая когорта Двенадцатого Молниеносного легиона, заносило дымком в колоннаду через верхнюю площадку сада, и к горьковатому дыму, свидетельствовавшему о том, что кашевары в кентуриях начали готовить обед, примешивался всё тот же жирный розовый дух.` },
  { chapter: 'Глава 3', title: 'Седьмое доказательство', content: `— Да, мы — атеисты, — улыбаясь, ответил Берлиоз, а Бездомный подумал, рассердившись: «Вот навязался, заграничный гусь!»

— О, какая прелесть! — вскричал удивительный иностранец и завертел головой, глядя то на одного, то на другого литератора. — В вашей стране атеизм никого не удивляет? Большинство нашего населения сознательно и давно перестало верить сказкам о боге.

Иностранец откинулся на спинку скамейки и спросил, даже привизгнув от любопытства:

— Вы — атеисты?!

— Да, мы — атеисты, — улыбаясь, ответил Берлиоз, а Бездомный подумал, рассердившись: «Вот прицепился, заграничный гусь!»

— Ох, какая прелесть! — вскричал удивительный иностранец и завертел головой, глядя то на одного, то на другого литератора.` },
];

export default function BookReaderApp() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('library');
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(17);
  const [favorites, setFavorites] = useState([1, 3]);
  const [showControls, setShowControls] = useState(true);

  const theme = {
    bg: darkMode ? '#000000' : '#FFFFFF',
    surface1: darkMode ? '#0D0D0D' : '#F9F9F9',
    surface2: darkMode ? '#1C1C1E' : '#F2F2F7',
    surface3: darkMode ? '#2C2C2E' : '#E5E5EA',
    textPrimary: darkMode ? '#FFFFFF' : '#000000',
    textSecondary: darkMode ? '#8E8E93' : '#6E6E73',
    textTertiary: darkMode ? '#636366' : '#AEAEB2',
    accent: '#DFFF00',
    accentHover: '#C8E600',
    divider: darkMode ? '#38383A' : '#D1D1D6',
    success: darkMode ? '#32D74B' : '#34C759',
    error: darkMode ? '#FF453A' : '#FF3B30',
  };

  const filteredBooks = sampleBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openBook = (book) => {
    setSelectedBook(book);
    setCurrentChapter(0);
    setShowControls(true);
    setCurrentScreen('reader');
  };

  const toggleFavorite = (bookId, e) => {
    e?.stopPropagation();
    setFavorites(prev => 
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const readingBooks = sampleBooks.filter(b => b.progress > 0 && b.progress < 100);
  const completedBooks = sampleBooks.filter(b => b.progress === 100);

  // Library Screen
  const LibraryScreen = () => (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 6vw, 28px)', fontWeight: '700', letterSpacing: '-0.01em', color: theme.textPrimary, margin: 0 }}>
          Библиотека
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              width: '44px', height: '44px', borderRadius: '9999px',
              background: theme.surface2, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={20} color={theme.textPrimary} />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: '44px', height: '44px', borderRadius: '9999px',
              background: theme.surface2, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {darkMode ? <Sun size={20} color={theme.textPrimary} /> : <Moon size={20} color={theme.textPrimary} />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Поиск книг..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px 14px 48px',
              background: theme.surface2, border: 'none',
              borderRadius: '12px', fontSize: '15px', color: theme.textPrimary,
              outline: 'none', boxSizing: 'border-box'
            }}
          />
          <Search size={20} color={theme.textTertiary} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px'
              }}
            >
              <X size={18} color={theme.textTertiary} />
            </button>
          )}
        </div>
      )}

      {/* Continue Reading Section */}
      {readingBooks.length > 0 && !searchQuery && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 16px 0' }}>
            Продолжить чтение
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {readingBooks.map(book => (
              <div
                key={book.id}
                onClick={() => openBook(book)}
                style={{
                  padding: '20px', borderRadius: '20px',
                  background: book.gradient, cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(0,0,0,0.6)', background: 'rgba(255,255,255,0.3)', padding: '4px 10px', borderRadius: '9999px' }}>
                    {book.genre}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(0,0,0,0.8)' }}>
                    {book.progress}%
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#000', margin: '0 0 4px 0' }}>{book.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', margin: 0 }}>{book.author}</p>
                <div style={{ marginTop: '16px', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px' }}>
                  <div style={{ width: `${book.progress}%`, height: '100%', background: 'rgba(0,0,0,0.5)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Books Grid */}
      <div>
        <h2 style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 16px 0' }}>
          {searchQuery ? `Результаты поиска (${filteredBooks.length})` : 'Все книги'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {filteredBooks.map(book => (
            <div
              key={book.id}
              onClick={() => openBook(book)}
              style={{
                background: theme.surface2, borderRadius: '16px', padding: '12px',
                cursor: 'pointer', transition: 'transform 0.2s ease'
              }}
            >
              <div style={{
                aspectRatio: '3/4', borderRadius: '12px', marginBottom: '12px',
                background: book.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <BookOpen size={32} color="rgba(0,0,0,0.3)" />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, margin: '0 0 4px 0', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {book.title}
              </h3>
              <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0 }}>{book.author}</p>
              {book.progress > 0 && (
                <div style={{ marginTop: '8px', height: '3px', background: theme.surface3, borderRadius: '2px' }}>
                  <div style={{ width: `${book.progress}%`, height: '100%', background: theme.accent, borderRadius: '2px' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Reader Screen
  const ReaderScreen = () => (
    <div 
      style={{ minHeight: '100vh', background: theme.bg }}
      onClick={() => setShowControls(!showControls)}
    >
      {/* Reader Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, background: theme.bg,
        padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, transform: showControls ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentScreen('library'); }}
          style={{
            width: '44px', height: '44px', borderRadius: '9999px',
            background: theme.surface2, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </button>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <p style={{ fontSize: '15px', fontWeight: '600', color: theme.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedBook?.title}</p>
          <p style={{ fontSize: '12px', color: theme.textTertiary, margin: '4px 0 0 0' }}>{sampleContent[currentChapter]?.chapter}</p>
        </div>
        <button
          onClick={(e) => toggleFavorite(selectedBook?.id, e)}
          style={{
            width: '44px', height: '44px', borderRadius: '9999px',
            background: theme.surface2, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Heart
            size={20}
            color={favorites.includes(selectedBook?.id) ? theme.error : theme.textPrimary}
            fill={favorites.includes(selectedBook?.id) ? theme.error : 'none'}
          />
        </button>
      </div>

      {/* Font Size & Theme Controls */}
      <div style={{
        position: 'fixed', top: '76px', left: 0, right: 0,
        padding: '12px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
        background: theme.bg, zIndex: 10,
        transform: showControls ? 'translateY(0)' : 'translateY(-200%)',
        transition: 'transform 0.3s ease'
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); setFontSize(Math.max(14, fontSize - 2)); }}
          style={{
            padding: '8px 16px', borderRadius: '9999px', background: theme.surface2,
            border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.textPrimary
          }}
        >
          A-
        </button>
        <span style={{ fontSize: '13px', color: theme.textSecondary, minWidth: '36px', textAlign: 'center' }}>
          {fontSize}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setFontSize(Math.min(24, fontSize + 2)); }}
          style={{
            padding: '8px 16px', borderRadius: '9999px', background: theme.surface2,
            border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.textPrimary
          }}
        >
          A+
        </button>
        <div style={{ width: '1px', height: '20px', background: theme.divider }} />
        <button
          onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }}
          style={{
            padding: '8px 12px', borderRadius: '9999px', background: theme.surface2,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {darkMode ? <Sun size={18} color={theme.textPrimary} /> : <Moon size={18} color={theme.textPrimary} />}
        </button>
      </div>

      {/* Chapter Content */}
      <div style={{ padding: '140px 16px 120px', maxWidth: '680px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: '600', color: theme.textPrimary,
          letterSpacing: '-0.01em', margin: '0 0 8px 0'
        }}>
          {sampleContent[currentChapter]?.title}
        </h2>
        <p style={{ fontSize: '13px', color: theme.textTertiary, margin: '0 0 32px 0' }}>
          {sampleContent[currentChapter]?.chapter}
        </p>
        <div style={{
          fontSize: `${fontSize}px`, lineHeight: '1.8', color: theme.textPrimary,
          whiteSpace: 'pre-wrap'
        }}>
          {sampleContent[currentChapter]?.content}
        </div>
      </div>

      {/* Chapter Navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: theme.surface1,
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 20px))', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transform: showControls ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease'
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentChapter(Math.max(0, currentChapter - 1)); }}
          disabled={currentChapter === 0}
          style={{
            padding: '12px 16px', borderRadius: '9999px',
            background: currentChapter === 0 ? theme.surface2 : theme.accent,
            border: 'none', cursor: currentChapter === 0 ? 'default' : 'pointer',
            fontSize: '14px', fontWeight: '600',
            color: currentChapter === 0 ? theme.textTertiary : '#000',
            display: 'flex', alignItems: 'center', gap: '6px',
            opacity: currentChapter === 0 ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronLeft size={18} /> <span style={{ display: 'none' }}></span>
        </button>
        <span style={{ fontSize: '13px', color: theme.textSecondary }}>
          {currentChapter + 1} / {sampleContent.length}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentChapter(Math.min(sampleContent.length - 1, currentChapter + 1)); }}
          disabled={currentChapter === sampleContent.length - 1}
          style={{
            padding: '12px 16px', borderRadius: '9999px',
            background: currentChapter === sampleContent.length - 1 ? theme.surface2 : theme.accent,
            border: 'none', cursor: currentChapter === sampleContent.length - 1 ? 'default' : 'pointer',
            fontSize: '14px', fontWeight: '600',
            color: currentChapter === sampleContent.length - 1 ? theme.textTertiary : '#000',
            display: 'flex', alignItems: 'center', gap: '6px',
            opacity: currentChapter === sampleContent.length - 1 ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ display: 'none' }}></span> <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  // Profile Screen
  const ProfileScreen = () => (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* Profile Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '9999px',
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
          margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <User size={36} color="#000" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: theme.textPrimary, margin: '0 0 4px 0' }}>
          Читатель
        </h1>
        <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0 }}>Премиум аккаунт</p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '32px'
      }}>
        {[
          { label: 'Прочитано', value: completedBooks.length, icon: BookOpen },
          { label: 'В процессе', value: readingBooks.length, icon: Clock },
          { label: 'Избранное', value: favorites.length, icon: Heart },
        ].map((stat, i) => (
          <div key={i} style={{
            background: theme.surface2, borderRadius: '16px', padding: '16px',
            textAlign: 'center'
          }}>
            <stat.icon size={22} color={theme.accent} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: 'clamp(24px, 6vw, 28px)', fontWeight: '700', color: theme.textPrimary, margin: '0 0 4px 0' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '11px', color: theme.textSecondary, margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Reading Stats */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 16px 0' }}>
          Статистика чтения
        </h2>
        <div style={{
          background: theme.surface2, borderRadius: '16px', padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: 'clamp(28px, 8vw, 36px)', fontWeight: '700', color: theme.textPrimary, margin: '0 0 4px 0' }}>
                2,847
              </p>
              <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0 }}>страниц</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 'clamp(28px, 8vw, 36px)', fontWeight: '700', color: theme.accent, margin: '0 0 4px 0' }}>
                12
              </p>
              <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0 }}>часов</p>
            </div>
          </div>
          <div style={{ height: '4px', background: theme.surface3, borderRadius: '2px', marginBottom: '8px' }}>
            <div style={{ width: '65%', height: '100%', background: theme.accent, borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '12px', color: theme.textTertiary, margin: 0 }}>Цель: 5000 страниц в месяц</p>
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 16px 0' }}>
            Избранные книги
          </h2>
          {sampleBooks.filter(b => favorites.includes(b.id)).map(book => (
            <div
              key={book.id}
              onClick={() => openBook(book)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px', background: theme.surface2, borderRadius: '16px',
                marginBottom: '8px', cursor: 'pointer'
              }}
            >
              <div style={{
                width: '48px', height: '64px', borderRadius: '8px',
                background: book.gradient, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <BookOpen size={20} color="rgba(0,0,0,0.3)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: theme.textPrimary, margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {book.title}
                </h3>
                <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0 }}>{book.author}</p>
              </div>
              <ChevronRight size={20} color={theme.textTertiary} />
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      <div>
        <h2 style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 16px 0' }}>
          Настройки
        </h2>
        <div style={{ background: theme.surface2, borderRadius: '16px', overflow: 'hidden' }}>
          {[
            { icon: Moon, label: 'Тёмная тема', action: () => setDarkMode(!darkMode), toggle: true, value: darkMode },
            { icon: Settings, label: 'Настройки чтения', action: null },
            { icon: Bookmark, label: 'Мои закладки', action: null },
          ].map((item, i) => (
            <div
              key={i}
              onClick={item.action}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                cursor: item.action ? 'pointer' : 'default',
                borderBottom: i < 2 ? `1px solid ${theme.divider}` : 'none'
              }}
            >
              <item.icon size={22} color={theme.textSecondary} />
              <span style={{ fontSize: '15px', color: theme.textPrimary, flex: 1 }}>{item.label}</span>
              {item.toggle ? (
                <div style={{
                  width: '51px', height: '31px', borderRadius: '15.5px',
                  background: item.value ? theme.accent : theme.surface3,
                  padding: '2px', transition: 'background 0.2s ease', cursor: 'pointer'
                }}>
                  <div style={{
                    width: '27px', height: '27px', borderRadius: '13.5px',
                    background: '#fff', transform: item.value ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
              ) : (
                <ChevronRight size={20} color={theme.textTertiary} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg,
      fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      {/* Main Content */}
      {currentScreen === 'library' && <LibraryScreen />}
      {currentScreen === 'reader' && <ReaderScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}

      {/* Bottom Navigation */}
      {currentScreen !== 'reader' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: theme.surface1,
          padding: '12px 0 calc(12px + env(safe-area-inset-bottom, 20px))', 
          display: 'flex', justifyContent: 'space-around'
        }}>
          {[
            { id: 'library', icon: Home, label: 'Библиотека' },
            { id: 'profile', icon: User, label: 'Профиль' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentScreen(tab.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '8px 24px'
              }}
            >
              <tab.icon
                size={24}
                color={currentScreen === tab.id ? theme.textPrimary : theme.textTertiary}
                strokeWidth={currentScreen === tab.id ? 2 : 1.5}
              />
              <span style={{
                fontSize: '10px', fontWeight: '500',
                color: currentScreen === tab.id ? theme.textPrimary : theme.textTertiary
              }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
