import { EventBus, type Unsubscribe } from './events.js';

export interface ModalEventMap {
  open: { readonly id: string };
  close: { readonly id: string };
}

export interface ModalController {
  open(id: string): void;
  close(id: string): void;
  isOpen(id: string): boolean;
  readonly openIds: readonly string[];
  on<K extends keyof ModalEventMap>(
    event: K,
    listener: (payload: ModalEventMap[K]) => void,
  ): Unsubscribe;
}

export function createModalController(): ModalController {
  const bus = new EventBus<ModalEventMap>();
  const openSet = new Set<string>();

  return {
    open(id) {
      if (openSet.has(id)) return;
      openSet.add(id);
      bus.emit('open', { id });
    },
    close(id) {
      if (!openSet.delete(id)) return;
      bus.emit('close', { id });
    },
    isOpen: (id) => openSet.has(id),
    get openIds() {
      return Array.from(openSet);
    },
    on(event, listener) {
      return bus.on(event, listener);
    },
  };
}
