import { clampRate } from '../core/rate.js';
import { SpeechEngine, SpeechEngineEvents, SpeechStatus } from './speechEngine.js';

interface NativeSpeechEngineOptions extends SpeechEngineEvents {
  window: Window;
  language: string;
  rate: number;
}

export class NativeSpeechEngine implements SpeechEngine {
  private readonly synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private status: SpeechStatus = 'stopped';
  private language: string;
  private rate: number;

  readonly available: boolean;

  constructor(private readonly options: NativeSpeechEngineOptions) {
    this.synth = options.window.speechSynthesis;
    this.language = options.language;
    this.rate = clampRate(options.rate);
    this.available = typeof this.synth?.speak === 'function';

    this.cacheVoices();
    this.synth.onvoiceschanged = () => this.cacheVoices();
  }

  start(text: string): void {
    if (!this.available || !text.trim()) return;

    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }

    this.currentUtterance = this.createUtterance(text);
    this.currentUtterance.onend = () => {
      this.status = 'stopped';
      this.currentUtterance = null;
      this.options.onStatusChange?.(this.status);
    };

    this.currentUtterance.onerror = () => {
      this.status = 'stopped';
      this.currentUtterance = null;
      this.options.onStatusChange?.(this.status);
      this.options.onError?.();
    };

    this.synth.speak(this.currentUtterance);
    this.status = 'started';
    this.options.onStatusChange?.(this.status);
  }

  pause(): void {
    if (!this.available) return;

    if (this.synth.speaking) {
      this.synth.pause();
      this.status = 'paused';
    } else if (this.synth.paused) {
      this.synth.resume();
      this.status = 'started';
    }

    this.options.onStatusChange?.(this.status);
  }

  stop(): void {
    if (!this.available) return;
    this.synth.cancel();
    this.status = 'stopped';
    this.currentUtterance = null;
    this.options.onStatusChange?.(this.status);
  }

  setRate(rate: number): void {
    this.rate = clampRate(rate);
    if (this.currentUtterance) {
      this.currentUtterance.rate = this.rate;
    }
  }

  setLanguage(language: string): void {
    this.language = language;
  }

  getStatus(): SpeechStatus {
    return this.status;
  }

  destroy(): void {
    if (this.available) {
      this.stop();
      this.synth.onvoiceschanged = null;
    }
  }

  private cacheVoices(): void {
    const voices = this.synth.getVoices();
    if (voices.length) {
      this.cachedVoices = voices;
    }
  }

  private pickVoice(): SpeechSynthesisVoice | null {
    if (!this.cachedVoices.length) return null;

    return this.cachedVoices.find((voice) => voice.lang.toLowerCase() === this.language.toLowerCase())
      || this.cachedVoices.find((voice) => voice.lang.toLowerCase().startsWith(this.language.slice(0, 2).toLowerCase()))
      || null;
  }

  private createUtterance(text: string): SpeechSynthesisUtterance {
    const speechCtor = (
      this.options.window as typeof window & { SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance }
    ).SpeechSynthesisUtterance ?? SpeechSynthesisUtterance;

    const utterance = new speechCtor(text);
    const voice = this.pickVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = this.language;
    }

    utterance.rate = this.rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    return utterance;
  }
}
