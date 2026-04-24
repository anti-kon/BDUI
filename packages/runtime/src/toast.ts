import { EventBus, type Unsubscribe } from './events.js';

export interface ToastPayload {
  readonly id: string;
  readonly message: string;
  readonly level: 'info' | 'success' | 'warning' | 'error';
  readonly durationMs: number;
  readonly timestamp: number;
}

export interface ToastEventMap {
  show: ToastPayload;
  dismiss: { readonly id: string };
}

export interface ToastController {
  show(args: {
    readonly message: string;
    readonly level?: 'info' | 'success' | 'warning' | 'error';
    readonly durationMs?: number;
  }): string;
  dismiss(id: string): void;
  readonly active: readonly ToastPayload[];
  on<K extends keyof ToastEventMap>(
    event: K,
    listener: (payload: ToastEventMap[K]) => void,
  ): Unsubscribe;
}

export function createToastController(): ToastController {
  const bus = new EventBus<ToastEventMap>();
  const active = new Map<string, ToastPayload>();
  let seq = 0;

  return {
    show({ message, level = 'info', durationMs = 4000 }) {
      const id = `toast_${++seq}`;
      const payload: ToastPayload = {
        id,
        message,
        level,
        durationMs,
        timestamp: Date.now(),
      };
      active.set(id, payload);
      bus.emit('show', payload);
      if (durationMs > 0 && typeof globalThis.setTimeout === 'function') {
        globalThis.setTimeout(() => {
          if (active.delete(id)) bus.emit('dismiss', { id });
        }, durationMs);
      }
      return id;
    },
    dismiss(id) {
      if (active.delete(id)) bus.emit('dismiss', { id });
    },
    get active() {
      return Array.from(active.values());
    },
    on(event, listener) {
      return bus.on(event, listener);
    },
  };
}
