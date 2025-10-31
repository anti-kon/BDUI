import type { WebRendererContext } from '../types.js';
export declare function withWebContext<T>(context: WebRendererContext, render: () => T): T;
export declare function getWebContext(): WebRendererContext;
export type StyleValue = string | number;
export type StyleRecord = Record<string, StyleValue>;
export declare function composeStyles(
  ...styles: Array<StyleRecord | null | undefined | false>
): Record<string, StyleValue>;
