import type { AnyDslNode, DslNode, FlowRouteScreen } from './shared.js';
type FlowRouteProps = {
  id: string;
  title?: string;
  startStep: string;
  persistence?: Record<string, unknown>;
  children?: AnyDslNode | AnyDslNode[] | null | undefined | false;
};
export declare function FlowRoute({
  id,
  title,
  startStep,
  persistence,
  children,
}: FlowRouteProps): DslNode<'FlowRoute', FlowRouteScreen>;
export {};
