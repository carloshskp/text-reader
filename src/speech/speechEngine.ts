export type SpeechStatus = 'started' | 'paused' | 'stopped' | 'queued';

export interface SpeechEngineEvents {
  onStatusChange?: (status: SpeechStatus) => void;
  onError?: () => void;
}

export interface SpeechEngine {
  readonly available: boolean;
  start(text: string): void;
  pause(): void;
  stop(): void;
  setRate(rate: number): void;
  setLanguage(language: string): void;
  getStatus(): SpeechStatus;
  destroy(): void;
}
