import type { Action, BDUIElement, Modifiers } from '@bdui/core';

import type { ComponentManifest } from '../define.js';

export type RendererPlatform = 'web' | 'android' | 'ios';

/** Shape of a BDUI node as seen by a renderer. */
export interface ComponentNode<TProps = unknown> {
  readonly type: string;
  readonly id?: string;
  readonly children?: readonly BDUIElement[];
  readonly modifiers?: Modifiers;
  readonly onAction?: readonly Action[];
  readonly props?: TProps;
}

export interface ComponentRendererParams<TNode extends ComponentNode, TContext> {
  readonly node: TNode;
  readonly context: TContext;
}

/** CSS style object: a flat map of camelCase CSS properties. */
export type CSSStyle = Readonly<Record<string, string | number | undefined>>;

/** Capabilities a web renderer can use while producing DOM. */
export interface WebRendererContext {
  readonly document: Document;
  readonly state: unknown;
  runActions(actions: readonly Action[] | undefined): void;
  renderChild(child: BDUIElement): HTMLElement;
  renderChildren(children: readonly BDUIElement[] | undefined): HTMLElement[];
  interpolate(template: string): string;
  format(value: unknown): string;
  resolve(value: unknown): unknown;
  readAt(scope: 'local' | 'session' | 'flow', path: string): unknown;
  writeAt(scope: 'local' | 'session' | 'flow', path: string, value: unknown): void;
  readonly utils: {
    cssForModifiers(modifiers?: Modifiers): CSSStyle;
  };
}

export type WebComponentRenderer<TNode extends ComponentNode = ComponentNode> = (
  params: ComponentRendererParams<TNode, WebRendererContext>,
) => HTMLElement;

/** Native renderer extension points used by platform-specific packages. */
export interface AndroidRendererContext {
  readonly platform: 'android';
}

export type AndroidComponentRenderer<TNode extends ComponentNode = ComponentNode> = (
  params: ComponentRendererParams<TNode, AndroidRendererContext>,
) => unknown;

export interface IosRendererContext {
  readonly platform: 'ios';
}

export type IosComponentRenderer<TNode extends ComponentNode = ComponentNode> = (
  params: ComponentRendererParams<TNode, IosRendererContext>,
) => unknown;

export interface ComponentDefinition<TNode extends ComponentNode = ComponentNode> {
  readonly manifest: ComponentManifest;
  readonly renderers: {
    readonly web?: WebComponentRenderer<TNode>;
    readonly android?: AndroidComponentRenderer<TNode>;
    readonly ios?: IosComponentRenderer<TNode>;
  };
}
