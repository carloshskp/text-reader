import { bootstrap } from './app/textReaderApp.js';
import './styles/main.css';
import { setupAnalyticsConsent } from './utils/analyticsConsent.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
  });
} else {
  bootstrap();
}

// Inicializa o fluxo de consentimento de analytics (opt-in)
setupAnalyticsConsent(window, document);
