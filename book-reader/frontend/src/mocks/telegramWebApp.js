window.Telegram = {
  WebApp: {
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
    isExpanded: true,
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
  }
};

console.log('%c[Telegram WebApp Mock]%c Loaded for development', 'color: #dfff00; font-weight: bold', 'color: inherit');
