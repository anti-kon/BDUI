import type { Action } from '@bdui/common';
import type { ComponentNode, WebRendererContext } from '@bdui/defs';
import { getWebComponentRenderer } from '@bdui/defs';

import type { RuntimeStateController } from '../state.js';
import { cssForModifiers, formatValue, renderUnsupportedNode } from './helpers.js';

type CreateContextDeps = {
  document: Document;
  stateController: RuntimeStateController;
  runActions(actions?: Action[]): void;
};

export function createWebContext({ document, stateController, runActions }: CreateContextDeps) {
  let currentContext: WebRendererContext;

  const renderNode = (node: ComponentNode): HTMLElement => {
    const renderer = getWebComponentRenderer(node?.type);
    if (!renderer) {
      return renderUnsupportedNode(document, node);
    }

    return renderer({
      node,
      context: currentContext,
    });
  };

  const renderChildren = (children?: ComponentNode[]): HTMLElement[] => {
    if (!children || children.length === 0) return [];
    return children.map((child) => renderNode(child));
  };

  const context: WebRendererContext = {
    document,
    state: stateController.state,
    runActions,
    renderChild: (child) => renderNode(child),
    renderChildren,
    interpolate: (template) => stateController.interpolate(template),
    format: formatValue,
    utils: {
      cssForModifiers,
    },
  } satisfies WebRendererContext;

  currentContext = context;

  return { context, renderNode } as const;
}
