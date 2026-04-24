import { Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { IMAGE_CLASS } from './styles.js';

export interface ImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'eager' | 'lazy';
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export type ImageNode = ComponentNode<ImageProps> & ImageProps;

export const manifest = Component({
  name: 'Image',
  props: props<ImageProps>('ImageProps'),
  events: [],
});

function sizeValue(v: number | string | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

const webRenderer: WebComponentRenderer<ImageNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const src = typeof node.src === 'string' ? context.interpolate(node.src) : '';
    const alt = typeof node.alt === 'string' ? context.interpolate(node.alt) : '';
    const styles = {
      ...context.utils.cssForModifiers(node.modifiers),
      ...(node.fit ? { objectFit: node.fit } : {}),
      ...(node.width != null ? { width: sizeValue(node.width) } : {}),
      ...(node.height != null ? { height: sizeValue(node.height) } : {}),
    } as Record<string, string | number>;

    return (
      <img
        className={IMAGE_CLASS}
        src={src}
        alt={alt}
        loading={node.loading ?? 'lazy'}
        style={styles}
      />
    );
  });

export const definition: ComponentDefinition<ImageNode> = {
  manifest,
  renderers: { web: webRenderer },
};

export default definition;
