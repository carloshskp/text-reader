import { TextReaderApp } from '../src/app/textReaderApp.js';
import { clampRate, formatRateLabel } from '../src/core/rate.js';
import { I18n } from '../src/utils/i18n.js';
import fs from 'node:fs';
import path from 'node:path';
import { TextDecoder, TextEncoder } from 'node:util';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { JSDOM, VirtualConsole } = require('jsdom');

const htmlPath = path.resolve(__dirname, '../public/index.html');
const rawHtml = fs.readFileSync(htmlPath, 'utf8');
const sanitizedHtml = rawHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

interface DomOptions {
  matches?: boolean;
  initialRate?: string;
}

async function createDom({ matches = false, initialRate }: DomOptions = {}) {
  const dom = new JSDOM(sanitizedHtml, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    resources: 'usable',
    virtualConsole: new VirtualConsole().sendTo(console, { omitJSDOMErrors: true }),
    beforeParse(window: Window & typeof globalThis) {
      const typedWindow = window as Window & typeof globalThis & { __matchMediaInstances?: any[] };
      typedWindow.localStorage.clear();
      typedWindow.__matchMediaInstances = [];
      typedWindow.matchMedia = function matchMediaMock(query: string) {
        let currentMatches = matches;
        const listeners = new Set<(event: MediaQueryListEvent) => void>();
        const instance: any = {
          media: query,
          get matches() {
            return currentMatches;
          },
          onchange: null,
          addEventListener(_event: string, cb: (event: MediaQueryListEvent) => void) {
            listeners.add(cb);
          },
          removeEventListener(_event: string, cb: (event: MediaQueryListEvent) => void) {
            listeners.delete(cb);
          },
          addListener(cb: (event: MediaQueryListEvent) => void) {
            listeners.add(cb);
          },
          removeListener(cb: (event: MediaQueryListEvent) => void) {
            listeners.delete(cb);
          },
          dispatchEvent: () => true,
          setMatches(value: boolean) {
            if (currentMatches !== value) {
              currentMatches = value;
              const event = { matches: value, media: query } as MediaQueryListEvent;
              listeners.forEach((listener) => listener(event));
              instance.onchange?.(event);
            }
          }
        };
        (typedWindow as any).__matchMediaInstances.push(instance);
        return instance as MediaQueryList;
      };

      const speechState = { speaking: false, paused: false };
      const speechSynthesisMock: SpeechSynthesis = {
        get speaking() {
          return speechState.speaking;
        },
        get paused() {
          return speechState.paused;
        },
        pending: false,
        onvoiceschanged: null,
        getVoices: () => [],
        cancel() {
          speechState.speaking = false;
          speechState.paused = false;
        },
        speak() {
          speechState.speaking = true;
          speechState.paused = false;
        },
        pause() {
          speechState.paused = true;
        },
        resume() {
          speechState.paused = false;
        },
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => true
      };

      Object.defineProperty(window, 'speechSynthesis', { value: speechSynthesisMock, writable: true });

      class SpeechSynthesisUtteranceMock {
        text: string;
        rate = 1;

        constructor(text: string) {
          this.text = text;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock;

      if (typeof initialRate !== 'undefined') {
        window.localStorage.setItem('demo_tts_rate', String(initialRate));
      }
    }
  });

  const i18n = new I18n('pt-BR');
  const app = new TextReaderApp({ window: dom.window as unknown as Window, document: dom.window.document, i18n });
  app.init();
  await new Promise((resolve) => dom.window.requestAnimationFrame(() => resolve(null)));

  return dom;
}

function getMatchMediaInstance(window: any) {
  const instances = window.__matchMediaInstances || [];
  if (!instances.length) {
    throw new Error('matchMedia mock was not instantiated');
  }
  return instances[0];
}

describe('rate control responsive behaviour', () => {
  it('clamps and formats rate values consistently', () => {
    expect(clampRate('10')).toBe(2);
    expect(clampRate('0.1')).toBe(0.5);
    expect(formatRateLabel(1.75)).toBe('1.75x');
  });

  it('shows slider on wide viewports and hides select', async () => {
    const dom = await createDom({ matches: false });
    const { document } = dom.window;
    const slider = document.getElementById('rate');
    const select = document.getElementById('rateSelect');

    expect(slider?.classList.contains('hidden')).toBe(false);
    expect(select?.classList.contains('hidden')).toBe(true);

    dom.window.close();
  });

  it('switches to select on narrow viewports and back to slider on expansion', async () => {
    const dom = await createDom({ matches: false });
    const { document } = dom.window;
    const slider = document.getElementById('rate');
    const select = document.getElementById('rateSelect');
    const media = getMatchMediaInstance(dom.window);

    media.setMatches(true);

    expect(slider?.classList.contains('hidden')).toBe(true);
    expect(select?.classList.contains('hidden')).toBe(false);

    media.setMatches(false);

    expect(slider?.classList.contains('hidden')).toBe(false);
    expect(select?.classList.contains('hidden')).toBe(true);

    dom.window.close();
  });

  it('keeps controls, rate indicator, and storage in sync when the select changes', async () => {
    const dom = await createDom({ matches: true });
    const { document, localStorage } = dom.window;
    const slider = document.getElementById('rate') as HTMLInputElement;
    const select = document.getElementById('rateSelect') as HTMLSelectElement;
    const rateValue = document.getElementById('rateValue');
    const media = getMatchMediaInstance(dom.window);

    media.setMatches(true);

    select.value = '1.75';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

    expect(slider.value).toBe('1.75');
    expect(rateValue?.textContent).toBe('1.75x');
    expect(localStorage.getItem('demo_tts_rate')).toBe('1.75');

    dom.window.close();
  });

  it('restores saved rate across slider and select when loading', async () => {
    const dom = await createDom({ matches: true, initialRate: '0.75' });
    const { document } = dom.window;
    const slider = document.getElementById('rate') as HTMLInputElement;
    const select = document.getElementById('rateSelect') as HTMLSelectElement;
    const rateValue = document.getElementById('rateValue');

    expect(slider.value).toBe('0.75');
    expect(select.value).toBe('0.75');
    expect(rateValue?.textContent).toBe('0.75x');

    dom.window.close();
  });
});
