import { TextDecoder, TextEncoder } from 'node:util';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

import { JSDOM } from 'jsdom';
import { I18n, applyTranslations, detectLocale } from '../src/utils/i18n.js';

describe('i18n utilities', () => {
  it('detects pt-BR locales based on navigator hints', () => {
    const locale = detectLocale({
      navigator: { language: 'pt-BR', languages: ['en-US', 'pt-BR'] } as unknown as Navigator,
      Intl
    });

    expect(locale).toBe('pt-BR');
  });

  it('falls back to en-US when region is not Brazil', () => {
    const locale = detectLocale({ navigator: { language: 'en-US', languages: ['en-US'] } as unknown as Navigator, Intl });
    expect(locale).toBe('en-US');
  });

  it('applies translations to text content and attributes', () => {
    const dom = new JSDOM(`<!doctype html><html lang="pt-BR"><head>
      <title data-i18n="meta.title">Leitor de Texto Online - Text-to-Speech em Português | TTS Grátis</title>
      <meta name="description" data-i18n="meta.description" data-i18n-attr="content" content="Leitor de texto online gratuito." />
    </head><body>
      <p data-i18n="hero.mobile.tagline">Leitor de texto</p>
      <button data-i18n="clear.title" data-i18n-attr="title" title="Limpar texto"></button>
    </body></html>`);

    const i18n = new I18n('en-US');
    applyTranslations(dom.window.document, i18n);

    expect(dom.window.document.documentElement.lang).toBe('en');
    expect(dom.window.document.title).toBe(i18n.t('meta.title'));
    expect(dom.window.document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(i18n.t('meta.description'));
    expect(dom.window.document.querySelector('p')?.textContent).toBe(i18n.t('hero.mobile.tagline'));
    expect(dom.window.document.querySelector('button')?.getAttribute('title')).toBe(i18n.t('clear.title'));
  });
});
