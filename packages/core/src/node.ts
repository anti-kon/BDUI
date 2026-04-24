import type { Action } from './action.js';

/** Open-ended modifiers bag (styles, layout hints). */
export type Modifiers = Readonly<Record<string, unknown>>;

/**
 * Base shape every BDUI node shares. Parameterised over concrete type
 * discriminator and props so new components can plug in via module augmentation
 * without modifying the core.
 */
export interface NodeBase<TType extends string = string, TProps = unknown> {
  readonly type: TType;
  readonly id?: string;
  readonly modifiers?: Modifiers;
  readonly onAction?: readonly Action[];
  readonly children?: readonly BDUIElement[];
  readonly props?: TProps;
}

/**
 * Open-ended BDUI element. Concrete node shapes are supplied either inline
 * by packages that define components (manifests extending this type) or via
 * TypeScript module augmentation of `BDUIElementRegistry`.
 */
export interface BDUIElementRegistry {
  // Intentionally empty. Extended via module augmentation.
}

export type BDUIElement =
  BDUIElementRegistry extends Record<string, infer V>
    ? V extends NodeBase<string, unknown>
      ? V
      : NodeBase
    : NodeBase;

export function isNodeBase(value: unknown): value is NodeBase {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { type?: unknown }).type === 'string'
  );
}
