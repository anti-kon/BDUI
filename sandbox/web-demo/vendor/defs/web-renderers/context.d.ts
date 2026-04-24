import type { WebRendererContext } from '../registry/types.js';
export type StyleRecord = Record<string, string | number | undefined>;
export declare function withWebContext<T>(context: WebRendererContext, render: () => T): T;
export declare function getWebContext(): WebRendererContext;
//# sourceMappingURL=context.d.ts.map