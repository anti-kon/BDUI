export type Unsubscribe = () => void;

export class EventBus<TEventMap> {
  private readonly listeners = new Map<
    keyof TEventMap,
    Set<(payload: TEventMap[keyof TEventMap]) => void>
  >();

  on<K extends keyof TEventMap>(event: K, listener: (payload: TEventMap[K]) => void): Unsubscribe {
    let set = this.listeners.get(event) as Set<(payload: TEventMap[K]) => void> | undefined;
    if (!set) {
      set = new Set();
      this.listeners.set(
        event,
        set as unknown as Set<(payload: TEventMap[keyof TEventMap]) => void>,
      );
    }
    set.add(listener);
    return () => {
      set?.delete(listener);
    };
  }

  emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void {
    const set = this.listeners.get(event) as Set<(payload: TEventMap[K]) => void> | undefined;
    if (!set) return;
    for (const listener of Array.from(set)) {
      try {
        listener(payload);
      } catch (error) {
        if (typeof console !== 'undefined') {
          console.error('[runtime/events] listener threw:', error);
        }
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
