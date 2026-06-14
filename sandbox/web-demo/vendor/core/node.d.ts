import type { Action } from './action.js';
import type { Expression } from './expr.js';
export type ModifierLength = Expression<number | string>;
export type ModifierColor = Expression<string>;
export type ModifierScalar = Expression<number | string>;
/**
 * Platform-neutral styling and layout hints shared by the base components.
 *
 * Renderers should honour the keys that make sense on their platform and may
 * ignore web-only CSS details. Web renderers can also pass through additional
 * camelCase CSS keys through the open record tail below.
 */
export interface PlatformModifiers {
    readonly role?: 'title' | 'section' | 'muted' | 'success' | string;
    readonly variant?: 'primary' | 'secondary' | string;
    readonly display?: string;
    readonly width?: ModifierLength;
    readonly minWidth?: ModifierLength;
    readonly maxWidth?: ModifierLength;
    readonly height?: ModifierLength;
    readonly minHeight?: ModifierLength;
    readonly maxHeight?: ModifierLength;
    readonly margin?: ModifierLength;
    readonly marginTop?: ModifierLength;
    readonly marginRight?: ModifierLength;
    readonly marginBottom?: ModifierLength;
    readonly marginLeft?: ModifierLength;
    readonly padding?: ModifierLength;
    readonly paddingTop?: ModifierLength;
    readonly paddingRight?: ModifierLength;
    readonly paddingBottom?: ModifierLength;
    readonly paddingLeft?: ModifierLength;
    readonly gap?: ModifierLength;
    readonly rowGap?: ModifierLength;
    readonly columnGap?: ModifierLength;
    readonly align?: 'start' | 'center' | 'end' | 'stretch' | string;
    readonly justify?: 'start' | 'center' | 'end' | 'between' | 'around' | string;
    readonly alignItems?: string;
    readonly justifyContent?: string;
    readonly flex?: ModifierLength;
    readonly flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | string;
    readonly background?: ModifierColor;
    readonly backgroundColor?: ModifierColor;
    readonly color?: ModifierColor;
    readonly border?: Expression<string>;
    readonly borderColor?: ModifierColor;
    readonly borderRadius?: ModifierLength;
    readonly boxShadow?: Expression<string>;
    readonly opacity?: ModifierScalar;
    readonly fontFamily?: Expression<string>;
    readonly fontSize?: ModifierLength;
    readonly fontWeight?: ModifierScalar;
    readonly lineHeight?: ModifierLength;
    readonly textAlign?: 'left' | 'center' | 'right' | 'start' | 'end' | string;
    readonly letterSpacing?: ModifierLength;
    readonly style?: Readonly<Record<string, Expression<string | number> | null | undefined>>;
    readonly testId?: string;
    readonly accessibilityLabel?: string;
}
/** Open-ended modifiers bag (styles, layout hints, analytics hooks). */
export type Modifiers = Readonly<PlatformModifiers & Record<string, unknown>>;
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
}
export type BDUIElement = BDUIElementRegistry extends Record<string, infer V> ? V extends NodeBase<string, unknown> ? V : NodeBase : NodeBase;
export declare function isNodeBase(value: unknown): value is NodeBase;
//# sourceMappingURL=node.d.ts.map