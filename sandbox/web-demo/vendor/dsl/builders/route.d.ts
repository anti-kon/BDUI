import type { BDUIElement, RouteScreen } from './shared.js';
import { type Maybe } from './shared.js';
type RouteProps = {
  id: string;
  title?: string;
  path?: string;
  cache?: Record<string, unknown>;
  children?: Maybe<BDUIElement | BDUIElement[]>;
};
export declare function Route({
  id,
  title,
  path,
  cache,
  children,
}: RouteProps): import('./shared.js').DslNode<'Route', RouteScreen>;
export {};
