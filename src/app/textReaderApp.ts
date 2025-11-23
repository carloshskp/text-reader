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
  private readonly stopButton: HTMLButtonElement;
  private readonly saveButton: HTMLButtonElement | null;
  private readonly clearButton: HTMLButtonElement | null;
  private readonly rateSlider: HTMLInputElement;
  private readonly rateSelect: HTMLSelectElement | null;
  private readonly rateValue: HTMLElement;
  private donationModal: HTMLElement | null = null;
  private readonly narrowViewportQuery: MediaQueryList | null;
  private pageLoaded = false;

  private isPlaying = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor(private readonly deps: AppDependencies) {
    const { window, document } = deps;
    this.synth = window.speechSynthesis;

    this.textArea = document.getElementById('text') as HTMLTextAreaElement;
    this.playButton = document.getElementById('btnPlay') as HTMLButtonElement;
    this.stopButton = document.getElementById('btnStop') as HTMLButtonElement;
    this.saveButton = document.getElementById('btnSave') as HTMLButtonElement | null;
    this.clearButton = document.getElementById('btnClear') as HTMLButtonElement | null;
    this.rateSlider = document.getElementById('rate') as HTMLInputElement;
    this.rateSelect = document.getElementById('rateSelect') as HTMLSelectElement | null;
    this.rateValue = document.getElementById('rateValue') as HTMLElement;

    this.narrowViewportQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 639px)')
      : null;

    // Aguardar carregamento completo da página antes de criar o modal
    if (document.readyState === 'complete') {
      this.pageLoaded = true;
    } else {
      window.addEventListener('load', () => {
        this.pageLoaded = true;
      });
    }
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
    this.stopButton.addEventListener('click', () => this.handleStop());
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
      if (event.key === 'Escape' && this.donationModal && !this.donationModal.classList.contains('opacity-0')) {
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

  private handleStop(): void {
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
        // Só mostrar modal após página estar carregada
        if (this.pageLoaded) {
          this.deps.window.setTimeout(() => this.showDonationModal(), 500);
        } else {
          this.deps.window.addEventListener('load', () => {
            this.deps.window.setTimeout(() => this.showDonationModal(), 500);
          }, { once: true });
        }
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
    this.stopButton.disabled = !playing;

    if (this.clearButton) {
      this.clearButton.disabled = playing || this.textArea.value.trim().length === 0;
    }

    if (this.saveButton) {
      this.saveButton.disabled = true;
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

  private createDonationModal(): HTMLElement {
    const modal = this.deps.document.createElement('div');
    modal.id = 'donationModal';
    modal.className = 'hidden inset-0 z-50 flex items-center justify-center p-4 pointer-events-none opacity-0 transition-opacity duration-300';

    const overlay = this.deps.document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/40 backdrop-blur-sm';
    overlay.setAttribute('data-close-donation', 'true');

    const modalContent = this.deps.document.createElement('div');
    modalContent.className = 'relative bg-white/75 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 max-w-md w-full pointer-events-auto transform scale-95 transition-transform duration-300';

    const closeButton = this.deps.document.createElement('button');
    closeButton.setAttribute('data-close-donation', 'true');
    closeButton.className = 'absolute top-4 right-4 text-primary hover:opacity-70 transition-opacity';
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>';

    const content = this.deps.document.createElement('div');
    content.className = 'text-center space-y-4';

    const heartIcon = this.deps.document.createElement('div');
    heartIcon.className = 'flex justify-center';
    heartIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-primary" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" /></svg>';

    const qrContainer = this.deps.document.createElement('div');
    qrContainer.className = 'flex justify-center';
    const qrPlaceholder = this.deps.document.createElement('div');
    qrPlaceholder.id = 'qrCodePlaceholder';
    qrPlaceholder.className = 'w-48 h-48 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center p-3 overflow-hidden';
    qrPlaceholder.innerHTML = '<span class="sr-only">QR Code do PIX</span><div aria-hidden="true" class="w-full h-full rounded-md border border-dashed border-white/40 flex items-center justify-center text-xs font-semibold text-primary/70">QR Code</div>';
    qrContainer.appendChild(qrPlaceholder);

    const title = this.deps.document.createElement('h2');
    title.className = 'text-2xl font-bold text-primary';
    title.textContent = 'Gostou do Leitor de Texto?';

    const description = this.deps.document.createElement('p');
    description.className = 'text-sm text-primary opacity-90';
    description.textContent = 'Se este projeto foi útil para você, considere fazer uma doação para apoiar o desenvolvimento contínuo.';

    const buttonContainer = this.deps.document.createElement('div');
    buttonContainer.className = 'flex justify-center pt-2';
    const closeButton2 = this.deps.document.createElement('button');
    closeButton2.setAttribute('data-close-donation', 'true');
    closeButton2.className = 'btn-shine inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/20 backdrop-blur-sm font-semibold border border-white/30 shadow-lg hover:bg-white/30 hover:shadow-xl transition-all duration-200 text-primary';
    closeButton2.textContent = 'Talvez Depois';
    buttonContainer.appendChild(closeButton2);

    content.appendChild(heartIcon);
    content.appendChild(qrContainer);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(buttonContainer);

    modalContent.appendChild(closeButton);
    modalContent.appendChild(content);

    modal.appendChild(overlay);
    modal.appendChild(modalContent);

    this.deps.document.body.appendChild(modal);
    return modal;
  }

  private ensureModalCreated(): void {
    if (!this.donationModal) {
      this.donationModal = this.createDonationModal();
      this.attachDonationTriggers();
    }
  }

  private loadQrCode(): void {
    if (!this.donationModal) return;
    
    if (!this.donationModal.dataset.qrLoaded) {
      const placeholder = this.deps.document.getElementById('qrCodePlaceholder');
      if (placeholder) {
        // Usar requestIdleCallback se disponível, senão usar setTimeout
        const loadQr = () => {
          const qrImg = this.deps.document.createElement('img');
          qrImg.src = '/assets/qr-code.svg';
          qrImg.alt = 'QR Code para doações via PIX';
          qrImg.loading = 'lazy';
          qrImg.decoding = 'async';
          qrImg.width = 192;
          qrImg.height = 192;
          qrImg.className = 'max-w-full max-h-full';
          placeholder.replaceChildren(qrImg);
          this.donationModal!.dataset.qrLoaded = 'true';
        };

        const win = this.deps.window as Window & { requestIdleCallback?: typeof requestIdleCallback };
        if (this.pageLoaded) {
          if (typeof win.requestIdleCallback === 'function') {
            win.requestIdleCallback(loadQr, { timeout: 2000 });
          } else {
            setTimeout(loadQr, 100);
          }
        } else {
          win.addEventListener('load', () => {
            if (typeof win.requestIdleCallback === 'function') {
              win.requestIdleCallback(loadQr, { timeout: 2000 });
            } else {
              setTimeout(loadQr, 100);
            }
          });
        }
      }
    }
  }

  private showDonationModal(): void {
    this.ensureModalCreated();
    if (!this.donationModal) return;

    this.loadQrCode();

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
    if (!this.donationModal) return;

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
