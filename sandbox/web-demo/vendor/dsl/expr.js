import { encodeExpr, exprRef } from '@bdui/core';
/** Author an expression. Aliased to `exprRef` from the core; kept for readability. */
export function E(code) {
    return exprRef(code);
}
/** Convert a DSL value to its JSON wire representation. */
export function toJsonValue(v) {
    if (v && typeof v === 'object' && v.__bduiExpr === true) {
        return encodeExpr(v);
    }
    return v;
}
//# sourceMappingURL=expr.js.map