import { EventBus } from './events.js';
export function createModalController() {
    const bus = new EventBus();
    const openSet = new Set();
    return {
        open(id) {
            if (openSet.has(id))
                return;
            openSet.add(id);
            bus.emit('open', { id });
        },
        close(id) {
            if (!openSet.delete(id))
                return;
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
//# sourceMappingURL=modal.js.map