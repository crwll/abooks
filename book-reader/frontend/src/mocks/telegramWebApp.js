const mockWebApp = {
  initData: 'dev_mode',
  initDataUnsafe: {
    user: {
      id: 123456789,
      first_name: 'Dev',
      last_name: 'User',
      username: 'dev_user'
    }
  },
  ready: () => console.log('[Mock] TG WebApp ready'),
  expand: () => console.log('[Mock] TG WebApp expand'),
  close: () => console.log('[Mock] TG WebApp close'),
  enableClosingConfirmation: () => console.log('[Mock] TG enableClosingConfirmation'),
  disableClosingConfirmation: () => console.log('[Mock] TG disableClosingConfirmation'),
  disableVerticalSwipes: () => console.log('[Mock] TG disableVerticalSwipes'),
  requestFullscreen: () => console.log('[Mock] TG requestFullscreen'),
  setHeaderColor: (color) => console.log('[Mock] TG setHeaderColor:', color),
  MainButton: {
    show: () => console.log('[Mock] MainButton show'),
    hide: () => console.log('[Mock] MainButton hide'),
    setText: (text) => console.log('[Mock] MainButton setText:', text),
    onClick: (cb) => console.log('[Mock] MainButton onClick registered'),
    offClick: (cb) => console.log('[Mock] MainButton offClick registered'),
    showProgress: () => console.log('[Mock] MainButton showProgress'),
    hideProgress: () => console.log('[Mock] MainButton hideProgress'),
  },
  BackButton: {
    show: () => console.log('[Mock] BackButton show'),
    hide: () => console.log('[Mock] BackButton hide'),
    onClick: (cb) => console.log('[Mock] BackButton onClick registered'),
    offClick: (cb) => console.log('[Mock] BackButton offClick registered'),
  },
  themeParams: {
    bg_color: '#000000',
    text_color: '#ffffff',
    hint_color: '#8e8e93',
    link_color: '#dfff00',
    button_color: '#dfff00',
    button_text_color: '#000000',
    secondary_bg_color: '#1c1c1e',
  },
  colorScheme: 'dark',
  platform: 'ios', // ios, android, web
  isExpanded: true,
  viewportHeight: window.innerHeight,
  viewportStableHeight: window.innerHeight,
  safeAreaInset: {
    top: 47, // Имитация "челки" iPhone
    bottom: 34, // Имитация home indicator
    left: 0,
    right: 0
  },
  contentSafeAreaInset: {
    top: 47, // Будет пересчитано в initTelegram с учетом заголовка
    bottom: 34,
    left: 0,
    right: 0
  },
  headerColor: 'secondary_bg_color',
  isFullscreen: true,
  _eventHandlers: {},
  onEvent: function(eventName, handler) {
    if (!this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = [];
    }
    this._eventHandlers[eventName].push(handler);
    console.log(`[Mock] TG onEvent registered: ${eventName}`);
  },
  offEvent: function(eventName, handler) {
    if (this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = this._eventHandlers[eventName].filter(h => h !== handler);
      console.log(`[Mock] TG offEvent: ${eventName}`);
    }
  }
};

window.Telegram = {
  WebApp: mockWebApp
};

// Обновляем viewport при изменении размера окна
window.addEventListener('resize', () => {
  mockWebApp.viewportHeight = window.innerHeight;
  mockWebApp.viewportStableHeight = window.innerHeight;
  if (mockWebApp._eventHandlers['viewportChanged']) {
    mockWebApp._eventHandlers['viewportChanged'].forEach(handler => handler());
  }
});

console.log('%c[Telegram WebApp Mock]%c Loaded for development', 'color: #dfff00; font-weight: bold', 'color: inherit');
