import type { Contract } from '@bdui/core';
import { type HttpClient, type Runtime, type StorageAdapter } from '@bdui/runtime';
export interface MountOptions {
    readonly urlSync?: boolean;
    readonly storage?: StorageAdapter;
    readonly http?: HttpClient;
    readonly prefetchScreens?: (screens: readonly string[]) => Promise<void> | void;
}
export interface MountedApp {
    readonly runtime: Runtime;
    readonly dispose: () => void;
}
export declare function mount(container: HTMLElement, contract: Contract, options?: MountOptions): MountedApp;
//# sourceMappingURL=mount.d.ts.map