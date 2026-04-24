import type { BDUIElement, FlowRouteScreen, RouteScreen } from '@bdui/core';
import type { ModalController } from './modal.js';
import type { NavigationController } from './navigation.js';
import type { RuntimeStateController } from './state.js';
import type { ToastController } from './toast.js';
/**
 * A platform-specific renderer plugin. The runtime is platform agnostic; the
 * plugin is responsible for translating the declarative node tree to the
 * native widget hierarchy (DOM, native views, etc.).
 */
export interface RendererPluginContext {
    readonly state: RuntimeStateController;
    readonly navigation: NavigationController;
    readonly toast: ToastController;
    readonly modal: ModalController;
    readonly runActions: (actions: readonly unknown[] | undefined) => Promise<void>;
}
export interface RendererPlugin<TRoot = unknown> {
    readonly name: string;
    mount(root: TRoot, context: RendererPluginContext): void;
    renderScreen(route: RouteScreen, context: RendererPluginContext): void;
    renderFlow(route: FlowRouteScreen, context: RendererPluginContext): void;
    renderNode?(node: BDUIElement, context: RendererPluginContext): unknown;
    unmount?(): void;
}
//# sourceMappingURL=plugin.d.ts.map