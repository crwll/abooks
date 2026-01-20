export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    tg.ready();
    tg.expand();
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
