import type { BDUIElement } from '@bdui/core';
type ModifierValueResolver = (value: unknown) => unknown;
export declare function cssForModifiers(modifiers: Readonly<Record<string, unknown>> | undefined, resolveValue?: ModifierValueResolver): Record<string, string>;
export declare function renderUnsupported(doc: Document, node: BDUIElement): HTMLElement;
export declare function formatValue(value: unknown): string;
export {};
//# sourceMappingURL=dom-utils.d.ts.map