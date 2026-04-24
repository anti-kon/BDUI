export class EventBus {
    listeners = new Map();
    on(event, listener) {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(listener);
        return () => {
            set?.delete(listener);
        };
    }
    emit(event, payload) {
        const set = this.listeners.get(event);
        if (!set)
            return;
        for (const listener of Array.from(set)) {
            try {
                listener(payload);
            }
            catch (error) {
                if (typeof console !== 'undefined') {
                    console.error('[runtime/events] listener threw:', error);
                }
            }
        }
    }
    clear() {
        this.listeners.clear();
    }
}
//# sourceMappingURL=events.js.map