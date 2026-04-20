import React, { useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useSpeech } from 'react-text-to-speech';
import { clampRate } from '../core/rate.js';
import { SpeechEngine, SpeechEngineEvents, SpeechStatus } from './speechEngine.js';

type Command =
  | { type: 'start'; id: number; text: string }
  | { type: 'pause'; id: number }
  | { type: 'stop'; id: number }
  | null;

interface SpeechBridgeProps extends SpeechEngineEvents {
  text: string;
  lang: string;
  rate: number;
  command: Command;
}

function SpeechBridge({ text, lang, rate, command, onError, onStatusChange }: SpeechBridgeProps): React.ReactElement {
  const { speechStatus, isInQueue, start, pause, stop } = useSpeech({
    text,
    lang,
    rate,
    preserveUtteranceQueue: false,
    onError
  });

  useEffect(() => {
    if (speechStatus === 'started' || speechStatus === 'paused' || speechStatus === 'stopped') {
      onStatusChange?.(speechStatus);
      return;
    }

    if (isInQueue) {
      onStatusChange?.('queued');
    }
  }, [isInQueue, onStatusChange, speechStatus]);

  useEffect(() => {
    if (!command) return;

    if (command.type === 'start') {
      start();
    }

    if (command.type === 'pause') {
      pause();
    }

    if (command.type === 'stop') {
      stop();
    }
  }, [command, pause, start, stop]);

  return React.createElement(React.Fragment);
}

interface RttsSpeechEngineOptions extends SpeechEngineEvents {
  document: Document;
  language: string;
  rate: number;
}

export class RttsSpeechEngine implements SpeechEngine {
  private readonly host: HTMLElement;
  private readonly root: Root;
  private status: SpeechStatus = 'stopped';
  private text = '';
  private lang: string;
  private rate: number;
  private commandId = 0;
  private command: Command = null;

  readonly available = true;

  constructor(private readonly options: RttsSpeechEngineOptions) {
    this.lang = options.language;
    this.rate = clampRate(options.rate);
    this.host = options.document.createElement('div');
    this.host.id = 'speech-engine-host';
    this.host.hidden = true;
    options.document.body.appendChild(this.host);
    this.root = createRoot(this.host);
    this.render();
  }

  start(text: string): void {
    this.text = text;
    this.command = { type: 'start', id: ++this.commandId, text };
    this.render();
  }

  pause(): void {
    this.command = { type: 'pause', id: ++this.commandId };
    this.render();
  }

  stop(): void {
    this.command = { type: 'stop', id: ++this.commandId };
    this.render();
  }

  setRate(rate: number): void {
    this.rate = clampRate(rate);
    this.render();
  }

  setLanguage(language: string): void {
    this.lang = language;
    this.render();
  }

  getStatus(): SpeechStatus {
    return this.status;
  }

  destroy(): void {
    this.root.unmount();
    this.host.remove();
  }

  private render(): void {
    this.root.render(React.createElement(SpeechBridge, {
      text: this.text,
      lang: this.lang,
      rate: this.rate,
      command: this.command,
      onError: this.options.onError,
      onStatusChange: (status) => {
        this.status = status;
        this.options.onStatusChange?.(status);
      }
    }));
  }
}
