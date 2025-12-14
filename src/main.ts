import { bootstrap } from './app/textReaderApp.js';
import './styles/main.css';
import { setupAnalyticsConsent } from './utils/analyticsConsent.js';
import { I18n, applyTranslations, detectLocale } from './utils/i18n.js';

const initialize = () => {
  const locale = detectLocale({ navigator: window.navigator, Intl });
  const i18n = new I18n(locale);

  applyTranslations(document, i18n);
  bootstrap(i18n);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Inicializa o fluxo de consentimento de analytics (opt-in)
setupAnalyticsConsent(window, document);
