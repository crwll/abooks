export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    tg.disableVerticalSwipes();
    
    // Устанавливаем CSS переменные для безопасных зон
    document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
    document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
    document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${tg.safeAreaInset?.top || 0}px`);
    document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${tg.safeAreaInset?.bottom || 0}px`);
    
    return tg;
  }
  
  console.warn('Telegram WebApp not available');
  return null;
};

export const getTelegramUser = () => {
  const tg = window.Telegram?.WebApp;
  return tg?.initDataUnsafe?.user || null;
};

export const getTelegramTheme = () => {
  const tg = window.Telegram?.WebApp;
  return tg?.colorScheme || 'dark';
};

export const closeTelegram = () => {
  const tg = window.Telegram?.WebApp;
  tg?.close();
};
