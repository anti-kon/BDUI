import type { AppRoute, Navigation as NavigationConfig } from '@bdui/core';
import { type Unsubscribe } from './events.js';
export interface NavigationEventMap {
    change: {
        readonly from: string | null;
        readonly to: string;
        readonly mode: 'push' | 'replace';
    };
    back: {
        readonly to: string;
    };
}
export interface NavigationController {
    readonly currentRoute: string;
    readonly routes: readonly AppRoute[];
    resolve(routeId: string): AppRoute | undefined;
    navigate(to: string, mode?: 'push' | 'replace'): boolean;
    replace(to: string): boolean;
    back(): boolean;
    popToRoot(): boolean;
    sync(routeId?: string | null): boolean;
    on<K extends keyof NavigationEventMap>(event: K, listener: (payload: NavigationEventMap[K]) => void): Unsubscribe;
}
export declare function createNavigationController(navigation: NavigationConfig): NavigationController;
export declare function isFlow(route: AppRoute): boolean;
export declare function isScreen(route: AppRoute): boolean;
//# sourceMappingURL=navigation.d.ts.map