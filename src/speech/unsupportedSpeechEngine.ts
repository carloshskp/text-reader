import { SpeechEngine, SpeechStatus } from './speechEngine.js';

export class UnsupportedSpeechEngine implements SpeechEngine {
  readonly available = false;

  start(): void {}

  pause(): void {}

  stop(): void {}

  setRate(): void {}

  setLanguage(): void {}

  getStatus(): SpeechStatus {
    return 'stopped';
  }

  destroy(): void {}
}
