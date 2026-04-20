import { SpeechEngine, SpeechEngineEvents } from './speechEngine.js';
import { NativeSpeechEngine } from './nativeSpeechEngine.js';
import { UnsupportedSpeechEngine } from './unsupportedSpeechEngine.js';

interface CreateSpeechEngineOptions extends SpeechEngineEvents {
  window: Window;
  document: Document;
  language: string;
  rate: number;
}

export function createSpeechEngine(options: CreateSpeechEngineOptions): SpeechEngine {
  const hasSpeechApi = typeof options.window.speechSynthesis !== 'undefined';

  if (!hasSpeechApi) {
    return new UnsupportedSpeechEngine();
  }

  return new NativeSpeechEngine({
    window: options.window,
    language: options.language,
    rate: options.rate,
    onError: options.onError,
    onStatusChange: options.onStatusChange
  });
}
