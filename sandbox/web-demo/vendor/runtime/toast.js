import { EventBus } from './events.js';
export function createToastController() {
    const bus = new EventBus();
    const active = new Map();
    let seq = 0;
    return {
        show({ message, level = 'info', durationMs = 4000 }) {
            const id = `toast_${++seq}`;
            const payload = {
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
                    if (active.delete(id))
                        bus.emit('dismiss', { id });
                }, durationMs);
            }
            return id;
        },
        dismiss(id) {
            if (active.delete(id))
                bus.emit('dismiss', { id });
        },
        get active() {
            return Array.from(active.values());
        },
        on(event, listener) {
            return bus.on(event, listener);
        },
    };
}
//# sourceMappingURL=toast.js.map