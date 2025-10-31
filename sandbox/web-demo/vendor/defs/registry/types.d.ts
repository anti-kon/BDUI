import type { ComponentManifest } from '../define.js';
export type RendererPlatform = 'web' | 'android';
export type ComponentNode<TProps extends Record<string, unknown> = Record<string, unknown>> =
  TProps & {
    type: string;
    id?: string;
    children?: ComponentNode[];
    modifiers?: Record<string, unknown>;
  };
export type ComponentRendererParams<TNode extends ComponentNode, TContext> = {
  node: TNode;
  context: TContext;
};
export type WebRendererContext = {
  document: Document;
  state: unknown;
  runActions(actions?: any[]): void;
  renderChild(child: ComponentNode): HTMLElement;
  renderChildren(children?: ComponentNode[]): HTMLElement[];
  interpolate(template: string): string;
  format(value: unknown): string;
  utils: {
    cssForModifiers(modifiers?: Record<string, unknown>): Partial<CSSStyleDeclaration>;
  };
};
export type WebComponentRenderer<TNode extends ComponentNode = ComponentNode> = (
  params: ComponentRendererParams<TNode, WebRendererContext>,
) => HTMLElement;
export type AndroidRendererContext = {
  platform: 'android';
};
export type AndroidComponentRenderer<TNode extends ComponentNode = ComponentNode> = (
  params: ComponentRendererParams<TNode, AndroidRendererContext>,
) => unknown;
export type ComponentDefinition<TNode extends ComponentNode = ComponentNode> = {
  manifest: ComponentManifest;
  renderers: Partial<{
    web: WebComponentRenderer<TNode>;
    android: AndroidComponentRenderer<TNode>;
  }>;
};
