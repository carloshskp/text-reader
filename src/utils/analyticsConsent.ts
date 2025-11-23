const CONSENT_KEY = 'text_reader_analytics_consent';
const ANALYTICS_SCRIPT_ID = 'app-analytics-script';

export type AnalyticsConsentStatus = 'granted' | 'declined';

declare global {
  interface Window {
    appAnalytics?: {
      init?: () => void;
      isInitialized?: () => boolean;
      enableAutoStart?: () => void;
      cancelAutoStart?: () => void;
    };
    APP_ANALYTICS_AUTO_START?: boolean;
  }
}

function readStoredConsent(win: Window): AnalyticsConsentStatus | null {
  try {
    const value = win.localStorage.getItem(CONSENT_KEY);
    if (value === 'granted' || value === 'declined') {
      return value;
    }
    return null;
  } catch (error) {
    console.error('Não foi possível ler o consentimento salvo.', error);
    return null;
  }
}

function saveConsent(win: Window, status: AnalyticsConsentStatus): void {
  try {
    win.localStorage.setItem(CONSENT_KEY, status);
  } catch (error) {
    console.error('Não foi possível salvar o consentimento.', error);
  }
}

function ensurePreconnect(doc: Document): void {
  if (doc.querySelector('link[data-analytics-preconnect]')) {
    return;
  }

  const link = doc.createElement('link');
  link.rel = 'preconnect';
  link.href = 'https://www.googletagmanager.com';
  link.setAttribute('data-analytics-preconnect', 'true');
  doc.head.appendChild(link);
}

let analyticsLoaderPromise: Promise<void> | null = null;

function loadAnalyticsScript(doc: Document): Promise<void> {
  if (analyticsLoaderPromise) {
    return analyticsLoaderPromise;
  }

  const existingScript = doc.getElementById(ANALYTICS_SCRIPT_ID);
  if (existingScript) {
    analyticsLoaderPromise = Promise.resolve();
    return analyticsLoaderPromise;
  }

  analyticsLoaderPromise = new Promise((resolve, reject) => {
    const script = doc.createElement('script');
    script.id = ANALYTICS_SCRIPT_ID;
    script.src = '/analytics.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    doc.head.appendChild(script);
  }).catch((error) => {
    analyticsLoaderPromise = null;
    throw error;
  });

  return analyticsLoaderPromise;
}

async function startAnalytics(win: Window, doc: Document): Promise<void> {
  ensurePreconnect(doc);
  // Desabilitar auto start para exigir consentimento explícito
  (win as Window & { APP_ANALYTICS_AUTO_START?: boolean }).APP_ANALYTICS_AUTO_START = false;

  try {
    await loadAnalyticsScript(doc);
    if (win.appAnalytics && typeof win.appAnalytics.init === 'function') {
      win.appAnalytics.init();
    }
  } catch (error) {
    console.error('Falha ao carregar analytics.', error);
  }
}

function toggleBanner(banner: HTMLElement | null, shouldShow: boolean): void {
  if (!banner) return;

  if (shouldShow) {
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

function updateManageButtonLabel(button: HTMLButtonElement | null, status: AnalyticsConsentStatus | null): void {
  if (!button) return;
  button.textContent = status === 'granted'
    ? 'Gerenciar métricas'
    : 'Ativar métricas';
}

export function setupAnalyticsConsent(win: Window, doc: Document): void {
  const banner = doc.querySelector<HTMLElement>('[data-analytics-consent]');
  const allowButton = doc.querySelector<HTMLButtonElement>('[data-analytics-allow]');
  const denyButton = doc.querySelector<HTMLButtonElement>('[data-analytics-deny]');
  const manageButton = doc.querySelector<HTMLButtonElement>('[data-analytics-manage]');

  const stored = readStoredConsent(win);
  updateManageButtonLabel(manageButton, stored);

  if (stored === 'granted') {
    toggleBanner(banner, false);
    void startAnalytics(win, doc);
  } else if (stored === 'declined') {
    toggleBanner(banner, false);
  } else {
    toggleBanner(banner, true);
  }

  allowButton?.addEventListener('click', () => {
    saveConsent(win, 'granted');
    updateManageButtonLabel(manageButton, 'granted');
    toggleBanner(banner, false);
    void startAnalytics(win, doc);
  });

  denyButton?.addEventListener('click', () => {
    saveConsent(win, 'declined');
    updateManageButtonLabel(manageButton, 'declined');
    toggleBanner(banner, false);
  });

  manageButton?.addEventListener('click', () => {
    const isHidden = banner?.classList.contains('hidden');
    toggleBanner(banner, Boolean(isHidden));
  });
}
