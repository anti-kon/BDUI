import type { Navigation as NavigationType } from '@bdui/core';
import type { AnyDslNode } from './shared.js';
export interface NavigationProps {
    initialRoute: string;
    urlSync?: boolean;
    children?: AnyDslNode | readonly AnyDslNode[] | null | undefined | false;
}
export declare function Navigation({ initialRoute, urlSync, children }: NavigationProps): import("./shared.js").DslNode<"Navigation", NavigationType>;
//# sourceMappingURL=navigation.d.ts.map