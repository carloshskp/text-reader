export type Locale = 'pt-BR' | 'en-US';

export type TranslationKey =
  | 'meta.title'
  | 'meta.description'
  | 'meta.keywords'
  | 'meta.language'
  | 'hero.mobile.tagline'
  | 'hero.mobile.title'
  | 'hero.mobile.subtitle'
  | 'hero.desktop.tagline'
  | 'hero.desktop.title'
  | 'hero.desktop.subtitle'
  | 'nav.documentation'
  | 'form.label.text'
  | 'form.placeholder'
  | 'help.instructions'
  | 'help.save'
  | 'footer.tip'
  | 'footer.link'
  | 'analytics.title'
  | 'analytics.description'
  | 'analytics.deny'
  | 'analytics.allow'
  | 'analytics.manage'
  | 'footer.legal'
  | 'footer.support'
  | 'footer.or'
  | 'footer.contribute'
  | 'footer.supportLink'
  | 'toast.empty'
  | 'toast.error'
  | 'toast.cleared'
  | 'toast.saved'
  | 'donation.title'
  | 'donation.description'
  | 'donation.maybeLater'
  | 'donation.qrAlt'
  | 'donation.qrLabel'
  | 'clear.title';

const BRAZIL_TIMEZONES = new Set([
  'America/Noronha',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Araguaina',
  'America/Maceio',
  'America/Bahia',
  'America/Sao_Paulo',
  'America/Campo_Grande',
  'America/Cuiaba',
  'America/Boa_Vista',
  'America/Manaus',
  'America/Porto_Velho',
  'America/Eirunepe',
  'America/Rio_Branco'
]);

const translations: Record<Locale, Record<TranslationKey, string>> = {
  'pt-BR': {
    'meta.title': 'Leitor de Texto Online - Text-to-Speech em Português | TTS Grátis',
    'meta.description': 'Leitor de texto online gratuito. Converta qualquer texto em voz usando síntese de fala do navegador. Suporta português brasileiro (pt-BR) com controle de velocidade.',
    'meta.keywords': 'leitor de texto, text to speech, TTS, síntese de fala, leitor de voz, conversor texto voz, português brasileiro, pt-BR, leitor online, grátis',
    'meta.language': 'pt-BR',
    'hero.mobile.tagline': 'Leitor de texto',
    'hero.mobile.title': 'Converta textos em voz',
    'hero.mobile.subtitle': 'Transforme qualquer conteúdo escrito em áudio em segundos.',
    'hero.desktop.tagline': 'Leitor de texto online',
    'hero.desktop.title': 'Ouça seus textos em português',
    'hero.desktop.subtitle': 'Interface moderna, responsiva e gratuita para transformar texto em voz.',
    'nav.documentation': 'Documentação',
    'form.label.text': 'Texto',
    'form.placeholder': 'Coloque seu texto aqui, ou aperte play para ouvir essa instrução.',
    'help.instructions': 'Use o botão Reproduzir para ouvir o texto.',
    'help.save': 'O botão Salvar guarda o conteúdo de texto no navegador.',
    'footer.tip': 'Dica: tentamos selecionar automaticamente uma voz pt-BR se existir no sistema.',
    'footer.link': 'Acesse a documentação para mais detalhes.',
    'analytics.title': 'Controle de métricas',
    'analytics.description': 'Ative o Google Tag Manager apenas se concordar em compartilhar dados anônimos de uso.',
    'analytics.deny': 'Agora não',
    'analytics.allow': 'Ativar métricas',
    'analytics.manage': 'Ativar métricas',
    'footer.legal': '2025 Carlos Bernardes. Todos os direitos reservados.',
    'footer.support': 'Gostou?',
    'footer.or': 'ou',
    'footer.contribute': 'contribua',
    'footer.supportLink': 'apoie o projeto',
    'toast.empty': 'Digite um texto para reproduzir.',
    'toast.error': 'Não foi possível sintetizar a fala.',
    'toast.cleared': 'Texto limpo.',
    'toast.saved': 'Texto salvo com sucesso.',
    'donation.title': 'Gostou do Leitor de Texto?',
    'donation.description': 'Se este projeto foi útil para você, considere fazer uma doação para apoiar o desenvolvimento contínuo.',
    'donation.maybeLater': 'Talvez Depois',
    'donation.qrAlt': 'QR Code para doações via PIX',
    'donation.qrLabel': 'QR Code',
    'clear.title': 'Limpar texto'
  },
  'en-US': {
    'meta.title': 'Online Text Reader - Portuguese Text-to-Speech | Free TTS',
    'meta.description': 'Free online text reader. Convert any text to speech using the browser voice synthesis. Supports Brazilian Portuguese (pt-BR) with speed control.',
    'meta.keywords': 'text reader, text to speech, TTS, speech synthesis, voice reader, text to audio converter, brazilian portuguese, pt-BR, online reader, free',
    'meta.language': 'en',
    'hero.mobile.tagline': 'Text reader',
    'hero.mobile.title': 'Convert text to speech',
    'hero.mobile.subtitle': 'Turn any written content into audio within seconds.',
    'hero.desktop.tagline': 'Online text reader',
    'hero.desktop.title': 'Listen to your texts in Portuguese',
    'hero.desktop.subtitle': 'Modern, responsive, and free interface to transform text into speech.',
    'nav.documentation': 'Documentation',
    'form.label.text': 'Text',
    'form.placeholder': 'Place your text here, or press play to hear this instruction.',
    'help.instructions': 'Use the Play button to listen to the text.',
    'help.save': 'The Save button stores the text content in the browser.',
    'footer.tip': 'Tip: we try to automatically select a pt-BR voice if one exists on the system.',
    'footer.link': 'Open the documentation for more details.',
    'analytics.title': 'Analytics control',
    'analytics.description': 'Enable Google Tag Manager only if you agree to share anonymous usage data.',
    'analytics.deny': 'Not now',
    'analytics.allow': 'Enable analytics',
    'analytics.manage': 'Manage analytics',
    'footer.legal': '2025 Carlos Bernardes. All rights reserved.',
    'footer.support': 'Enjoyed it?',
    'footer.or': 'or',
    'footer.contribute': 'contribute',
    'footer.supportLink': 'support the project',
    'toast.empty': 'Enter some text to play.',
    'toast.error': 'Speech synthesis failed.',
    'toast.cleared': 'Text cleared.',
    'toast.saved': 'Text saved successfully.',
    'donation.title': 'Enjoying the Text Reader?',
    'donation.description': 'If this project was useful to you, consider donating to support ongoing development.',
    'donation.maybeLater': 'Maybe Later',
    'donation.qrAlt': 'QR Code for PIX donations',
    'donation.qrLabel': 'QR Code',
    'clear.title': 'Clear text'
  }
};

function languageMatchesBrazil(language?: string): boolean {
  if (!language) return false;
  return /(^|[-_])br$/i.test(language) || /pt-BR/i.test(language);
}

function usesBrazilTimeZone(resolvedTimeZone?: string): boolean {
  if (!resolvedTimeZone) return false;
  return BRAZIL_TIMEZONES.has(resolvedTimeZone);
}

export interface LocaleContext {
  navigator: Navigator;
  Intl?: typeof Intl;
}

export function detectLocale(win: LocaleContext): Locale {
  const navigator = win.navigator;
  const candidateLanguages = [navigator.language, (navigator as any).userLanguage, ...(navigator.languages ?? [])];

  if (candidateLanguages.some((lang) => languageMatchesBrazil(lang))) {
    return 'pt-BR';
  }

  const intlApi = win.Intl ?? globalThis.Intl;
  const timeZone = intlApi?.DateTimeFormat?.().resolvedOptions().timeZone;
  if (usesBrazilTimeZone(timeZone)) {
    return 'pt-BR';
  }

  return 'en-US';
}

export class I18n {
  locale: Locale;

  constructor(locale: Locale) {
    this.locale = locale;
  }

  t(key: TranslationKey): string {
    return translations[this.locale]?.[key] ?? translations['pt-BR'][key];
  }
}

export function applyTranslations(document: Document, i18n: I18n): void {
  document.documentElement.lang = i18n.locale === 'en-US' ? 'en' : 'pt-BR';

  const elements = document.querySelectorAll<HTMLElement>('[data-i18n]');

  elements.forEach((element) => {
    const key = element.dataset.i18n as TranslationKey;
    const translation = i18n.t(key);
    const attrTarget = element.dataset.i18nAttr;

    if (attrTarget) {
      attrTarget.split(',').map((value) => value.trim()).filter(Boolean).forEach((attr) => {
        element.setAttribute(attr, translation);
      });
    } else {
      element.textContent = translation;
    }
  });
}
