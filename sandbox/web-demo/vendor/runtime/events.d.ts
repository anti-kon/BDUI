export type Unsubscribe = () => void;
export declare class EventBus<TEventMap> {
    private readonly listeners;
    on<K extends keyof TEventMap>(event: K, listener: (payload: TEventMap[K]) => void): Unsubscribe;
    emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void;
    clear(): void;
}
//# sourceMappingURL=events.d.ts.map