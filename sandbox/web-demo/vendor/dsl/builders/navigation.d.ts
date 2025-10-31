import type { AnyDslNode, NavigationType } from './shared.js';
type NavigationProps = {
  initialRoute: string;
  urlSync?: boolean;
  children?: AnyDslNode | AnyDslNode[] | null | undefined | false;
};
export declare function Navigation({
  initialRoute,
  urlSync,
  children,
}: NavigationProps): import('./shared.js').DslNode<'Navigation', NavigationType>;
export {};
