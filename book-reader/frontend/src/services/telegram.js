export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    tg.ready();
    tg.expand();
    
    // Проверяем поддержку методов перед вызовом
    try {
      if (typeof tg.enableClosingConfirmation === 'function') {
        tg.enableClosingConfirmation();
      }
    } catch (e) {
      console.log('[TG] enableClosingConfirmation not supported');
    }
    
    try {
      if (typeof tg.disableVerticalSwipes === 'function') {
        tg.disableVerticalSwipes();
      }
    } catch (e) {
      console.log('[TG] disableVerticalSwipes not supported');
    }
    
    // Устанавливаем полноэкранный режим (если поддерживается)
    try {
      if (typeof tg.requestFullscreen === 'function') {
        tg.requestFullscreen();
      }
    } catch (e) {
      console.log('[TG] requestFullscreen not supported');
    }
    
    // Скрываем заголовок если возможно
    try {
      if (typeof tg.setHeaderColor === 'function') {
        tg.setHeaderColor('secondary_bg_color');
      }
    } catch (e) {
      console.log('[TG] setHeaderColor not supported');
    }
    
    // Устанавливаем CSS переменные для безопасных зон
    const updateViewport = () => {
      const safeAreaTop = tg.safeAreaInset?.top || 0;
      const safeAreaBottom = tg.safeAreaInset?.bottom || 0;
      const contentSafeAreaTop = tg.contentSafeAreaInset?.top || safeAreaTop;
      const contentSafeAreaBottom = tg.contentSafeAreaInset?.bottom || safeAreaBottom;
      
      // Определяем ориентацию
      const isLandscape = window.innerWidth > window.innerHeight;
      
      // Добавляем дополнительный отступ для заголовка Telegram Mini App
      // В портретном режиме: ~56px на iOS, ~48px на Android
      // В горизонтальном: меньше, так как нет челки и заголовок компактнее
      const headerHeight = isLandscape 
        ? (tg.platform === 'ios' ? 24 : 20)
        : (tg.platform === 'ios' ? 56 : 48);
      
      const totalTopInset = Math.max(contentSafeAreaTop, safeAreaTop) + headerHeight;
      
      document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
      document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
      document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${safeAreaTop}px`);
      document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${safeAreaBottom}px`);
      document.documentElement.style.setProperty('--tg-content-safe-area-inset-top', `${totalTopInset}px`);
      document.documentElement.style.setProperty('--tg-content-safe-area-inset-bottom', `${contentSafeAreaBottom}px`);
      document.documentElement.style.setProperty('--tg-is-landscape', isLandscape ? '1' : '0');
      
      console.log('Telegram viewport updated:', {
        platform: tg.platform,
        orientation: isLandscape ? 'landscape' : 'portrait',
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        safeAreaTop,
        safeAreaBottom,
        contentSafeAreaTop: totalTopInset,
        contentSafeAreaBottom,
        headerHeight,
      });
    };
    
    updateViewport();
    
    // Обновляем при изменении viewport
    if (typeof tg.onEvent === 'function') {
      tg.onEvent('viewportChanged', updateViewport);
    }
    
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
