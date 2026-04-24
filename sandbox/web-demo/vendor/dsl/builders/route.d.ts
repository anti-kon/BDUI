import type { BDUIElement, RouteScreen } from '@bdui/core';
import { type Maybe } from './shared.js';
export interface RouteProps {
    id: string;
    title?: string;
    path?: string;
    cache?: Readonly<Record<string, unknown>>;
    children?: Maybe<BDUIElement | readonly BDUIElement[]>;
}
export declare function Route({ id, title, path, cache, children }: RouteProps): import("./shared.js").DslNode<"Route", RouteScreen>;
//# sourceMappingURL=route.d.ts.map