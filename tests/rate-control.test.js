import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const htmlPath = path.resolve(__dirname, '../index.html');
const rawHtml = fs.readFileSync(htmlPath, 'utf8');

const appScriptMatch = rawHtml.match(/<script>\s*(const STORAGE_KEY[\s\S]*?)<\/script>/);
if (!appScriptMatch) {
  throw new Error('Unable to locate application script in index.html');
}

const appScript = appScriptMatch[1];

const sanitizedHtml = rawHtml
  .replace(/<script[^>]+tailwindcss[^>]*><\/script>/i, '')
  .replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/i, '')
  .replace(/<script[^>]+analytics\.js[^>]*><\/script>/i, '')
  .replace(appScriptMatch[0], '');

async function createDom({ matches = false, initialRate } = {}) {
  const dom = new JSDOM(sanitizedHtml, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'https://text-reader.test',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.localStorage.clear();
      window.__matchMediaInstances = [];
      window.matchMedia = function matchMediaMock(query) {
        const instance = {
          media: query,
          matches,
          listeners: new Set(),
          addEventListener(_event, cb) {
            this.listeners.add(cb);
          },
          removeEventListener(_event, cb) {
            this.listeners.delete(cb);
          },
          addListener(cb) {
            this.listeners.add(cb);
          },
          removeListener(cb) {
            this.listeners.delete(cb);
          },
          setMatches(value) {
            if (this.matches !== value) {
              this.matches = value;
              const event = { matches: value, media: query };
              this.listeners.forEach((listener) => listener(event));
            }
          }
        };
        window.__matchMediaInstances.push(instance);
        return instance;
      };

      window.speechSynthesis = {
        speaking: false,
        paused: false,
        pending: false,
        getVoices: () => [],
        cancel() {
          this.speaking = false;
          this.paused = false;
        },
        speak() {
          this.speaking = true;
          this.paused = false;
        },
        pause() {
          this.paused = true;
        },
        resume() {
          this.paused = false;
        }
      };

      window.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) {
        this.text = text;
        this.rate = 1;
      };

      if (typeof initialRate !== 'undefined') {
        try {
          window.localStorage.setItem('demo_tts_rate', String(initialRate));
        } catch (_) { }
      }
    }
  });

  dom.window.eval(appScript);
  await new Promise((resolve) => {
    dom.window.requestAnimationFrame(() => resolve());
  });

  return dom;
}

function getMatchMediaInstance(window) {
  const instances = window.__matchMediaInstances || [];
  if (!instances.length) {
    throw new Error('matchMedia mock was not instantiated');
  }
  return instances[0];
}

describe('rate control responsive behaviour', () => {
  it('shows slider on wide viewports and hides select', async () => {
    const dom = await createDom({ matches: false });
    const { document } = dom.window;
    const slider = document.getElementById('rate');
    const select = document.getElementById('rateSelect');

    expect(slider.classList.contains('hidden')).toBe(false);
    expect(select.classList.contains('hidden')).toBe(true);

    dom.window.close();
  });

  it('switches to select on narrow viewports and back to slider on expansion', async () => {
    const dom = await createDom({ matches: false });
    const { document } = dom.window;
    const slider = document.getElementById('rate');
    const select = document.getElementById('rateSelect');
    const media = getMatchMediaInstance(dom.window);

    media.setMatches(true);

    expect(slider.classList.contains('hidden')).toBe(true);
    expect(select.classList.contains('hidden')).toBe(false);

    media.setMatches(false);

    expect(slider.classList.contains('hidden')).toBe(false);
    expect(select.classList.contains('hidden')).toBe(true);

    dom.window.close();
  });

  it('keeps controls, rate indicator, and storage in sync when the select changes', async () => {
    const dom = await createDom({ matches: true });
    const { document, localStorage } = dom.window;
    const slider = document.getElementById('rate');
    const select = document.getElementById('rateSelect');
    const rateValue = document.getElementById('rateValue');
    const media = getMatchMediaInstance(dom.window);

    media.setMatches(true);

    select.value = '1.75';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

    expect(slider.value).toBe('1.75');
    expect(rateValue.textContent).toBe('1.75x');
    expect(localStorage.getItem('demo_tts_rate')).toBe('1.75');

    dom.window.close();
  });

  it('restores saved rate across slider and select when loading', async () => {
    const dom = await createDom({ matches: true, initialRate: '0.75' });
    const { document } = dom.window;
    const slider = document.getElementById('rate');
    const select = document.getElementById('rateSelect');
    const rateValue = document.getElementById('rateValue');

    expect(slider.value).toBe('0.75');
    expect(select.value).toBe('0.75');
    expect(rateValue.textContent).toBe('0.75x');

    dom.window.close();
  });
});
