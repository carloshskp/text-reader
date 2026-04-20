import { TextReaderApp } from '../src/app/textReaderApp.js';
import { SpeechEngine, SpeechStatus } from '../src/speech/speechEngine.js';
import { I18n } from '../src/utils/i18n.js';
import fs from 'node:fs';
import path from 'node:path';
import { TextDecoder, TextEncoder } from 'node:util';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { JSDOM } = require('jsdom');

const htmlPath = path.resolve(__dirname, '../public/index.html');
const rawHtml = fs.readFileSync(htmlPath, 'utf8');
const sanitizedHtml = rawHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

class FakeSpeechEngine implements SpeechEngine {
  available = true;
  status: SpeechStatus = 'stopped';
  rate = 1;
  language = 'pt-BR';
  startedTexts: string[] = [];

  constructor(private readonly hooks: { onStatus?: (status: SpeechStatus) => void } = {}) {}

  start(text: string): void {
    this.startedTexts.push(text);
    this.status = 'started';
    this.hooks.onStatus?.('started');
  }

  pause(): void {
    this.status = this.status === 'started' ? 'paused' : 'started';
    this.hooks.onStatus?.(this.status);
  }

  stop(): void {
    this.status = 'stopped';
    this.hooks.onStatus?.('stopped');
  }

  setRate(rate: number): void {
    this.rate = rate;
  }

  setLanguage(language: string): void {
    this.language = language;
  }

  getStatus(): SpeechStatus {
    return this.status;
  }

  destroy(): void {}
}

function setup(engine: FakeSpeechEngine) {
  const dom = new JSDOM(sanitizedHtml, { url: 'http://localhost', pretendToBeVisual: true });
  const i18n = new I18n('pt-BR');
  const app = new TextReaderApp({
    window: dom.window as unknown as Window,
    document: dom.window.document,
    i18n,
    speechEngine: engine
  });
  app.init();
  return { dom, app };
}

describe('text reader speech integration contract', () => {
  it('starts stopped and controls are enabled', () => {
    const engine = new FakeSpeechEngine();
    const { dom } = setup(engine);

    const playButton = dom.window.document.getElementById('btnPlay') as HTMLButtonElement;
    const stopButton = dom.window.document.getElementById('btnStop') as HTMLButtonElement;

    expect(playButton.disabled).toBe(false);
    expect(stopButton.disabled).toBe(true);
    expect(engine.getStatus()).toBe('stopped');

    dom.window.close();
  });

  it('calls start with current text on play', () => {
    const engine = new FakeSpeechEngine();
    const { dom } = setup(engine);

    const textArea = dom.window.document.getElementById('text') as HTMLTextAreaElement;
    const playButton = dom.window.document.getElementById('btnPlay') as HTMLButtonElement;

    textArea.value = 'Olá mundo';
    playButton.click();

    expect(engine.startedTexts).toEqual(['Olá mundo']);

    dom.window.close();
  });

  it('toggles pause and resume via stop button', () => {
    const engine = new FakeSpeechEngine();
    const { dom } = setup(engine);

    const textArea = dom.window.document.getElementById('text') as HTMLTextAreaElement;
    const playButton = dom.window.document.getElementById('btnPlay') as HTMLButtonElement;
    const stopButton = dom.window.document.getElementById('btnStop') as HTMLButtonElement;

    textArea.value = 'texto';
    playButton.click();
    stopButton.click();
    expect(engine.getStatus()).toBe('paused');

    stopButton.click();
    expect(engine.getStatus()).toBe('paused');

    dom.window.close();
  });

  it('updates rate and persists value', () => {
    const engine = new FakeSpeechEngine();
    const { dom } = setup(engine);

    const slider = dom.window.document.getElementById('rate') as HTMLInputElement;
    slider.value = '1.75';
    slider.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

    expect(engine.rate).toBe(1.75);
    expect(dom.window.localStorage.getItem('demo_tts_rate')).toBe('1.75');

    dom.window.close();
  });

  it('sets synthesis language from active locale', () => {
    const engine = new FakeSpeechEngine();
    setup(engine);

    expect(engine.language).toBe('pt-BR');
  });

  it('shows warning and avoids invalid start when speech is unavailable', () => {
    const engine = new FakeSpeechEngine();
    engine.available = false;
    const { dom } = setup(engine);

    const playButton = dom.window.document.getElementById('btnPlay') as HTMLButtonElement;
    const textArea = dom.window.document.getElementById('text') as HTMLTextAreaElement;
    const toastHost = dom.window.document.getElementById('toast') as HTMLElement;

    textArea.value = 'teste';
    playButton.click();

    expect(toastHost.textContent).toContain('Não foi possível sintetizar a fala.');

    dom.window.close();
  });
});
