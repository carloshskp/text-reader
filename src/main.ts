import { bootstrap } from './app/textReaderApp.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
  });
} else {
  bootstrap();
}

// Lazy load analytics.js após carregamento completo da página
function loadAnalytics(): void {
  const script = document.createElement('script');
  script.src = '/analytics.js';
  script.async = true;
  document.head.appendChild(script);
}

if (document.readyState === 'complete') {
  // Usar requestIdleCallback se disponível, senão usar setTimeout
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadAnalytics, { timeout: 2000 });
  } else {
    setTimeout(loadAnalytics, 100);
  }
} else {
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 2000 });
    } else {
      setTimeout(loadAnalytics, 100);
    }
  });
}
