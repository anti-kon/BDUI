import { children, Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';

export interface IfProps {
  condition: unknown;
}

export type IfNode = ComponentNode<IfProps> & IfProps;

export const manifest = Component({
  name: 'If',
  props: props<IfProps>('IfProps'),
  children: children().nodes(),
  events: [],
});

const webRenderer: WebComponentRenderer<IfNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const resolved = context.resolve(node.condition);
    const show = Boolean(resolved);
    const doc = context.document;

    if (!show) {
      const placeholder = doc.createElement('template');
      placeholder.setAttribute('data-bdui-if', 'hidden');
      return placeholder as unknown as HTMLElement;
    }

    const fragmentHost = doc.createElement('div');
    fragmentHost.setAttribute('data-bdui-if', 'visible');
    fragmentHost.style.display = 'contents';
    for (const child of context.renderChildren(node.children)) {
      fragmentHost.appendChild(child);
    }
    return fragmentHost;
  });

export const definition: ComponentDefinition<IfNode> = {
  manifest,
  renderers: { web: webRenderer },
};

export default definition;
