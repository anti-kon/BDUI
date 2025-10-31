import type { WebRendererContext } from '../registry/types.js';
export declare function withWebContext<T>(context: WebRendererContext, render: () => T): T;
export declare function getWebContext(): WebRendererContext;
