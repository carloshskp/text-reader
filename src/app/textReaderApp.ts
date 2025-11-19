import { clampRate, formatRateLabel } from '../core/rate.js';
import { readFromStorage, writeToStorage } from '../utils/storage.js';

const STORAGE_KEY = 'demo_tts_text';
const RATE_KEY = 'demo_tts_rate';

export interface AppDependencies {
  window: Window;
  document: Document;
}

export class TextReaderApp {
  private readonly synth: SpeechSynthesis;
  private readonly textArea: HTMLTextAreaElement;
  private readonly playButton: HTMLButtonElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly saveButton: HTMLButtonElement | null;
  private readonly clearButton: HTMLButtonElement | null;
  private readonly rateSlider: HTMLInputElement;
  private readonly rateSelect: HTMLSelectElement | null;
  private readonly rateValue: HTMLElement;
  private readonly donationModal: HTMLElement;
  private readonly narrowViewportQuery: MediaQueryList | null;

  private isPlaying = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor(private readonly deps: AppDependencies) {
    const { window, document } = deps;
    this.synth = window.speechSynthesis;

    this.textArea = document.getElementById('text') as HTMLTextAreaElement;
    this.playButton = document.getElementById('btnPlay') as HTMLButtonElement;
    this.pauseButton = document.getElementById('btnPause') as HTMLButtonElement;
    this.saveButton = document.getElementById('btnSave') as HTMLButtonElement | null;
    this.clearButton = document.getElementById('btnClear') as HTMLButtonElement | null;
    this.rateSlider = document.getElementById('rate') as HTMLInputElement;
    this.rateSelect = document.getElementById('rateSelect') as HTMLSelectElement | null;
    this.rateValue = document.getElementById('rateValue') as HTMLElement;
    this.donationModal = document.getElementById('donationModal') as HTMLElement;

    this.narrowViewportQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 639px)')
      : null;
  }

  init(): void {
    this.restoreState();
    this.cacheVoices();
    this.synth.onvoiceschanged = () => this.cacheVoices();
    this.attachEventListeners();
    this.handleResponsiveControls();
    this.attachDonationTriggers();
    this.updateActionButtons();
  }

  private restoreState(): void {
    const { window } = this.deps;
    const savedText = readFromStorage(STORAGE_KEY, window.localStorage);
    if (savedText) {
      this.textArea.value = savedText;
    }

    const storedRate = readFromStorage(RATE_KEY, window.localStorage);
    if (storedRate) {
      this.syncRateControls(storedRate, { persist: false });
    } else {
      this.syncRateControls(this.rateSlider.value, { persist: false, source: 'slider' });
    }
  }

  private cacheVoices(): void {
    const voices = this.synth.getVoices();
    if (voices && voices.length) {
      this.cachedVoices = voices;
    }
  }

  private pickVoice(): SpeechSynthesisVoice | null {
    if (!this.cachedVoices.length) return null;
    return this.cachedVoices.find((voice) => /pt-BR/i.test(voice.lang))
      || this.cachedVoices.find((voice) => /^pt/i.test(voice.lang))
      || null;
  }

  private createUtterance(text: string, rate: string | number): SpeechSynthesisUtterance {
    const speechCtor = (
      this.deps.window as typeof window & { SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance }
    ).SpeechSynthesisUtterance ?? SpeechSynthesisUtterance;

    const utterance = new speechCtor(text);
    const voice = this.pickVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'pt-BR';
    }

    utterance.rate = clampRate(rate);
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    return utterance;
  }

  private attachEventListeners(): void {
    this.playButton.addEventListener('click', () => this.handlePlay());
    this.pauseButton.addEventListener('click', () => this.handlePause());
    this.textArea.addEventListener('input', () => this.handleTextChange());

    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => this.handleClear());
    }

    if (this.saveButton) {
      this.saveButton.addEventListener('click', () => this.handleSave());
    }

    if (this.rateSelect) {
      this.rateSelect.addEventListener('change', (event) => {
        const value = (event.target as HTMLSelectElement).value;
        this.syncRateControls(value, { source: 'select' });
      });
    }

    this.rateSlider.addEventListener('input', (event) => {
      const value = (event.target as HTMLInputElement).value;
      this.syncRateControls(value, { source: 'slider' });
    });

    this.deps.document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.donationModal.classList.contains('opacity-0')) {
        this.closeDonationModal();
      }
    });
  }

  private handleResponsiveControls(): void {
    if (!this.rateSelect || !this.narrowViewportQuery) return;

    this.toggleRateControlVisibility(this.narrowViewportQuery);

    const listener = (event: MediaQueryListEvent) => this.toggleRateControlVisibility(event);

    if (typeof this.narrowViewportQuery.addEventListener === 'function') {
      this.narrowViewportQuery.addEventListener('change', listener);
    } else if (typeof this.narrowViewportQuery.addListener === 'function') {
      this.narrowViewportQuery.addListener(listener);
    }
  }

  private handlePlay(): void {
    const text = this.textArea.value.trim();
    if (!text) {
      this.toast('Digite um texto para reproduzir.');
      return;
    }

    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }

    this.speakText(text);
  }

  private handlePause(): void {
    if (this.synth.speaking) {
      this.synth.pause();
      this.updateButtonsState(false);
    } else if (this.synth.paused) {
      this.synth.resume();
      this.updateButtonsState(true);
    }
  }

  private handleClear(): void {
    this.textArea.value = '';
    writeToStorage(STORAGE_KEY, '', this.deps.window.localStorage);
    this.updateActionButtons();
    this.textArea.focus();
    this.toast('Texto limpo.');
  }

  private handleSave(): void {
    const text = this.textArea.value.trim();
    writeToStorage(STORAGE_KEY, text, this.deps.window.localStorage);
    this.toast('Texto salvo com sucesso.');
  }

  private handleTextChange(): void {
    const currentValue = this.textArea.value;
    writeToStorage(STORAGE_KEY, currentValue, this.deps.window.localStorage);
    this.updateActionButtons();
  }

  private speakText(text: string): void {
    this.currentUtterance = this.createUtterance(text, this.rateSlider.value);
    this.synth.speak(this.currentUtterance);

    this.deps.window.setTimeout(() => {
      if (this.synth.speaking) {
        this.updateButtonsState(true);
      }
    }, 100);

    this.currentUtterance.onend = () => {
      this.updateButtonsState(false);
      this.currentUtterance = null;
      this.deps.window.setTimeout(() => this.showDonationModal(), 500);
    };

    this.currentUtterance.onerror = () => {
      this.updateButtonsState(false);
      this.currentUtterance = null;
      this.toast('Não foi possível sintetizar a fala.');
    };
  }

  private updateButtonsState(playing: boolean): void {
    this.isPlaying = playing;
    this.playButton.disabled = playing;
    this.pauseButton.disabled = !playing;

    if (this.clearButton) {
      this.clearButton.disabled = playing || this.textArea.value.trim().length === 0;
    }

    if (this.saveButton) {
      this.saveButton.disabled = this.textArea.value.trim().length === 0;
    }
  }

  private updateActionButtons(): void {
    this.updateButtonsState(this.isPlaying);
  }

  private syncRateControls(value: string | number, options: { persist?: boolean; source?: 'slider' | 'select' } = {}): number {
    const { persist = true, source } = options;
    const normalized = clampRate(value);
    const normalizedString = normalized.toString();

    if (source !== 'slider' && this.rateSlider.value !== normalizedString) {
      this.rateSlider.value = normalizedString;
    }

    if (this.rateSelect && source !== 'select' && this.rateSelect.value !== normalizedString) {
      this.rateSelect.value = normalizedString;
    }

    this.rateValue.textContent = formatRateLabel(normalized);

    if (persist) {
      writeToStorage(RATE_KEY, normalizedString, this.deps.window.localStorage);
    }

    if (this.currentUtterance && (this.synth.speaking || this.synth.paused)) {
      if (this.synth.paused) {
        this.currentUtterance.rate = normalized;
      } else {
        const text = this.textArea.value.trim();
        if (text) {
          this.synth.cancel();
          this.currentUtterance = this.createUtterance(text, normalized);
          this.synth.speak(this.currentUtterance);
          this.updateButtonsState(true);
        }
      }
    }

    return normalized;
  }

  private toggleRateControlVisibility(query: Pick<MediaQueryList, 'matches'>): void {
    if (!this.rateSelect) return;
    const useSelect = query.matches;
    this.rateSlider.classList.toggle('hidden', useSelect);
    this.rateSelect.classList.toggle('hidden', !useSelect);
  }

  private attachDonationTriggers(): void {
    const triggers = this.deps.document.querySelectorAll('[data-donation-trigger="true"]');
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'A') {
          event.preventDefault();
        }
        this.showDonationModal();
      });
    });

    const closeButtons = this.deps.document.querySelectorAll('[data-close-donation="true"]');
    closeButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this.closeDonationModal();
      });
    });
  }

  private showDonationModal(): void {
    if (!this.donationModal.dataset.qrLoaded) {
      const placeholder = this.deps.document.getElementById('qrCodePlaceholder');
      if (placeholder) {
        const qrImg = this.deps.document.createElement('img');
        qrImg.src = 'assets/qr-code.svg';
        qrImg.alt = 'QR Code para doações via PIX';
        qrImg.loading = 'lazy';
        qrImg.decoding = 'async';
        qrImg.width = 192;
        qrImg.height = 192;
        qrImg.className = 'max-w-full max-h-full';
        placeholder.replaceChildren(qrImg);
        this.donationModal.dataset.qrLoaded = 'true';
      }
    }

    this.donationModal.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
    this.donationModal.classList.add('opacity-100', 'fixed');

    const overlay = this.donationModal.firstElementChild as HTMLElement | null;
    if (overlay) overlay.style.pointerEvents = 'auto';

    const modalContent = this.donationModal.querySelector('.relative') as HTMLElement | null;
    if (modalContent) {
      modalContent.style.pointerEvents = 'auto';
      modalContent.classList.remove('scale-95');
      modalContent.classList.add('scale-100');
    }
  }

  private closeDonationModal(): void {
    this.donationModal.classList.remove('opacity-100', 'fixed');
    this.donationModal.classList.add('pointer-events-none', 'opacity-0', 'hidden');

    const overlay = this.donationModal.firstElementChild as HTMLElement | null;
    if (overlay) overlay.style.pointerEvents = 'none';

    const modalContent = this.donationModal.querySelector('.relative') as HTMLElement | null;
    if (modalContent) {
      modalContent.style.pointerEvents = 'none';
      modalContent.classList.add('scale-95');
      modalContent.classList.remove('scale-100');
    }
  }

  private toast(message: string): void {
    const host = this.deps.document.getElementById('toast');
    if (!host) return;

    const element = this.deps.document.createElement('div');
    element.className = 'pointer-events-auto bg-white/95 backdrop-blur-md text-slate-900 border border-white/30 rounded-lg px-5 py-3 shadow-2xl font-medium animate-in fade-in slide-in-from-top-2 duration-300';
    element.textContent = message;
    host.appendChild(element);
    this.deps.window.setTimeout(() => {
      element.classList.add('opacity-0', 'transition-all', 'duration-300');
      this.deps.window.setTimeout(() => host.removeChild(element), 300);
    }, 2000);
  }
}

export function bootstrap(): TextReaderApp {
  const app = new TextReaderApp({ window, document });
  app.init();
  return app;
}
