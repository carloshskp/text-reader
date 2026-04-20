import { NativeSpeechEngine } from '../src/speech/nativeSpeechEngine.js';
import { createSpeechEngine } from '../src/speech/createSpeechEngine.js';
import { UnsupportedSpeechEngine } from '../src/speech/unsupportedSpeechEngine.js';

function createSpeechWindow() {
  const state = { speaking: false, paused: false, utterance: null as any };
  const synth: SpeechSynthesis = {
    get speaking() {
      return state.speaking;
    },
    get paused() {
      return state.paused;
    },
    pending: false,
    onvoiceschanged: null,
    getVoices: () => [{ lang: 'pt-BR' } as SpeechSynthesisVoice],
    cancel() {
      state.speaking = false;
      state.paused = false;
    },
    speak(utterance: SpeechSynthesisUtterance) {
      state.utterance = utterance;
      state.speaking = true;
      state.paused = false;
    },
    pause() {
      state.paused = true;
      state.speaking = false;
    },
    resume() {
      state.paused = false;
      state.speaking = true;
    },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true
  };

  class SpeechSynthesisUtteranceMock {
    text: string;
    voice: SpeechSynthesisVoice | null = null;
    lang = '';
    rate = 1;
    pitch = 1;
    volume = 1;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }

  return {
    window: {
      speechSynthesis: synth,
      SpeechSynthesisUtterance: SpeechSynthesisUtteranceMock
    } as unknown as Window,
    synth,
    state
  };
}

describe('NativeSpeechEngine', () => {
  it('starts with normalized rate and preferred language', () => {
    const { window, state } = createSpeechWindow();
    const statuses: string[] = [];
    const engine = new NativeSpeechEngine({
      window,
      language: 'pt-BR',
      rate: 5,
      onStatusChange: (status) => statuses.push(status)
    });

    engine.start('texto');

    expect(statuses.at(-1)).toBe('started');
    expect(state.utterance.rate).toBe(2);
    expect(state.utterance.lang).toBe('pt-BR');
  });

  it('toggles pause and resume based on synthesis state', () => {
    const { window } = createSpeechWindow();
    const engine = new NativeSpeechEngine({ window, language: 'pt-BR', rate: 1 });

    engine.start('texto');
    engine.pause();
    expect(engine.getStatus()).toBe('paused');

    engine.pause();
    expect(engine.getStatus()).toBe('started');
  });

  it('stops and resets status', () => {
    const { window } = createSpeechWindow();
    const engine = new NativeSpeechEngine({ window, language: 'pt-BR', rate: 1 });

    engine.start('texto');
    engine.stop();

    expect(engine.getStatus()).toBe('stopped');
  });

  it('calls error callback on utterance error', () => {
    const { window, state } = createSpeechWindow();
    const onError = jest.fn();
    const engine = new NativeSpeechEngine({ window, language: 'pt-BR', rate: 1, onError });

    engine.start('texto');
    state.utterance.onerror?.();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(engine.getStatus()).toBe('stopped');
  });

  it('updates language and rate while active', () => {
    const { window, state } = createSpeechWindow();
    const engine = new NativeSpeechEngine({ window, language: 'pt-BR', rate: 1 });

    engine.start('texto');
    engine.setRate(1.75);
    engine.setLanguage('en-US');
    engine.stop();
    engine.start('new text');

    expect(state.utterance.rate).toBe(1.75);
    expect(state.utterance.lang).toBe('en-US');
  });

  it('ignores empty text and destroys safely', () => {
    const { window } = createSpeechWindow();
    const engine = new NativeSpeechEngine({ window, language: 'pt-BR', rate: 1 });

    engine.start('   ');
    expect(engine.getStatus()).toBe('stopped');

    engine.destroy();
    expect(engine.getStatus()).toBe('stopped');
  });
});

describe('createSpeechEngine + UnsupportedSpeechEngine', () => {
  it('returns unsupported engine when API is unavailable', () => {
    const engine = createSpeechEngine({
      window: {} as Window,
      document: {} as Document,
      language: 'pt-BR',
      rate: 1
    });

    expect(engine).toBeInstanceOf(UnsupportedSpeechEngine);
    expect(engine.available).toBe(false);
    engine.start('texto');
    engine.pause();
    engine.stop();
    engine.setRate(2);
    engine.setLanguage('en-US');
    engine.destroy();
    expect(engine.getStatus()).toBe('stopped');
  });

  it('returns native engine when API is available', () => {
    const { window } = createSpeechWindow();
    const engine = createSpeechEngine({
      window,
      document: {} as Document,
      language: 'pt-BR',
      rate: 1
    });

    expect(engine).toBeInstanceOf(NativeSpeechEngine);
  });
});
